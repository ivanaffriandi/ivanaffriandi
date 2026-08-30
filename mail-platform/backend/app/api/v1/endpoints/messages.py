from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import FileResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
import uuid
import os
import base64
import re
from email.utils import parseaddr
from datetime import datetime, timezone, timedelta

from app.core.db import get_db
from app.core.config import settings
from app.models.user import User
from app.models.mailbox import Mailbox, MailboxType
from app.models.message import Message, Attachment
from app.schemas.mail_schemas import MessageSummary, MessageDetail, SendMessageRequest, AttachmentResponse
from app.services.sanitizer_service import sanitize_email_html
from app.services.threading_service import resolve_or_create_thread
from app.services.smtp_service import send_outbound_email
from app.services.mime_parser import parse_raw_mime
from app.services.user_service import get_or_create_primary_user

STORAGE_DIR = os.environ.get("STORAGE_DIR", "/app/storage")
ATTACHMENTS_DIR = os.path.join(STORAGE_DIR, "attachments")
os.makedirs(ATTACHMENTS_DIR, exist_ok=True)

router = APIRouter(prefix="/messages", tags=["Messages"])

def extract_clean_email(raw_addr: str) -> str:
    """Extracts a clean email address from string, supporting Name <email@domain.com> format."""
    if not raw_addr:
        return ""
    _, addr = parseaddr(raw_addr)
    if addr and "@" in addr:
        return addr.strip()
    match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', raw_addr)
    if match:
        return match.group(0).strip()
    return raw_addr.strip()

async def get_or_create_mailbox(db: AsyncSession, user_id: uuid.UUID, box_type: str, box_name: str) -> Mailbox:
    stmt = select(Mailbox).where(Mailbox.user_id == user_id, Mailbox.type == box_type)
    res = await db.execute(stmt)
    box = res.scalar_one_or_none()
    if not box:
        box = Mailbox(user_id=user_id, name=box_name, type=box_type)
        db.add(box)
        await db.flush()
    return box

@router.get("/track/{tracking_token}")
async def track_message_open(
    tracking_token: str,
    db: AsyncSession = Depends(get_db)
):
    """Records email read receipt when recipient opens the email."""
    # 1x1 transparent GIF bytes
    GIF_1X1 = b'GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'
    if tracking_token:
        stmt = select(Message).where(Message.tracking_token == tracking_token)
        res = await db.execute(stmt)
        msg = res.scalar_one_or_none()
        if msg:
            msg.is_opened = True
            msg.open_count = (msg.open_count or 0) + 1
            if not msg.opened_at:
                msg.opened_at = datetime.now(timezone.utc)
            await db.commit()
    return Response(
        content=GIF_1X1,
        media_type="image/gif",
        headers={
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0, proxy-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        }
    )

@router.get("", response_model=List[MessageSummary])
async def list_messages(
    folder_id: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Lists messages in a specific folder or default inbox, auto-purging trash older than 30 days."""
    user = await get_or_create_primary_user(db)

    # Auto-purge trash messages older than 30 days
    trash_box = await get_or_create_mailbox(db, user.id, MailboxType.TRASH, "Trash")
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    purge_stmt = select(Message).where(Message.mailbox_id == trash_box.id, Message.date < thirty_days_ago)
    res_purge = await db.execute(purge_stmt)
    old_trash_msgs = res_purge.scalars().all()
    for old_msg in old_trash_msgs:
        await db.delete(old_msg)
    if old_trash_msgs:
        await db.commit()

    stmt = select(Message).where(Message.user_id == user.id)

    if folder_id:
        folder_lower = folder_id.strip().lower()
        if folder_lower == "starred":
            stmt = stmt.where(Message.is_starred == True, Message.mailbox_id != trash_box.id)
        elif folder_lower == "snoozed":
            # Safely handle snoozed (currently no snoozed messages)
            stmt = stmt.where(Message.id == None)
        elif folder_lower == "unread":
            stmt = stmt.where(Message.is_read == False, Message.mailbox_id != trash_box.id)
        elif folder_lower in ["inbox", "sent", "drafts", "trash", "spam", "archive"]:
            box_type_map = {
                "inbox": (MailboxType.INBOX, "Inbox"),
                "sent": (MailboxType.SENT, "Sent"),
                "drafts": (MailboxType.DRAFTS, "Drafts"),
                "trash": (MailboxType.TRASH, "Trash"),
                "spam": (MailboxType.SPAM, "Spam"),
                "archive": (MailboxType.ARCHIVE, "Archive"),
            }
            b_type, b_name = box_type_map[folder_lower]
            target_box = await get_or_create_mailbox(db, user.id, b_type, b_name)
            stmt = stmt.where(Message.mailbox_id == target_box.id)
        else:
            try:
                target_mailbox_id = uuid.UUID(folder_id)
                stmt = stmt.where(Message.mailbox_id == target_mailbox_id)
            except ValueError:
                # Graceful fallback to Inbox for unrecognized folder strings
                inbox_box = await get_or_create_mailbox(db, user.id, MailboxType.INBOX, "Inbox")
                stmt = stmt.where(Message.mailbox_id == inbox_box.id)
    else:
        inbox_box = await get_or_create_mailbox(db, user.id, MailboxType.INBOX, "Inbox")
        stmt = stmt.where(Message.mailbox_id == inbox_box.id)

    offset = (page - 1) * limit
    stmt = stmt.order_by(Message.date.desc()).offset(offset).limit(limit)

    results = await db.execute(stmt)
    messages = results.scalars().all()

    def extract_snippet(text: str) -> str:
        if not text:
            return ""
        if "<" in text and ">" in text:
            import re, html as html_lib
            c = re.sub(r'<(style|script|head|link|iframe)[^>]*>.*?</\1>', ' ', text, flags=re.DOTALL | re.IGNORECASE)
            c = re.sub(r'<(br|p|div|tr|li|h[1-6])[^>]*>', ' ', c, flags=re.IGNORECASE)
            c = re.sub(r'<[^>]+>', ' ', c)
            text = html_lib.unescape(c)
        return " ".join(text.split()).strip()[:150]

    return [
        MessageSummary(
            id=msg.id,
            thread_id=msg.thread_id,
            mailbox_id=msg.mailbox_id,
            sender_name=msg.sender_name,
            sender_address=msg.sender_address,
            recipient_to=msg.recipient_to,
            subject=msg.subject,
            date=msg.date,
            snippet=extract_snippet(msg.body_plain or msg.body_html or ""),
            is_read=msg.is_read,
            is_starred=msg.is_starred,
            has_attachments=msg.has_attachments,
            spam_score=float(msg.spam_score or 0.0),
            spam_status=msg.spam_status or "ham",
            is_opened=bool(msg.is_opened),
            opened_at=msg.opened_at,
            open_count=int(msg.open_count or 0)
        )
        for msg in messages
    ]

@router.get("/{message_id}", response_model=MessageDetail)
async def get_message(
    message_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Retrieves full message payload with sanitized HTML and attachments list."""
    stmt = select(Message).options(selectinload(Message.attachments)).where(Message.id == message_id)
    result = await db.execute(stmt)
    msg = result.scalar_one_or_none()

    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    # Mark as read
    if not msg.is_read:
        msg.is_read = True
        # Decrement mailbox unread count
        mb_stmt = select(Mailbox).where(Mailbox.id == msg.mailbox_id)
        mb_res = await db.execute(mb_stmt)
        mb = mb_res.scalar_one_or_none()
        if mb and mb.unread_count > 0:
            mb.unread_count -= 1
        await db.commit()

    # Sanitize HTML body
    clean_html = sanitize_email_html(msg.body_html or "")

    # Load thread conversation history
    thread_msgs = []
    if msg.thread_id:
        t_stmt = (
            select(Message)
            .options(selectinload(Message.attachments))
            .where(Message.thread_id == msg.thread_id)
            .order_by(Message.date.asc())
        )
        t_res = await db.execute(t_stmt)
        raw_thread_msgs = t_res.scalars().all()
        for tm in raw_thread_msgs:
            tm_clean_html = sanitize_email_html(tm.body_html or "")
            thread_msgs.append(
                MessageDetail(
                    id=tm.id,
                    thread_id=tm.thread_id,
                    mailbox_id=tm.mailbox_id,
                    sender_name=tm.sender_name,
                    sender_address=tm.sender_address,
                    recipient_to=tm.recipient_to,
                    recipient_cc=tm.recipient_cc,
                    recipient_bcc=tm.recipient_bcc,
                    message_id_header=tm.message_id_header,
                    in_reply_to_header=tm.in_reply_to_header,
                    references_header=tm.references_header,
                    subject=tm.subject,
                    date=tm.date,
                    snippet=(tm.body_plain or tm.body_html or "")[:150],
                    body_plain=tm.body_plain,
                    body_html=tm_clean_html,
                    is_read=tm.is_read,
                    is_starred=tm.is_starred,
                    has_attachments=tm.has_attachments,
                    spam_score=float(tm.spam_score or 0.0),
                    spam_status=tm.spam_status or "ham",
                    is_opened=bool(tm.is_opened),
                    opened_at=tm.opened_at,
                    open_count=int(tm.open_count or 0),
                    attachments=[
                        AttachmentResponse(
                            id=a.id,
                            filename=a.filename,
                            content_type=a.content_type,
                            size_bytes=a.size_bytes,
                            is_inline=a.is_inline,
                            checksum_sha256=a.checksum_sha256
                        )
                        for a in tm.attachments
                    ],
                    thread_messages=[]
                )
            )

    return MessageDetail(
        id=msg.id,
        thread_id=msg.thread_id,
        mailbox_id=msg.mailbox_id,
        sender_name=msg.sender_name,
        sender_address=msg.sender_address,
        recipient_to=msg.recipient_to,
        recipient_cc=msg.recipient_cc,
        recipient_bcc=msg.recipient_bcc,
        message_id_header=msg.message_id_header,
        in_reply_to_header=msg.in_reply_to_header,
        references_header=msg.references_header,
        subject=msg.subject,
        date=msg.date,
        snippet=(msg.body_plain or msg.body_html or "")[:150],
        body_plain=msg.body_plain,
        body_html=clean_html,
        is_read=msg.is_read,
        is_starred=msg.is_starred,
        has_attachments=msg.has_attachments,
        spam_score=float(msg.spam_score or 0.0),
        spam_status=msg.spam_status or "ham",
        is_opened=bool(msg.is_opened),
        opened_at=msg.opened_at,
        open_count=int(msg.open_count or 0),
        attachments=[
            AttachmentResponse(
                id=a.id,
                filename=a.filename,
                content_type=a.content_type,
                size_bytes=a.size_bytes,
                is_inline=a.is_inline,
                checksum_sha256=a.checksum_sha256
            )
            for a in msg.attachments
        ],
        thread_messages=thread_msgs
    )

@router.patch("/{message_id}/star")
async def toggle_star(
    message_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Toggles starred status on a message."""
    stmt = select(Message).where(Message.id == message_id)
    res = await db.execute(stmt)
    msg = res.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    msg.is_starred = not msg.is_starred
    await db.commit()
    return {"status": "ok", "is_starred": msg.is_starred}

@router.patch("/{message_id}/read")
async def mark_message_read(
    message_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Explicitly marks message as read."""
    stmt = select(Message).where(Message.id == message_id)
    res = await db.execute(stmt)
    msg = res.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    if not msg.is_read:
        msg.is_read = True
        mb_stmt = select(Mailbox).where(Mailbox.id == msg.mailbox_id)
        mb_res = await db.execute(mb_stmt)
        mb = mb_res.scalar_one_or_none()
        if mb and mb.unread_count > 0:
            mb.unread_count -= 1
        await db.commit()

    return {"status": "ok", "is_read": True}

@router.patch("/{message_id}/unread")
async def mark_message_unread(
    message_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Explicitly marks message as unread."""
    stmt = select(Message).where(Message.id == message_id)
    res = await db.execute(stmt)
    msg = res.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    if msg.is_read:
        msg.is_read = False
        mb_stmt = select(Mailbox).where(Mailbox.id == msg.mailbox_id)
        mb_res = await db.execute(mb_stmt)
        mb = mb_res.scalar_one_or_none()
        if mb:
            mb.unread_count += 1
        await db.commit()

    return {"status": "ok", "is_read": False}

@router.patch("/{message_id}/archive")
async def archive_message(
    message_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Moves message to Archive mailbox."""
    user = await get_or_create_primary_user(db)
    archive_box = await get_or_create_mailbox(db, user.id, MailboxType.ARCHIVE, "Archive")

    stmt = select(Message).where(Message.id == message_id, Message.user_id == user.id)
    res = await db.execute(stmt)
    msg = res.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    msg.mailbox_id = archive_box.id
    await db.commit()
    return {"status": "archived", "mailbox_id": str(archive_box.id)}

@router.delete("/{message_id}")
async def move_to_trash_or_delete(
    message_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Soft deletes to Trash if not already in Trash, permanently deletes if already in Trash."""
    user = await get_or_create_primary_user(db)
    trash_box = await get_or_create_mailbox(db, user.id, MailboxType.TRASH, "Trash")

    stmt = select(Message).where(Message.id == message_id, Message.user_id == user.id)
    res = await db.execute(stmt)
    msg = res.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    if msg.mailbox_id == trash_box.id:
        # Permanent delete
        await db.delete(msg)
        await db.commit()
        return {"status": "deleted_permanently"}
    else:
        # Move to Trash
        msg.mailbox_id = trash_box.id
        await db.commit()
        return {"status": "moved_to_trash"}

@router.delete("/trash/empty")
async def empty_trash(
    db: AsyncSession = Depends(get_db)
):
    """Purges all messages currently in the Trash mailbox."""
    user = await get_or_create_primary_user(db)
    trash_box = await get_or_create_mailbox(db, user.id, MailboxType.TRASH, "Trash")

    stmt = select(Message).where(Message.mailbox_id == trash_box.id)
    res = await db.execute(stmt)
    trash_msgs = res.scalars().all()
    count = len(trash_msgs)
    for m in trash_msgs:
        await db.delete(m)
    await db.commit()
    return {"status": "ok", "deleted_count": count}

@router.post("/send", status_code=status.HTTP_201_CREATED)
async def compose_and_send_message(
    send_req: SendMessageRequest,
    db: AsyncSession = Depends(get_db)
):
    """Composes and dispatches outbound email via SMTP / Resend / Postfix."""
    user = await get_or_create_primary_user(db)

    # Clean and parse recipient emails
    clean_to = [extract_clean_email(r) for r in send_req.to if extract_clean_email(r)]
    clean_cc = [extract_clean_email(r) for r in (send_req.cc or []) if extract_clean_email(r)]
    clean_bcc = [extract_clean_email(r) for r in (send_req.bcc or []) if extract_clean_email(r)]

    if not clean_to:
        raise HTTPException(status_code=400, detail="At least one valid recipient email address is required")

    # Find or seed SENT folder
    sent_box = await get_or_create_mailbox(db, user.id, MailboxType.SENT, "Sent")

    # Prepare attachments dictionary
    attachments_dict = [
        {"filename": a.filename, "content_type": a.content_type, "data_base64": a.data_base64}
        for a in (send_req.attachments or [])
    ]

    # Generate unique tracking token for read receipt detection
    tracking_token = uuid.uuid4().hex
    tracking_pixel = f'<img src="https://mail.ivanaffriandi.com/api/v1/messages/track/{tracking_token}" width="1" height="1" style="display:none!important;width:1px;height:1px;border:0;outline:none;" alt="" />'

    if send_req.body_html and send_req.body_html.strip():
        if "</body>" in send_req.body_html.lower():
            idx = send_req.body_html.lower().rfind("</body>")
            outbound_html = send_req.body_html[:idx] + tracking_pixel + send_req.body_html[idx:]
        else:
            outbound_html = send_req.body_html + tracking_pixel
    else:
        outbound_html = f"<div>{(send_req.body_plain or '').replace(chr(10), '<br/>')}</div>" + tracking_pixel

    generated_msg_id = await send_outbound_email(
        sender=user.email,
        recipients=clean_to,
        subject=send_req.subject or "(No Subject)",
        body_html=outbound_html,
        body_plain=send_req.body_plain,
        cc=clean_cc if clean_cc else None,
        bcc=clean_bcc if clean_bcc else None,
        in_reply_to=send_req.in_reply_to,
        attachments=attachments_dict if attachments_dict else None
    )

    # Thread resolution
    thread = await resolve_or_create_thread(
        db, user.id, send_req.subject, generated_msg_id, send_req.in_reply_to, None
    )

    # Create Message Record
    has_att = len(attachments_dict) > 0
    sent_msg = Message(
        user_id=user.id,
        mailbox_id=sent_box.id,
        thread_id=thread.id,
        message_id_header=generated_msg_id,
        in_reply_to_header=send_req.in_reply_to,
        sender_name=user.full_name or "Ivan Affriandi",
        sender_address=user.email,
        recipient_to=", ".join(clean_to),
        recipient_cc=", ".join(clean_cc) if clean_cc else None,
        recipient_bcc=", ".join(clean_bcc) if clean_bcc else None,
        subject=send_req.subject or "(No Subject)",
        date=datetime.now(timezone.utc),
        body_plain=send_req.body_plain,
        body_html=send_req.body_html,
        is_read=True,
        has_attachments=has_att,
        spam_score=0.0,
        spam_status="ham",
        tracking_token=tracking_token,
        is_opened=False,
        opened_at=None,
        open_count=0
    )
    db.add(sent_msg)
    await db.flush()

    # Save attachments
    import hashlib
    for a in (send_req.attachments or []):
        try:
            raw_b = base64.b64decode(a.data_base64)
            csum = hashlib.sha256(raw_b).hexdigest()
            db_att = Attachment(
                message_id=sent_msg.id,
                filename=a.filename,
                content_type=a.content_type,
                size_bytes=len(raw_b),
                checksum_sha256=csum,
                storage_path=f"attachments/{csum}_{a.filename}",
                is_inline=False
            )
            db.add(db_att)
        except Exception:
            pass

    # Update thread count
    thread.message_count += 1
    thread.last_message_at = datetime.now(timezone.utc)
    sent_box.total_count += 1

    await db.commit()

    return {
        "status": "sent",
        "message_id": generated_msg_id,
        "id": str(sent_msg.id),
        "thread_id": str(thread.id)
    }

@router.post("/ingest")
@router.post("/inbound")
async def ingest_inbound_message(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Webhook / Pipe ingestion endpoint for inbound email processed by Postfix."""
    raw_bytes = await request.body()
    content_type = request.headers.get("content-type", "")

    user = await get_or_create_primary_user(db)
    inbox_box = await get_or_create_mailbox(db, user.id, MailboxType.INBOX, "Inbox")
    spam_box = await get_or_create_mailbox(db, user.id, MailboxType.SPAM, "Spam")

    is_spam = False
    spam_score = 0.0

    if "application/json" in content_type:
        payload = await request.json()
        subject = payload.get("subject", "(No Subject)")
        sender_address = payload.get("sender", payload.get("from", "external@domain.com"))
        sender_name = payload.get("sender_name", sender_address.split("<")[0].strip() or sender_address)
        recipient_to = payload.get("recipient", payload.get("recipient_to", user.email))
        body_plain = payload.get("text", payload.get("body_plain", ""))
        body_html = payload.get("html", payload.get("body_html", ""))
        message_id = payload.get("message_id", f"<{uuid.uuid4()}@{settings.PRIMARY_DOMAIN}>")
        in_reply_to = payload.get("in_reply_to")
        references = payload.get("references")
        spam_score = float(payload.get("spam_score", 0.0))
        is_spam = spam_score > 5.0
        attachments_raw = payload.get("attachments", [])
    else:
        # MIME raw parser
        parsed = parse_raw_mime(raw_bytes)
        subject = parsed["subject"]
        sender_name = parsed["sender_name"]
        sender_address = parsed["sender_address"]
        recipient_to = parsed["recipient_to"]
        body_plain = parsed["body_plain"]
        body_html = parsed["body_html"]
        message_id = parsed["message_id"]
        in_reply_to = parsed["in_reply_to"]
        references = parsed["references"]
        attachments_raw = parsed["attachments"]
        is_spam = parsed.get("is_spam", False)
        spam_score = parsed.get("spam_score", 0.0)

    target_mailbox = spam_box if is_spam else inbox_box

    # Resolve conversation thread assignment
    thread = await resolve_or_create_thread(
        db, user.id, subject, message_id, in_reply_to, references
    )

    msg = Message(
        user_id=user.id,
        mailbox_id=target_mailbox.id,
        thread_id=thread.id,
        message_id_header=message_id,
        in_reply_to_header=in_reply_to,
        references_header=references,
        sender_name=sender_name,
        sender_address=sender_address,
        recipient_to=recipient_to,
        subject=subject,
        date=datetime.now(timezone.utc),
        body_plain=body_plain,
        body_html=body_html,
        is_read=False,
        has_attachments=len(attachments_raw) > 0,
        spam_score=spam_score,
        spam_status="spam" if is_spam else "ham"
    )
    db.add(msg)
    await db.flush()

    # Save attachments
    import hashlib
    for att in attachments_raw:
        data_b = att.get("data") or base64.b64decode(att.get("data_base64", ""))
        csum = hashlib.sha256(data_b).hexdigest()
        filename = att.get("filename", "attachment.bin")
        db_att = Attachment(
            message_id=msg.id,
            filename=filename,
            content_type=att.get("content_type", "application/octet-stream"),
            size_bytes=len(data_b),
            checksum_sha256=csum,
            storage_path=f"attachments/{csum}_{filename}",
            is_inline=att.get("is_inline", False)
        )
        db.add(db_att)

    # Update thread metrics
    thread.message_count += 1
    thread.has_unread = True
    thread.last_message_at = datetime.now(timezone.utc)
    thread.snippet = (body_plain or body_html or "")[:150]
    target_mailbox.unread_count += 1
    target_mailbox.total_count += 1

    await db.commit()

    return {"status": "success", "message_id": str(msg.id), "thread_id": str(thread.id)}

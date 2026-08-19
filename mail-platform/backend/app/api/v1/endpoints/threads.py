from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
import uuid

from app.core.db import get_db
from app.models.user import User
from app.models.message import Thread, Message
from app.schemas.mail_schemas import ThreadResponse, MessageSummary
from app.services.user_service import get_or_create_primary_user

router = APIRouter(prefix="/threads", tags=["Threads"])

@router.get("", response_model=List[ThreadResponse])
async def list_threads(db: AsyncSession = Depends(get_db)):
    """Lists conversation threads ordered by latest activity."""
    user = await get_or_create_primary_user(db)

    stmt = select(Thread).where(Thread.user_id == user.id).order_by(Thread.last_message_at.desc()).limit(50)
    results = await db.execute(stmt)
    threads = results.scalars().all()

    return [
        ThreadResponse(
            id=t.id,
            subject=t.subject,
            snippet=t.snippet,
            message_count=t.message_count,
            has_unread=t.has_unread,
            has_attachments=t.has_attachments,
            last_message_at=t.last_message_at,
            messages=[]
        )
        for t in threads
    ]

@router.get("/{thread_id}", response_model=ThreadResponse)
async def get_thread_detail(
    thread_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Retrieves all messages belonging to a single conversation thread."""
    stmt = select(Thread).options(selectinload(Thread.messages)).where(Thread.id == thread_id)
    result = await db.execute(stmt)
    thread = result.scalar_one_or_none()

    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    sorted_messages = sorted(thread.messages, key=lambda m: m.date)

    return ThreadResponse(
        id=thread.id,
        subject=thread.subject,
        snippet=thread.snippet,
        message_count=thread.message_count,
        has_unread=thread.has_unread,
        has_attachments=thread.has_attachments,
        last_message_at=thread.last_message_at,
        messages=[
            MessageSummary(
                id=m.id,
                thread_id=m.thread_id,
                mailbox_id=m.mailbox_id,
                sender_name=m.sender_name,
                sender_address=m.sender_address,
                recipient_to=m.recipient_to,
                subject=m.subject,
                date=m.date,
                snippet=(m.body_plain or m.body_html or "")[:150],
                is_read=m.is_read,
                is_starred=m.is_starred,
                has_attachments=m.has_attachments,
                spam_score=float(m.spam_score or 0.0),
                spam_status=m.spam_status or "ham"
            )
            for m in sorted_messages
        ]
    )

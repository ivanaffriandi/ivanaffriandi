from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid

from app.models.message import Message, Thread

async def resolve_or_create_thread(
    session: AsyncSession,
    user_id: uuid.UUID,
    subject: str,
    message_id: Optional[str],
    in_reply_to: Optional[str],
    references: Optional[str]
) -> Thread:
    """Calculates conversation thread assignment using RFC 5322 In-Reply-To and References headers."""
    thread = None

    # Check In-Reply-To parent message
    if in_reply_to:
        stmt = select(Message).where(Message.message_id_header == in_reply_to.strip(), Message.user_id == user_id)
        result = await session.execute(stmt)
        parent_msg = result.scalar_one_or_none()
        if parent_msg and parent_msg.thread_id:
            stmt_thread = select(Thread).where(Thread.id == parent_msg.thread_id)
            res_thread = await session.execute(stmt_thread)
            thread = res_thread.scalar_one_or_none()

    # Check References list
    if not thread and references:
        ref_ids = [r.strip() for r in references.split() if r.strip()]
        if ref_ids:
            stmt = select(Message).where(Message.message_id_header.in_(ref_ids), Message.user_id == user_id)
            result = await session.execute(stmt)
            ref_msg = result.scalars().first()
            if ref_msg and ref_msg.thread_id:
                stmt_thread = select(Thread).where(Thread.id == ref_msg.thread_id)
                res_thread = await session.execute(stmt_thread)
                thread = res_thread.scalar_one_or_none()

    # Create new thread if no parent match found
    if not thread:
        clean_subject = subject.replace("Re:", "").replace("RE:", "").replace("Fwd:", "").replace("FWD:", "").strip()
        thread = Thread(
            id=uuid.uuid4(),
            user_id=user_id,
            subject=clean_subject or "No Subject",
            snippet="",
            message_count=0,
            has_unread=True,
            has_attachments=False
        )
        session.add(thread)
        await session.flush()

    return thread

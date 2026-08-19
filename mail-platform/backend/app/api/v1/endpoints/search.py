from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any

from app.core.db import get_db
from app.models.user import User
from app.schemas.mail_schemas import SearchRequest, MessageSummary
from app.services.search_service import execute_mailbox_search
from app.services.user_service import get_or_create_primary_user

router = APIRouter(prefix="/search", tags=["Search"])

@router.post("", response_model=Dict[str, Any])
async def search_messages(
    search_req: SearchRequest,
    db: AsyncSession = Depends(get_db)
):
    """Executes full-text search across subject, sender, and email bodies."""
    user = await get_or_create_primary_user(db)
    messages, total = await execute_mailbox_search(db, user.id, search_req)

    items = [
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
        for m in messages
    ]

    return {
        "items": items,
        "total": total,
        "page": search_req.page,
        "limit": search_req.limit
    }

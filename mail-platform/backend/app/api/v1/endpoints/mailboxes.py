from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List

from app.core.db import get_db
from app.models.user import User
from app.models.mailbox import Mailbox, MailboxType
from app.models.message import Message
from app.schemas.mail_schemas import MailboxResponse
from app.services.user_service import get_or_create_primary_user

router = APIRouter(prefix="/folders", tags=["Folders"])

@router.get("", response_model=List[MailboxResponse])
async def list_folders(db: AsyncSession = Depends(get_db)):
    """Lists all user mailboxes with dynamic live unread and total message counts."""
    user = await get_or_create_primary_user(db)

    stmt = select(Mailbox).where(Mailbox.user_id == user.id).order_by(Mailbox.name.asc())
    results = await db.execute(stmt)
    mailboxes = results.scalars().all()

    response_list = []
    for mb in mailboxes:
        # Dynamic unread count
        unread_q = await db.execute(
            select(func.count(Message.id)).where(Message.mailbox_id == mb.id, Message.is_read == False)
        )
        live_unread = unread_q.scalar_one() or 0

        # Dynamic total count
        total_q = await db.execute(
            select(func.count(Message.id)).where(Message.mailbox_id == mb.id)
        )
        live_total = total_q.scalar_one() or 0

        response_list.append(
            MailboxResponse(
                id=mb.id,
                name=mb.name,
                type=str(mb.type.value) if hasattr(mb.type, "value") else str(mb.type),
                unread_count=live_unread,
                total_count=live_total
            )
        )

    return response_list

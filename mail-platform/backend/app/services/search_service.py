from typing import Tuple, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_, and_, text
import uuid

from app.models.message import Message
from app.schemas.mail_schemas import SearchRequest

async def execute_mailbox_search(
    session: AsyncSession,
    user_id: uuid.UUID,
    search_req: SearchRequest
) -> Tuple[List[Message], int]:
    """Executes full text and structured queries on user messages."""
    query = select(Message).where(Message.user_id == user_id)

    if search_req.mailbox_id:
        query = query.where(Message.mailbox_id == search_req.mailbox_id)

    if search_req.from_address:
        query = query.where(Message.sender_address.ilike(f"%{search_req.from_address}%"))

    if search_req.subject:
        query = query.where(Message.subject.ilike(f"%{search_req.subject}%"))

    if search_req.has_attachment is not None:
        query = query.where(Message.has_attachments == search_req.has_attachment)

    if search_req.is_unread is not None:
        query = query.where(Message.is_read == (not search_req.is_unread))

    if search_req.query and search_req.query.strip():
        search_terms = search_req.query.strip().replace("'", "")
        query = query.where(
            text("search_vector @@ plainto_tsquery('english', :q)").bindparams(q=search_terms)
        )

    # Count total
    count_stmt = select(func.count()).select_from(query.subquery())
    total_result = await session.execute(count_stmt)
    total = total_result.scalar_one()

    # Pagination
    offset = (search_req.page - 1) * search_req.limit
    query = query.order_by(Message.date.desc()).offset(offset).limit(search_req.limit)

    results = await session.execute(query)
    messages = results.scalars().all()

    return list(messages), total

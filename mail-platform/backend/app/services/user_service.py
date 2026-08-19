from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
import uuid
import logging

from app.core.config import settings
from app.core.security import hash_password
from app.models.user import User
from app.models.mailbox import Mailbox, MailboxType

logger = logging.getLogger("mail_backend.user_service")

async def get_or_create_primary_user(db: AsyncSession) -> User:
    """
    Guarantees retrieval or automatic provisioning of the primary executive user.
    Ensures mailboxes (Inbox, Sent, Drafts, Trash, Spam, Archive) are always initialized.
    """
    # 1. Look up primary user by case-insensitive email
    stmt = select(User).where(func.lower(User.email) == settings.PRIMARY_MAILBOX.lower())
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user:
        # 2. Look up any existing active user in the database
        stmt_any = select(User).order_by(User.created_at.asc())
        res_any = await db.execute(stmt_any)
        user = res_any.scalars().first()

    if not user:
        # 3. Create default primary user
        logger.info(f"Auto-provisioning primary executive user: {settings.PRIMARY_MAILBOX}")
        initial_hash = hash_password(settings.PRIMARY_MAILBOX_PASSWORD)
        user = User(
            id=uuid.uuid4(),
            email=settings.PRIMARY_MAILBOX.lower(),
            password_hash=initial_hash,
            full_name="Ivan Affriandi",
            is_active=True,
            is_admin=True,
        )
        db.add(user)
        await db.flush()

    # Ensure all standard mailboxes exist for this user
    standard_boxes = [
        (MailboxType.INBOX, "Inbox"),
        (MailboxType.SENT, "Sent"),
        (MailboxType.DRAFTS, "Drafts"),
        (MailboxType.TRASH, "Trash"),
        (MailboxType.SPAM, "Spam"),
        (MailboxType.ARCHIVE, "Archive"),
    ]

    for b_type, b_name in standard_boxes:
        b_stmt = select(Mailbox).where(Mailbox.user_id == user.id, Mailbox.type == b_type)
        b_res = await db.execute(b_stmt)
        if not b_res.scalar_one_or_none():
            new_box = Mailbox(user_id=user.id, name=b_name, type=b_type)
            db.add(new_box)

    await db.flush()
    return user

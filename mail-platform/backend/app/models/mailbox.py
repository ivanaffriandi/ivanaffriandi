import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.core.db import Base

class MailboxType(str, enum.Enum):
    inbox = "inbox"
    sent = "sent"
    drafts = "drafts"
    trash = "trash"
    archive = "archive"
    spam = "spam"
    custom = "custom"

# Compatibility aliases
MailboxType.INBOX = MailboxType.inbox
MailboxType.SENT = MailboxType.sent
MailboxType.DRAFTS = MailboxType.drafts
MailboxType.TRASH = MailboxType.trash
MailboxType.ARCHIVE = MailboxType.archive
MailboxType.SPAM = MailboxType.spam
MailboxType.CUSTOM = MailboxType.custom

class Mailbox(Base):
    __tablename__ = "mailboxes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    type = Column(String(50), default="custom", nullable=False)
    unread_count = Column(Integer, default=0, nullable=False)
    total_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="mailboxes")
    messages = relationship("Message", back_populates="mailbox", cascade="all, delete-orphan")

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.db import Base

class Thread(Base):
    __tablename__ = "threads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject = Column(Text, nullable=False)
    snippet = Column(Text, nullable=True)
    message_count = Column(Integer, default=1, nullable=False)
    has_unread = Column(Boolean, default=True, nullable=False)
    has_attachments = Column(Boolean, default=False, nullable=False)
    last_message_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="threads")
    messages = relationship("Message", back_populates="thread")

class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    mailbox_id = Column(UUID(as_uuid=True), ForeignKey("mailboxes.id", ondelete="CASCADE"), nullable=False)
    thread_id = Column(UUID(as_uuid=True), ForeignKey("threads.id", ondelete="SET NULL"), nullable=True)

    message_id_header = Column(String(512), unique=True, index=True, nullable=True)
    in_reply_to_header = Column(String(512), nullable=True)
    references_header = Column(Text, nullable=True)

    sender_name = Column(String(255), nullable=True)
    sender_address = Column(String(255), nullable=False)
    recipient_to = Column(Text, nullable=False)
    recipient_cc = Column(Text, nullable=True)
    recipient_bcc = Column(Text, nullable=True)

    subject = Column(Text, default="", nullable=False)
    date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    body_plain = Column(Text, nullable=True)
    body_html = Column(Text, nullable=True)
    raw_storage_path = Column(String(1024), nullable=True)
    size_bytes = Column(Integer, default=0, nullable=False)

    is_read = Column(Boolean, default=False, nullable=False)
    is_starred = Column(Boolean, default=False, nullable=False)
    is_draft = Column(Boolean, default=False, nullable=False)
    has_attachments = Column(Boolean, default=False, nullable=False)

    spam_score = Column(Numeric(5, 2), default=0.00)
    spam_status = Column(String(50), default="ham")

    # Smart Open / Read Tracking for Outbound Emails
    tracking_token = Column(String(64), unique=True, index=True, nullable=True)
    is_opened = Column(Boolean, default=False, nullable=False)
    opened_at = Column(DateTime(timezone=True), nullable=True)
    open_count = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="messages")
    mailbox = relationship("Mailbox", back_populates="messages")
    thread = relationship("Thread", back_populates="messages")
    attachments = relationship("Attachment", back_populates="message", cascade="all, delete-orphan")

class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    content_type = Column(String(255), nullable=False)
    size_bytes = Column(Integer, nullable=False)
    checksum_sha256 = Column(String(64), nullable=False)
    storage_path = Column(String(1024), nullable=False)
    is_inline = Column(Boolean, default=False, nullable=False)
    content_id = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    message = relationship("Message", back_populates="attachments")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    event_type = Column(String(100), nullable=False)
    ip_address = Column(String(45), nullable=False)
    user_agent = Column(Text, nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

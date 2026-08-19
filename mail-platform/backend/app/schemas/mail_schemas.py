from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from uuid import UUID

# Auth Schemas
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_email: str
    user_name: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str] = None
    is_admin: bool
    created_at: datetime

# Mailbox Schemas
class MailboxResponse(BaseModel):
    id: UUID
    name: str
    type: str
    unread_count: int
    total_count: int

# Attachment Schema
class AttachmentResponse(BaseModel):
    id: UUID
    filename: str
    content_type: str
    size_bytes: int
    is_inline: bool
    checksum_sha256: str

# Message Schemas
class MessageSummary(BaseModel):
    id: UUID
    thread_id: Optional[UUID] = None
    mailbox_id: UUID
    sender_name: Optional[str] = None
    sender_address: str
    recipient_to: str
    subject: str
    date: datetime
    snippet: Optional[str] = None
    is_read: bool
    is_starred: bool
    has_attachments: bool
    spam_score: float
    spam_status: str

class MessageDetail(MessageSummary):
    recipient_cc: Optional[str] = None
    recipient_bcc: Optional[str] = None
    message_id_header: Optional[str] = None
    in_reply_to_header: Optional[str] = None
    references_header: Optional[str] = None
    body_plain: Optional[str] = None
    body_html: Optional[str] = None
    attachments: List[AttachmentResponse] = []
    thread_messages: Optional[List['MessageDetail']] = []

class AttachmentPayload(BaseModel):
    filename: str
    content_type: str
    data_base64: str

class SendMessageRequest(BaseModel):
    to: List[str]
    cc: Optional[List[str]] = []
    bcc: Optional[List[str]] = []
    subject: str
    body_html: str
    body_plain: Optional[str] = None
    in_reply_to: Optional[str] = None
    attachments: Optional[List[AttachmentPayload]] = []

# Thread Schema
class ThreadResponse(BaseModel):
    id: UUID
    subject: str
    snippet: Optional[str] = None
    message_count: int
    has_unread: bool
    has_attachments: bool
    last_message_at: datetime
    messages: List[MessageSummary] = []

# Search Query Schema
class SearchRequest(BaseModel):
    query: str
    mailbox_id: Optional[UUID] = None
    from_address: Optional[str] = None
    subject: Optional[str] = None
    has_attachment: Optional[bool] = None
    is_unread: Optional[bool] = None
    page: int = 1
    limit: int = 20

# Deliverability Stats Schema
class MetricsSummary(BaseModel):
    inbound_count: int
    outbound_count: int
    bounce_count: int
    spam_detected_count: int
    spf_success_rate: float
    dkim_success_rate: float
    dmarc_success_rate: float
    queue_depth: int

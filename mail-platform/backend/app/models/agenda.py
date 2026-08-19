from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Index
from sqlalchemy.orm import relationship
import uuid

from sqlalchemy.dialects.postgresql import UUID
from app.core.db import Base

class AgendaItem(Base):
    __tablename__ = "agendas"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date_str = Column(String(32), nullable=False, index=True)  # e.g., "2026-08-18"
    title = Column(String(255), nullable=False)
    time = Column(String(16), nullable=True)  # e.g., "14:30"
    recurrence = Column(String(32), nullable=True, default="once")  # "once", "daily", "weekly", "monthly", "yearly"
    completed = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", backref="agendas")

    __table_args__ = (
        Index("idx_agendas_user_date", "user_id", "date_str"),
    )

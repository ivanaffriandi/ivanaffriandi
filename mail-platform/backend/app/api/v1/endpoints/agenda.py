from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

from app.core.db import get_db
from app.models.agenda import AgendaItem
from app.services.user_service import get_or_create_primary_user

router = APIRouter(prefix="/agenda", tags=["Agenda / Calendar"])

class AgendaItemSchema(BaseModel):
    id: str
    date_str: str
    title: str
    time: Optional[str] = None
    recurrence: Optional[str] = "once"
    completed: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AgendaCreateRequest(BaseModel):
    id: Optional[str] = None
    date_str: str
    title: str
    time: Optional[str] = None
    recurrence: Optional[str] = "once"
    completed: Optional[bool] = False

class AgendaUpdateRequest(BaseModel):
    title: Optional[str] = None
    date_str: Optional[str] = None
    time: Optional[str] = None
    recurrence: Optional[str] = None
    completed: Optional[bool] = None

@router.get("", response_model=List[AgendaItemSchema])
async def get_agendas(db: AsyncSession = Depends(get_db)):
    """Fetches all agenda and calendar items for the user, sorted chronologically."""
    user = await get_or_create_primary_user(db)
    stmt = select(AgendaItem).where(AgendaItem.user_id == user.id).order_by(AgendaItem.date_str.asc(), AgendaItem.created_at.asc())
    res = await db.execute(stmt)
    items = res.scalars().all()
    return items

@router.post("", response_model=AgendaItemSchema, status_code=status.HTTP_201_CREATED)
async def create_agenda(req: AgendaCreateRequest, db: AsyncSession = Depends(get_db)):
    """Creates or updates a persistent agenda item in the cloud database."""
    user = await get_or_create_primary_user(db)
    item_id = req.id if req.id else str(uuid.uuid4())
    
    # Check if item exists (idempotent upsert)
    stmt = select(AgendaItem).where(AgendaItem.id == item_id, AgendaItem.user_id == user.id)
    res = await db.execute(stmt)
    existing = res.scalar_one_or_none()

    if existing:
        existing.title = req.title.strip()
        existing.date_str = req.date_str
        existing.time = req.time
        existing.recurrence = req.recurrence
        if req.completed is not None:
            existing.completed = req.completed
        await db.commit()
        await db.refresh(existing)
        return existing

    new_item = AgendaItem(
        id=item_id,
        user_id=user.id,
        date_str=req.date_str,
        title=req.title.strip(),
        time=req.time,
        recurrence=req.recurrence or "once",
        completed=bool(req.completed)
    )
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    return new_item

@router.put("/{agenda_id}", response_model=AgendaItemSchema)
async def update_agenda(agenda_id: str, req: AgendaUpdateRequest, db: AsyncSession = Depends(get_db)):
    """Updates an existing agenda item in real time."""
    user = await get_or_create_primary_user(db)
    stmt = select(AgendaItem).where(AgendaItem.id == agenda_id, AgendaItem.user_id == user.id)
    res = await db.execute(stmt)
    item = res.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agenda item not found")

    if req.title is not None:
        item.title = req.title.strip()
    if req.date_str is not None:
        item.date_str = req.date_str
    if req.time is not None:
        item.time = req.time
    if req.recurrence is not None:
        item.recurrence = req.recurrence
    if req.completed is not None:
        item.completed = req.completed

    await db.commit()
    await db.refresh(item)
    return item

@router.delete("/{agenda_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agenda(agenda_id: str, db: AsyncSession = Depends(get_db)):
    """Deletes an agenda item permanently from the database."""
    user = await get_or_create_primary_user(db)
    stmt = delete(AgendaItem).where(AgendaItem.id == agenda_id, AgendaItem.user_id == user.id)
    await db.execute(stmt)
    await db.commit()
    return None

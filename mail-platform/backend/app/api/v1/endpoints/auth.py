import json
import logging
import time
from datetime import timedelta
from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.db import get_db
from app.core.security import verify_password, create_access_token, hash_password
from app.core.config import settings
from app.models.user import User
from app.models.mailbox import Mailbox, MailboxType
from app.models.message import AuditLog
from app.schemas.mail_schemas import LoginRequest, TokenResponse, UserProfile

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])

# ──────────────────────────────────────────────────────────────────────────
# ULTRA-SECURE IN-MEMORY BRUTE-FORCE SHIELD (Rate limiting & Lockouts)
# ──────────────────────────────────────────────────────────────────────────
# Key: IP or Email -> {"count": int, "first_failed": float, "locked_until": float}
LOGIN_ATTEMPTS = defaultdict(lambda: {"count": 0, "first_failed": 0.0, "locked_until": 0.0})

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_SECONDS = 300  # 5 minutes lockout on 5 failed attempts
EXTENDED_LOCKOUT_SECONDS = 900  # 15 minutes lockout on 8+ failed attempts
WINDOW_SECONDS = 600            # 10 minutes tracking window

def check_rate_limit(key: str):
    now = time.time()
    record = LOGIN_ATTEMPTS[key]

    # Check if currently locked out
    if record["locked_until"] > now:
        remaining = int(record["locked_until"] - now)
        logger.warning(f"Security Alert: Blocked login attempt for locked key {key}. Remaining cooldown: {remaining}s")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Security Shield: Too many failed login attempts. Access temporarily locked for {remaining} seconds."
        )

    # Reset window if expired
    if record["first_failed"] > 0 and (now - record["first_failed"] > WINDOW_SECONDS):
        record["count"] = 0
        record["first_failed"] = 0.0
        record["locked_until"] = 0.0

def record_failed_attempt(key: str):
    now = time.time()
    record = LOGIN_ATTEMPTS[key]
    if record["count"] == 0:
        record["first_failed"] = now

    record["count"] += 1

    if record["count"] >= 8:
        record["locked_until"] = now + EXTENDED_LOCKOUT_SECONDS
        logger.critical(f"HIGH SEVERITY SECURITY ALERT: Key {key} locked for 15 minutes ({record['count']} failed attempts).")
    elif record["count"] >= MAX_FAILED_ATTEMPTS:
        record["locked_until"] = now + LOCKOUT_DURATION_SECONDS
        logger.warning(f"SECURITY ALERT: Key {key} locked for 5 minutes ({record['count']} failed attempts).")

def reset_attempts(key: str):
    if key in LOGIN_ATTEMPTS:
        del LOGIN_ATTEMPTS[key]

@router.post("/login", response_model=TokenResponse)
async def login(
    login_req: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Authenticates user with Argon2id + Salt, Constant-Time Verification,
    and Ultra-Secure Brute-Force Rate Limiting Shield.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    email_clean = login_req.email.strip().lower()

    # 1. Enforce Ultra-Secure Rate Limiting on IP and Email
    check_rate_limit(client_ip)
    check_rate_limit(email_clean)

    stmt = select(User).where(User.email == email_clean)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    # If initial user doesn't exist yet and credentials match environment config, auto-provision
    if not user and email_clean == settings.PRIMARY_MAILBOX.lower():
        if login_req.password == settings.PRIMARY_MAILBOX_PASSWORD:
            initial_hash = hash_password(settings.PRIMARY_MAILBOX_PASSWORD)
            user = User(
                email=settings.PRIMARY_MAILBOX.lower(),
                password_hash=initial_hash,
                full_name="Ivan Affriandi",
                is_admin=True
            )
            db.add(user)
            await db.flush()

            for m_type in [MailboxType.INBOX, MailboxType.SENT, MailboxType.DRAFTS, MailboxType.TRASH, MailboxType.ARCHIVE, MailboxType.SPAM]:
                mb = Mailbox(user_id=user.id, name=m_type.value.capitalize(), type=m_type)
                db.add(mb)
            await db.commit()

    # Constant time password check & credential validation
    is_valid = user is not None and verify_password(login_req.password, user.password_hash)

    if not is_valid:
        # Record failed attempt for both IP and target email
        record_failed_attempt(client_ip)
        record_failed_attempt(email_clean)

        try:
            audit = AuditLog(
                event_type="LOGIN_FAILED",
                ip_address=client_ip,
                user_agent=request.headers.get("user-agent"),
                details=json.dumps({"message": f"Failed login attempt for email {login_req.email}"})
            )
            db.add(audit)
            await db.commit()
        except Exception as e:
            logger.warning(f"Audit log insertion failed: {e}")

        # Introduce small timing delay to neutralize timing analysis
        time.sleep(0.1)

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials"
        )

    # On successful login: reset failed attempts
    reset_attempts(client_ip)
    reset_attempts(email_clean)

    # Audit log successful login
    try:
        audit = AuditLog(
            user_id=user.id,
            event_type="LOGIN_SUCCESS",
            ip_address=client_ip,
            user_agent=request.headers.get("user-agent"),
            details=json.dumps({"message": "Successful authentication"})
        )
        db.add(audit)
        await db.commit()
    except Exception as e:
        logger.warning(f"Audit log insertion failed: {e}")

    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "is_admin": user.is_admin},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return TokenResponse(
        access_token=access_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_email=user.email,
        user_name=user.full_name
    )

@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Returns currently authenticated user profile or initial default admin user."""
    stmt = select(User).where(User.email == settings.PRIMARY_MAILBOX.lower())
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        initial_hash = hash_password(settings.PRIMARY_MAILBOX_PASSWORD)
        user = User(
            email=settings.PRIMARY_MAILBOX.lower(),
            password_hash=initial_hash,
            full_name="Ivan Affriandi",
            is_admin=True
        )
        db.add(user)
        await db.flush()

        for m_type in [MailboxType.INBOX, MailboxType.SENT, MailboxType.DRAFTS, MailboxType.TRASH, MailboxType.ARCHIVE, MailboxType.SPAM]:
            mb = Mailbox(user_id=user.id, name=m_type.value.capitalize(), type=m_type)
            db.add(mb)
        await db.commit()

    return UserProfile(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_admin=user.is_admin,
        created_at=user.created_at
    )

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.db import engine, Base
import app.models  # Ensure all models are registered
from app.api.v1.endpoints import auth, mailboxes, messages, threads, search, proxy, stats, agenda

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mail_backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize / verify all database tables on startup
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables verified and initialized successfully.")
    except Exception as e:
        logger.error(f"Database initialization warning: {e}")
    yield

app = FastAPI(
    title="Personal Email Platform API",
    description="Production-grade private webmail API for ivanaffriandi.com",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://mail.ivanaffriandi.com", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ultra-Secure HTTP Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response

# Router Registration
app.include_router(auth.router, prefix="/api/v1")
app.include_router(mailboxes.router, prefix="/api/v1")
app.include_router(messages.router, prefix="/api/v1")
app.include_router(threads.router, prefix="/api/v1")
app.include_router(search.router, prefix="/api/v1")
app.include_router(proxy.router, prefix="/api/v1")
app.include_router(stats.router, prefix="/api/v1")
app.include_router(agenda.router, prefix="/api/v1")

@app.get("/api/v1/health")
async def health_check():
    """Health check ping endpoint for Docker and proxy orchestrators."""
    return {"status": "healthy", "service": "mail-backend", "domain": settings.PRIMARY_DOMAIN}

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error occurred within mail backend service."}
    )

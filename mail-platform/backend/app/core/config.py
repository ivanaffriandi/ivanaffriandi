import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Personal Email Platform"
    PRIMARY_DOMAIN: str = "ivanaffriandi.com"
    PRIMARY_MAILBOX: str = "hello@ivanaffriandi.com"
    PRIMARY_MAILBOX_PASSWORD: str = "1Ndrowatu!"

    DATABASE_URL: str = "postgresql+asyncpg://mailuser:change_me_in_production@postgres:5432/mailplatform"
    REDIS_URL: str = "redis://:redis_password_change_me@redis:6379/0"

    JWT_SECRET: str = "super_secret_jwt_key_please_change"
    ARGON2_SECRET: str = "argon2_pepper_secret_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    DOVECOT_HOST: str = "dovecot"
    DOVECOT_IMAP_PORT: int = 993

    POSTFIX_HOST: str = "postfix"
    POSTFIX_SMTP_PORT: int = 587

    RESEND_API_KEY: str = ""
    
    # Generic Port 587 SMTP Relay (Brevo, Resend SMTP, SendGrid, etc.)
    SMTP_RELAY_HOST: str = ""
    SMTP_RELAY_PORT: int = 587
    SMTP_RELAY_USER: str = ""
    SMTP_RELAY_PASS: str = ""
    SMTP_RELAY_STARTTLS: bool = True

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()

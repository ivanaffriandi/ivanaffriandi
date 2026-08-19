#!/usr/bin/env font
#!/bin/bash
set -euo pipefail

# -----------------------------------------------------------------------------
# Automated Encrypted 3-2-1 Backup Script
# Domain: ivanaffriandi.com | Mail Infrastructure
# -----------------------------------------------------------------------------

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/tmp/mail_backup_${TIMESTAMP}"
ENCRYPTED_ARCHIVE="/var/backups/mail_platform_${TIMESTAMP}.tar.gz.enc"

echo "[Backup] Starting automated production backup at $(date)..."

# 1. Create temporary staging directory
mkdir -p "${BACKUP_DIR}"

# 2. Dump PostgreSQL Database (Schema + Data)
echo "[Backup] Dumping PostgreSQL database..."
docker exec mail_postgres pg_dump -U mailuser -d mailplatform -F c -f "/tmp/db_dump_${TIMESTAMP}.dump"
docker cp mail_postgres:"/tmp/db_dump_${TIMESTAMP}.dump" "${BACKUP_DIR}/postgres.dump"
docker exec mail_postgres rm "/tmp/db_dump_${TIMESTAMP}.dump"

# 3. Snapshot Maildir Files & Attachments
echo "[Backup] Copying Maildir storage..."
docker cp mail_dovecot:/var/vmail "${BACKUP_DIR}/vmail"

# 4. Snapshot Rspamd DKIM Keys & Postfix Configs
echo "[Backup] Copying DKIM keys and server configurations..."
mkdir -p "${BACKUP_DIR}/config"
cp -r config/ "${BACKUP_DIR}/config/"

# 5. Compress and Encrypt Archive (AES-256-CBC)
echo "[Backup] Encrypting backup archive..."
tar -czf - -C "${BACKUP_DIR}" . | openssl enc -aes-256-cbc -salt -pbkdf2 -out "${ENCRYPTED_ARCHIVE}" -pass pass:"${RESTIC_PASSWORD:-backup_encryption_secret_key}"

# 6. Cleanup Staging Directory
rm -rf "${BACKUP_DIR}"

echo "[Backup] Success! Encrypted production backup created at ${ENCRYPTED_ARCHIVE}"

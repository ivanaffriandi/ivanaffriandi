#!/bin/bash
set -euo pipefail

# -----------------------------------------------------------------------------
# Production Disaster Recovery Restoration Script
# -----------------------------------------------------------------------------

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 /path/to/encrypted_backup_archive.tar.gz.enc"
    exit 1
fi

ENCRYPTED_FILE="$1"
STAGING_DIR="/tmp/restore_staging"

echo "[Restore] Initializing disaster recovery restoration from ${ENCRYPTED_FILE}..."

if [ ! -f "${ENCRYPTED_FILE}" ]; then
    echo "[Error] Backup file not found: ${ENCRYPTED_FILE}"
    exit 1
fi

# 1. Decrypt Archive
mkdir -p "${STAGING_DIR}"
echo "[Restore] Decrypting archive..."
openssl enc -d -aes-256-cbc -pbkdf2 -in "${ENCRYPTED_FILE}" -pass pass:"${RESTIC_PASSWORD:-backup_encryption_secret_key}" | tar -xzf - -C "${STAGING_DIR}"

# 2. Restore PostgreSQL Database
echo "[Restore] Restoring PostgreSQL metadata database..."
docker cp "${STAGING_DIR}/postgres.dump" mail_postgres:/tmp/postgres.dump
docker exec mail_postgres pg_restore -U mailuser -d mailplatform --clean --if-exists /tmp/postgres.dump || true
docker exec mail_postgres rm /tmp/postgres.dump

# 3. Restore Maildir Storage
echo "[Restore] Restoring Dovecot Maildir files..."
docker cp "${STAGING_DIR}/vmail/." mail_dovecot:/var/vmail/

# 4. Fix Permissions
docker exec mail_dovecot chown -R 5000:5000 /var/vmail

# 5. Cleanup
rm -rf "${STAGING_DIR}"

echo "[Restore] Disaster recovery restoration completed successfully!"

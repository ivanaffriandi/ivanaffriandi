# Disaster Recovery & Backup Plan (3-2-1 Strategy)

## 1. Backup Strategy Overview

The email platform enforces the **3-2-1 backup principle**:
- **3 Copies of Data**: Primary storage + local backup archive + offsite encrypted object storage (S3 / Backblaze B2).
- **2 Different Media Types**: Local SSD volume + cloud object storage.
- **1 Off-site Copy**: Encrypted Restic / OpenSSL backup pushed off-site.

### Service Level Targets
- **Recovery Point Objective (RPO)**: < 12 hours (automated twice-daily snapshots).
- **Recovery Time Objective (RTO)**: < 2 hours for full platform restoration.

---

## 2. Automated Backup Execution

Run the automated backup script manually or via cron:

```bash
# Execute backup
make backup
```

The script performs:
1. `pg_dump` snapshot of PostgreSQL metadata.
2. Rsync copy of Dovecot Maildir files (`/var/vmail`).
3. Backup of Rspamd 2048-bit DKIM keys and Postfix configurations.
4. AES-256-CBC encryption using `$RESTIC_PASSWORD`.

---

## 3. Disaster Recovery Restoration Procedure

In the event of complete server failure or hardware corruption:

```bash
# 1. Provision fresh VPS instance with Docker Compose
git clone https://github.com/ivanaffriandi/mail-platform.git
cd mail-platform
cp .env.example .env

# 2. Start core database and storage services
docker compose up -d postgres dovecot postfix

# 3. Execute restoration script against latest backup snapshot
bash scripts/restore.sh /var/backups/mail_platform_20260817_120000.tar.gz.enc

# 4. Start remaining application services
make up
```

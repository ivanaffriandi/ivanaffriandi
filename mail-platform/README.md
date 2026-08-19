# Production-Grade Personal Email Platform for `ivanaffriandi.com`

Primary Mailbox: `hello@ivanaffriandi.com`  
Mail Host: `mail.ivanaffriandi.com`

This repository contains a **production-grade, secure, highly observable personal email infrastructure and modern webmail client** built from the ground up for `ivanaffriandi.com`.

---

## 🏛️ System Architecture Overview

```text
                                        INTERNET
                                           │
                                 ┌─────────┴─────────┐
                                 │   DNS / DNSSEC    │
                                 └─────────┬─────────┘
                                           │
                      ┌────────────────────┴────────────────────┐
                      ▼                                         ▼
            [Port 25 / 587 / 465]                            [Port 80 / 443]
             ┌─────────────────┐                            ┌─────────────────┐
             │  Mail Gateway   │                            │  Reverse Proxy  │
             │  (Postfix 3.8)  │                            │     (Caddy 2)   │
             └────────┬────────┘                            └────────┬────────┘
                      │ (Milter)                                     │ (HTTPS / TLS 1.3)
                      ▼                                              ▼
             ┌─────────────────┐                            ┌─────────────────┐
             │ Mail Security   │                            │   Webmail UI    │
             │ (Rspamd + DKIM) │                            │ (Next.js 15 App)│
             └────────┬────────┘                            └────────┬────────┘
                      │ (LMTP)                                       │ (REST API / JWT)
                      ▼                                              ▼
             ┌─────────────────┐                            ┌─────────────────┐
             │   Mail Storage  │                            │ Webmail Backend │
             │  (Dovecot 2.3)  │◄────────[IMAP / SASL]──────┤ (FastAPI + SQLA)│
             └────────┬────────┘                            └────────┬────────┘
                      │                                              │
                      │ (Maildir / File System)                      │ (AsyncPG / Metadata)
                      ▼                                              ▼
             ┌────────────────────────────────────────────────────────────────┐
             │                     PostgreSQL 16 Storage                      │
             │ (Users, Folders, Message Metadata, Threads, Audit Logs, FTS)   │
             └────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack & Infrastructure Components

| Layer | Technology | Primary Function |
| :--- | :--- | :--- |
| **Mail Gateway (MTA)** | **Postfix 3.8** | Inbound/outbound SMTP, rate-limiting, queueing, STARTTLS, milters |
| **Mail Server (IMAP/LMTP)**| **Dovecot 2.3** | High-performance Maildir indexing, IMAP protocol, SASL, LMTP delivery |
| **Security & Spam Engine** | **Rspamd + ClamAV** | SPF/DKIM/DMARC validation, 2048-bit DKIM signing, ClamAV antivirus |
| **Webmail API Backend** | **FastAPI (Python 3.12)** | Async REST API, RFC 5322 thread engine, HTML sanitizer, Postgres FTS |
| **Webmail UI Frontend** | **Next.js 15 (React 19)** | Editorial workspace design, keyboard navigation, sandboxed iframe email reader |
| **Metadata Store** | **PostgreSQL 16** | Users, Mailboxes, Thread graphs, Attachments, Audit Logs, `tsvector` FTS |
| **Reverse Proxy / TLS** | **Caddy v2** | Automatic HTTPS (Let's Encrypt / ZeroSSL), HSTS, TLS 1.3, HTTP/3 |
| **Observability** | **Prometheus + Grafana** | Delivery latency, queue depth, bounce rates, security audit dashboards |

---

## ⚡ Quickstart Deployment

```bash
# 1. Clone repository
git clone https://github.com/ivanaffriandi/mail-platform.git
cd mail-platform

# 2. Initialize environment configuration
make setup

# 3. Edit production secrets in .env
nano .env

# 4. Generate 2048-bit DKIM keypair
make dkim-gen

# 5. Build and launch all production containers
make up

# 6. Check status and health
make status
```

---

## 📖 Comprehensive Documentation Index

Detailed engineering guides located in `docs/`:

1. [ARCHITECTURE.md](docs/ARCHITECTURE.md) — Technical component design, storage layout, thread engine, and data flow.
2. [SECURITY.md](docs/SECURITY.md) — HTML email sandboxing, XSS defense, Argon2id hashing, privacy image proxying.
3. [OPERATIONS.md](docs/OPERATIONS.md) — Production maintenance runbooks, logging, troubleshooting, performance tuning.
4. [DISASTER_RECOVERY.md](docs/DISASTER_RECOVERY.md) — Encrypted 3-2-1 backup strategy, RPO/RTO SLAs, restoration runbooks.
5. [EMAIL_DELIVERABILITY.md](docs/EMAIL_DELIVERABILITY.md) — SPF, DKIM, DMARC escalation, rDNS PTR alignment, reputation metrics.
6. [DNS.md](docs/DNS.md) — Complete DNS records table and zero-downtime migration strategy from Lark Mailbox.
7. [DEVELOPMENT.md](docs/DEVELOPMENT.md) — Local environment setup, unit/integration test suites, and OpenAPI specs.

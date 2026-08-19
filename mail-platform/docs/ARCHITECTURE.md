# Technical Architecture & Engineering Specifications

## 1. SMTP Mail Gateway Layer (Postfix 3.8)

Postfix acts as the public-facing Mail Transfer Agent (MTA) operating on ports 25 (Inbound SMTP), 587 (Submission STARTTLS), and 465 (SMTPS).

### Key Responsibilities
- **SMTP Receiving & Delivery**: Receives inbound emails from remote MTAs over TLS 1.2/1.3 and queues them for delivery via LMTP to Dovecot.
- **Rspamd Milter Protocol**: Passes inbound and outbound messages through Rspamd (`inet:rspamd:11332`) for real-time SPF, DKIM, DMARC, ARC signing, and ClamAV antivirus evaluation.
- **Virtual Mailbox Lookup**: Queries PostgreSQL database (`pgsql-virtual-mailboxes.cf`) to verify recipient address existence before accepting messages.

---

## 2. Mail Storage & IMAP Layer (Dovecot 2.3)

Dovecot manages mailbox storage, folder indexing, and IMAP protocol access.

### Maildir Storage Hierarchy
Emails are written atomically in Maildir format under `/var/vmail/ivanaffriandi.com/hello/`:
```text
/var/vmail/ivanaffriandi.com/hello/
├── cur/        (Delivered & processed messages)
├── new/        (Unread incoming messages)
├── tmp/        (In-flight atomic write staging)
└── dovecot.index (Fast binary search indexes)
```

### PostgreSQL Authentication (Dovecot-SQL)
- SASL authentication validates user credentials against the `users` table using Argon2id schema hashing (`password_query`).
- Maildir UID/GID isolation enforces `vmail` user boundaries (`5000:5000`).

---

## 3. Backend Webmail API (FastAPI)

Built as a high-performance modular monolith using Python 3.12, SQLAlchemy 2.0 Async, and `asyncpg`.

### RFC 5322 Thread Resolution Algorithm
Conversation thread graphs are calculated on every incoming message:
1. Check `In-Reply-To` header against existing `messages.message_id_header`. If a matching parent is found, assign the new message to the parent's `thread_id`.
2. If `In-Reply-To` yields no match, search `References` header list.
3. If no parent match exists, generate a new UUID `threads` record using stripped subject text (`Re:` / `Fwd:` removed).

### PostgreSQL Full-Text Search
Uses PostgreSQL `tsvector` columns updated automatically by trigger:
```sql
new.search_vector :=
  setweight(to_tsvector('english', coalesce(new.subject, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(new.sender_address, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(new.body_plain, '')), 'C');
```

---

## 4. Frontend Webmail UI (Next.js 15)

Built using React 19, TypeScript, and Tailwind CSS following an editorial/academic visual aesthetic.

### Sandboxed HTML Email Reader
Email bodies are rendered inside an isolated `iframe` (`sandbox="allow-same-origin"`) after passing through server-side BeautifulSoup/DOMPurify HTML sanitization. Remote tracking images are automatically rewritten to route through `/api/v1/proxy/image` to prevent IP leakage.

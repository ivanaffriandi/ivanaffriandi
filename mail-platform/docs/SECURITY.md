# Security Architecture & Threat Model

## 1. Threat Matrix & Defense Strategy

| Threat Vector | Mitigation Technique |
| :--- | :--- |
| **Email Body XSS Execution** | Double-layer HTML sanitization (BeautifulSoup4 server-side + DOMPurify) & sandboxed `<iframe sandbox="allow-same-origin">` rendering. |
| **IP Tracking / Pixel Surveillance** | Remote image URLs in email bodies rewritten to `/api/v1/proxy/image` endpoint with header stripping and default image blocking toggle. |
| **Password Brute Force** | Passwords hashed using Argon2id (`time=3, memory=64MB, parallelism=4`). Login rate-limiting via FastAPI middleware and audit logging. |
| **Malicious Email Attachments** | Extension filtering, MIME magic byte validation, and ClamAV asynchronous antivirus scanning. Maximum file size set to 25MB. |
| **Network Eavesdropping** | Mandatory TLS 1.2/1.3 for SMTP/IMAP/HTTPS with strict ciphers (ECDHE-ECDSA-AES128-GCM-SHA256). HSTS preload header enabled. |
| **SSRF via Webmail** | Proxy endpoint restricts outbound protocol targets to HTTP/HTTPS and rejects RFC 1918 private subnets (`10.0.0.0/8`, `127.0.0.0/8`, `192.168.0.0/16`). |

---

## 2. Password & Key Hashing Standard

Passwords are never stored in plaintext. Argon2id password hashing is enforced across Webmail, Postfix SASL, and Dovecot authentication:

```python
from argon2 import PasswordHasher

ph = PasswordHasher(
    time_cost=3,
    memory_cost=65536,  # 64 MB RAM per hash
    parallelism=4,
    hash_len=32,
    salt_len=16
)
```

---

## 3. Network Isolation Architecture

Container services are segmented into three distinct Docker bridge networks:
1. **`mail-net`**: Postfix, Dovecot, Rspamd, ClamAV, Redis.
2. **`web-net`**: Caddy, Next.js frontend, FastAPI backend, Prometheus, Grafana.
3. **`db-net`**: PostgreSQL, FastAPI backend, Postfix, Dovecot.

The database container has no exposure to the public web interface or external ports.

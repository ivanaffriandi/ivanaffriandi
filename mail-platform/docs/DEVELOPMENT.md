# Local Development & Testing Guide

## 1. Local Environment Setup

```bash
# Clone and enter project directory
cd mail-platform

# Copy default environment settings
cp .env.example .env

# Install backend dependencies (Poetry)
cd backend
poetry install

# Run backend test suite
poetry run pytest app/tests/ -v

# Install frontend dependencies (npm)
cd ../frontend
npm install
npm run dev
```

---

## 2. API Endpoints Reference (OpenAPI v1)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/auth/login` | `POST` | Authenticate with Argon2id credentials, return JWT |
| `/api/v1/auth/me` | `GET` | Get current user profile |
| `/api/v1/folders` | `GET` | List mailboxes with unread/total message counts |
| `/api/v1/messages` | `GET` | List folder messages with pagination |
| `/api/v1/messages/{id}` | `GET` | Retrieve sanitized message detail |
| `/api/v1/messages/send` | `POST` | Compose and dispatch outbound email |
| `/api/v1/threads` | `GET` | List conversation threads |
| `/api/v1/threads/{id}` | `GET` | Retrieve full thread conversation messages |
| `/api/v1/search` | `POST` | Full-text query on subject, sender, and body |
| `/api/v1/proxy/image` | `GET` | Privacy proxy for remote tracking images |
| `/api/v1/stats/deliverability` | `GET` | Deliverability and domain reputation metrics |
| `/api/v1/stats/metrics` | `GET` | Expose Prometheus metrics |

---

## 3. Running Automated Tests

```bash
# Run backend pytest suite
make test-backend

# Run frontend Next.js lint and type checks
make test-frontend
```

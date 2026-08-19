-- PostgreSQL Initial Schema for Personal Email Platform (ivanaffriandi.com)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- Users & Authentication
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Mailboxes (Folders)
-- -----------------------------------------------------------------------------
CREATE TYPE mailbox_type AS ENUM ('inbox', 'sent', 'drafts', 'trash', 'archive', 'spam', 'custom');

CREATE TABLE IF NOT EXISTS mailboxes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type mailbox_type NOT NULL DEFAULT 'custom',
    unread_count INT NOT NULL DEFAULT 0,
    total_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- -----------------------------------------------------------------------------
-- Threads
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    snippet TEXT,
    message_count INT NOT NULL DEFAULT 1,
    has_unread BOOLEAN NOT NULL DEFAULT TRUE,
    has_attachments BOOLEAN NOT NULL DEFAULT FALSE,
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Messages
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mailbox_id UUID NOT NULL REFERENCES mailboxes(id) ON DELETE CASCADE,
    thread_id UUID REFERENCES threads(id) ON DELETE SET NULL,
    message_id_header VARCHAR(512) UNIQUE,
    in_reply_to_header VARCHAR(512),
    references_header TEXT,
    sender_name VARCHAR(255),
    sender_address VARCHAR(255) NOT NULL,
    recipient_to TEXT NOT NULL,
    recipient_cc TEXT,
    recipient_bcc TEXT,
    subject TEXT NOT NULL DEFAULT '',
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    body_plain TEXT,
    body_html TEXT,
    raw_storage_path VARCHAR(1024),
    size_bytes INT NOT NULL DEFAULT 0,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    is_starred BOOLEAN NOT NULL DEFAULT FALSE,
    is_draft BOOLEAN NOT NULL DEFAULT FALSE,
    has_attachments BOOLEAN NOT NULL DEFAULT FALSE,
    spam_score NUMERIC(5, 2) DEFAULT 0.00,
    spam_status VARCHAR(50) DEFAULT 'ham',
    search_vector tsvector,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Attachments
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(255) NOT NULL,
    size_bytes BIGINT NOT NULL,
    checksum_sha256 CHAR(64) NOT NULL,
    storage_path VARCHAR(1024) NOT NULL,
    is_inline BOOLEAN NOT NULL DEFAULT FALSE,
    content_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Deliverability & Reputation Metrics
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS delivery_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL, -- 'delivered', 'bounce_soft', 'bounce_hard', 'rejected', 'spf_fail', 'dkim_fail', 'dmarc_fail'
    sender VARCHAR(255) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    destination_domain VARCHAR(255) NOT NULL,
    smtp_code INT,
    enhanced_code VARCHAR(50),
    diagnostic_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Audit & Security Logs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Indexes & Performance Optimization
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_messages_user_mailbox ON messages(user_id, mailbox_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id, date ASC);
CREATE INDEX IF NOT EXISTS idx_messages_message_id ON messages(message_id_header);
CREATE INDEX IF NOT EXISTS idx_messages_in_reply_to ON messages(in_reply_to_header);
CREATE INDEX IF NOT EXISTS idx_messages_search_vector ON messages USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_attachments_message ON attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_delivery_events_type_date ON delivery_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON audit_logs(event_type, created_at DESC);

-- Automatic TSVector trigger for full text search
CREATE OR REPLACE FUNCTION messages_trigger_search_vector() RETURNS trigger AS $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.subject, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.sender_address, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.sender_name, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.body_plain, '')), 'C');
  return new;
end
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_messages_search_vector
BEFORE INSERT OR UPDATE ON messages
FOR EACH ROW EXECUTE FUNCTION messages_trigger_search_vector();

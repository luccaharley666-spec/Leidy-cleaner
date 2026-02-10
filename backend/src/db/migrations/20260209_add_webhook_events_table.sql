-- Migration: add webhook_events table for idempotency and audit
CREATE TABLE IF NOT EXISTS webhook_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL UNIQUE,
  source TEXT,
  payload LONGTEXT,
  signature VARCHAR(255),
  received_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON webhook_events(event_id);

-- Migration: create payments and chat_messages tables
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  method VARCHAR(20) DEFAULT 'card',
  [REDACTED_TOKEN] VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  refund_id VARCHAR(255),
  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON payments(user_id);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  sender_id INTEGER NOT NULL,
  recipient_id INTEGER NOT NULL,
  text TEXT NOT NULL,
  read INTEGER DEFAULT 0,
  timestamp DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (recipient_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON chat_messages(booking_id);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON chat_messages(recipient_id);

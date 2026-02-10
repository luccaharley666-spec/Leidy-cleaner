-- Migration: create reviews, time_blocks and email_logs tables
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER,
  user_id INTEGER,
  professional_id INTEGER,
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  photos TEXT,
  is_approved INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON reviews(professional_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

CREATE TABLE IF NOT EXISTS time_blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  professional_id INTEGER NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'available',
  reason TEXT,
  created_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (professional_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON time_blocks(professional_id, date);

CREATE TABLE IF NOT EXISTS email_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  to_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  sent_at DATETIME,
  created_at DATETIME DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_email_logs_to ON email_logs(to_email);

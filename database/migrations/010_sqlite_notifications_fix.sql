-- SQLite-compatible migration to create notification tables
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS [REDACTED_TOKEN] (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL UNIQUE,
  email_enabled INTEGER DEFAULT 1,
  sms_enabled INTEGER DEFAULT 0,
  whatsapp_enabled INTEGER DEFAULT 0,
  push_enabled INTEGER DEFAULT 1,
  reminder_2days INTEGER DEFAULT 1,
  reminder_1day INTEGER DEFAULT 1,
  reminder_1hour INTEGER DEFAULT 0,
  [REDACTED_TOKEN] TEXT DEFAULT 'standard',
  phone_number TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON [REDACTED_TOKEN](userId);

CREATE TABLE IF NOT EXISTS notification_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  bookingId INTEGER,
  type TEXT,
  status TEXT,
  recipient TEXT,
  message_template TEXT,
  message_content TEXT,
  error_message TEXT,
  sent_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON notification_logs(userId);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON notification_logs(bookingId);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON notification_logs(type);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON notification_logs(sent_at);

CREATE TABLE IF NOT EXISTS [REDACTED_TOKEN] (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  type TEXT,
  subject TEXT,
  body TEXT,
  variables TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  bookingId INTEGER,
  notification_type TEXT,
  scheduled_send_time DATETIME,
  delivery_channels TEXT,
  status TEXT DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON notification_queue(scheduled_send_time);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON notification_queue(status);

-- Optional: insert basic templates if not present
INSERT OR IGNORE INTO [REDACTED_TOKEN] (name, type, subject, body, variables, is_active) VALUES
('[REDACTED_TOKEN]','email','Agendamento Confirmado - {{serviceName}}','Olá {{userName}},\n\nSeu agendamento foi confirmado!\n','["userName","serviceName","bookingDate","bookingTime","location","bookingId"]',1);

-- Migration: create affiliates and referrals tables
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS affiliates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  referral_code VARCHAR(40) UNIQUE NOT NULL,
  commission_rate REAL DEFAULT 0.10,
  total_referrals INTEGER DEFAULT 0,
  total_earnings REAL DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON affiliates(referral_code);

CREATE TABLE IF NOT EXISTS referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  affiliate_user_id INTEGER NOT NULL,
  referred_user_id INTEGER NOT NULL,
  referral_code VARCHAR(40),
  transaction_amount REAL,
  commission_earned REAL,
  status VARCHAR(20) DEFAULT 'completed',
  created_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (affiliate_user_id) REFERENCES users(id),
  FOREIGN KEY (referred_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON referrals(affiliate_user_id);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON referrals(referred_user_id);

-- Migration: [REDACTED_TOKEN]
-- Description: Adicionar tabela de inscritos na newsletter

CREATE TABLE IF NOT EXISTS [REDACTED_TOKEN] (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'unsubscribed')),
  subscribedAt DATETIME NOT NULL,
  unsubscribedAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON [REDACTED_TOKEN](email);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON [REDACTED_TOKEN](status);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON [REDACTED_TOKEN](subscribedAt DESC);

-- Tabela para tracking de emails enviados
CREATE TABLE IF NOT EXISTS newsletter_sends (
  id TEXT PRIMARY KEY,
  subscriberId TEXT NOT NULL,
  subject TEXT NOT NULL,
  sentAt DATETIME NOT NULL,
  status TEXT DEFAULT 'sent' CHECK(status IN ('sent', 'failed', 'bounced')),
  errorMessage TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscriberId) REFERENCES [REDACTED_TOKEN](id) ON DELETE CASCADE
);

-- Índices para newsletter_sends
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON newsletter_sends(subscriberId);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON newsletter_sends(status);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON newsletter_sends(sentAt DESC);

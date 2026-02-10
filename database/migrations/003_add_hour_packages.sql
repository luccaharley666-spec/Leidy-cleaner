-- Migração 003: Adicionar sistema de pacotes de horas
-- Data: 2026-02-09

-- Tabela de Pacotes de Horas
CREATE TABLE IF NOT EXISTS hour_packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hours INTEGER NOT NULL UNIQUE,
  price_per_hour DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Crédito de Horas do Usuário
CREATE TABLE IF NOT EXISTS user_hour_credits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
  total_hours DECIMAL(10, 2) DEFAULT 0,
  used_hours DECIMAL(10, 2) DEFAULT 0,
  available_hours DECIMAL(10, 2) DEFAULT 0,
  last_purchase_date DATETIME,
  expiry_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Atualizar tabela bookings para salvar horas utilizadas
ALTER TABLE bookings ADD COLUMN hours_used DECIMAL(10, 2);
ALTER TABLE bookings ADD COLUMN paid_with_credits BOOLEAN DEFAULT 0;

-- Índices para Performance
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON user_hour_credits(user_id);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON hour_packages(is_active);

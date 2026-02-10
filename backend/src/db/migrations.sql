-- ============================================
-- MIGRATIONS - BANCO DE DADOS LEIDY CLEANER
-- ============================================

-- TABELA: users (com dados empresariais)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  cpf_cnpj TEXT,
  role TEXT DEFAULT 'client' CHECK(role IN ('client', 'admin', 'staff')),
  
  -- Dados Empresariais (para staff)
  company_name TEXT,
  company_cnpj TEXT,
  company_address TEXT,
  company_phone TEXT,
  bank_account TEXT,
  bank_routing TEXT,
  
  -- Dados Pessoais Completos
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  
  -- Sistema de Fidelidade
  five_star_streak INTEGER DEFAULT 0,
  total_five_stars INTEGER DEFAULT 0,
  loyalty_bonus DECIMAL(10,2) DEFAULT 0.00,
  bonus_redeemed BOOLEAN DEFAULT 0,
  
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TABELA: services (com novo sistema de preços)
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Preço por hora (primeira hora)
  base_price DECIMAL(10,2) DEFAULT 40.00,
  [REDACTED_TOKEN] DECIMAL(10,2) DEFAULT 20.00,
  
  -- Ajustes de preço
  [REDACTED_TOKEN] DECIMAL(5,2) DEFAULT 40.00,
  [REDACTED_TOKEN] DECIMAL(3,2) DEFAULT 1.50,
  
  duration INTEGER DEFAULT 60,
  category TEXT,
  active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TABELA: bookings (com avaliação e detalhes de preço)
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration_hours INTEGER DEFAULT 2,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  
  -- Cálculo de Preço Detalhado
  base_price DECIMAL(10,2),
  staff_fee DECIMAL(10,2) DEFAULT 0.00,
  extra_quarter_hours DECIMAL(5,2) DEFAULT 0.00,
  [REDACTED_TOKEN] DECIMAL(10,2) DEFAULT 0.00,
  final_price DECIMAL(10,2),
  
  -- Status e Avaliação
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  rating INTEGER,
  review TEXT,
  
  -- Flags especiais
  is_post_work BOOLEAN DEFAULT 0,
  has_extra_quarter BOOLEAN DEFAULT 0,
  recurring BOOLEAN DEFAULT 0,
  
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- TABELA: payments
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  method TEXT DEFAULT 'stripe' CHECK(method IN ('stripe', 'pix', 'cash')),
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed', 'waiting', 'received', 'confirmed', 'expired', 'processing')),
  stripe_id TEXT,
  transaction_id TEXT UNIQUE,
  qr_code LONGTEXT,
  br_code VARCHAR(255),
  pix_key VARCHAR(100),
  webhook_response LONGTEXT,
  confirmed_at DATETIME,
  expires_at DATETIME,
  user_id INTEGER,
  [REDACTED_TOKEN] DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ÍNDICES para performance nas queries de PIX
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON payments(user_id);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(method);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON payments(created_at);

-- TABELA: loyalty_history (rastreamento de bônus)
CREATE TABLE IF NOT EXISTS loyalty_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  booking_id INTEGER,
  bonus_type TEXT CHECK(bonus_type IN ('five_star', 'bonus_reached', 'bonus_redeemed')),
  amount DECIMAL(10,2),
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- TABELA: recurring_bookings (agendamentos recorrentes)
CREATE TABLE IF NOT EXISTS recurring_bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  frequency TEXT CHECK(frequency IN ('weekly', 'biweekly', 'monthly')),
  day_of_week INTEGER,
  time TIME,
  address TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_rating ON bookings(rating);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_loyalty_user ON loyalty_history(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_user ON recurring_bookings(user_id);

-- SEED: Serviços padrão (com novo sistema de preços)
INSERT OR IGNORE INTO services (name, description, base_price, [REDACTED_TOKEN], [REDACTED_TOKEN], [REDACTED_TOKEN], duration, category) VALUES
('Limpeza Básica', 'Limpeza geral da residência', 40.00, 20.00, 40.00, 1.50, 120, 'residencial'),
('Limpeza Profunda', 'Limpeza completa com detalhes', 40.00, 20.00, 40.00, 1.50, 180, 'residencial'),
('Limpeza Pós-Reforma', 'Limpeza especializada pós-obra', 40.00, 20.00, 40.00, 2.00, 240, 'comercial'),
('Limpeza de Escritório', 'Limpeza de ambiente comercial', 40.00, 20.00, 40.00, 1.50, 90, 'comercial'),
('Limpeza de Vidros', 'Serviço especializado em janelas', 40.00, 20.00, 40.00, 1.50, 60, 'especializado'),
('Higienização de Estofados', 'Limpeza de móveis estofados', 40.00, 20.00, 40.00, 1.50, 120, 'especializado');

-- SEED: Usuário admin padrão (senha: admin123 - será hashada na prática)
INSERT OR IGNORE INTO users (email, password, name, phone, role) VALUES
('admin@leidycleaner.com', '$2b$10$placeholder', 'Administrador', '5198030000', 'admin');
-- TABELA: chat_messages (mensagens em tempo real)
CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  user_role TEXT CHECK(user_role IN ('client', 'staff')),
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- TABELA: webhook_events (audit + idempotency para webhooks PIX)
CREATE TABLE IF NOT EXISTS webhook_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL UNIQUE,
  source TEXT,
  payload LONGTEXT,
  signature VARCHAR(255),
  received_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON webhook_events(event_id);

-- TABELA: booking_photos (fotos antes/depois)
CREATE TABLE IF NOT EXISTS booking_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  photo_type TEXT CHECK(photo_type IN ('before', 'after')),
  url TEXT NOT NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- ÍNDICES PARA CHAT E FOTOS
CREATE INDEX IF NOT EXISTS idx_chat_booking_id ON chat_messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_chat_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON booking_photos(booking_id);
CREATE INDEX IF NOT EXISTS idx_photos_type ON booking_photos(photo_type);

-- ADICIONAR CAMPOS AO BOOKINGS PARA REPOSTAS ADMIN
ALTER TABLE bookings ADD COLUMN admin_response TEXT;
ALTER TABLE bookings ADD COLUMN admin_response_at DATETIME;
ALTER TABLE bookings ADD COLUMN staff_id INTEGER;
ALTER TABLE bookings ADD COLUMN completed_at DATETIME;
ALTER TABLE bookings ADD COLUMN photos_count INTEGER DEFAULT 0;
-- Nota: SQLite não permite ADD FOREIGN KEY via ALTER TABLE em runtime.
-- A referência será mantida nas definições iniciais das tabelas quando possível.

-- TABELA: webhook_retries (fila de retentativas com backoff exponencial)
CREATE TABLE IF NOT EXISTS webhook_retries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  retry_id TEXT NOT NULL UNIQUE,
  operation_id TEXT NOT NULL,
  operation_type TEXT CHECK(operation_type IN ('process_webhook', 'send_notification', 'reconcile_payment')),
  payload LONGTEXT,
  metadata LONGTEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed', 'error')),
  retry_count INTEGER DEFAULT 0,
  next_retry_at DATETIME,
  last_error TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  failed_at DATETIME
);

-- ÍNDICES PARA FILA DE RETENTATIVAS
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON webhook_retries(status);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON webhook_retries(operation_id);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON webhook_retries(next_retry_at);

-- TABELA: background_jobs (jobs agendados para reconciliation, limpeza, etc)
CREATE TABLE IF NOT EXISTS background_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id TEXT NOT NULL UNIQUE,
  job_type TEXT NOT NULL CHECK(job_type IN ('reconcile_payments', 'cleanup_old_events', 'send_notifications', 'payment_reminder')),
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'running', 'completed', 'failed')),
  payload LONGTEXT,
  result LONGTEXT,
  error_message TEXT,
  next_run_at DATETIME,
  scheduled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME,
  completed_at DATETIME,
  run_count INTEGER DEFAULT 0
);

-- ÍNDICES PARA BACKGROUND JOBS
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON background_jobs(status);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON background_jobs(job_type);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON background_jobs(next_run_at);

-- TABELA: [REDACTED_TOKEN] (auditoria de reconciliação)
CREATE TABLE IF NOT EXISTS [REDACTED_TOKEN] (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id TEXT NOT NULL UNIQUE,
  booking_id INTEGER,
  payment_id INTEGER,
  [REDACTED_TOKEN] TEXT,
  status_in_system TEXT,
  reconciled BOOLEAN DEFAULT 0,
  reconciled_at DATETIME,
  notes TEXT,
  checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (payment_id) REFERENCES payments(id)
);

-- ÍNDICES PARA RECONCILIATION
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON [REDACTED_TOKEN](transaction_id);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON [REDACTED_TOKEN](reconciled);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON [REDACTED_TOKEN](checked_at);
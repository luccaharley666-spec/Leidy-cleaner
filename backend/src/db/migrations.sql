-- ============================================
-- MIGRATIONS - BANCO DE DADOS LEIDY CLEANER
-- ============================================

-- TABELA: users
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  password_hash TEXT,
  name TEXT NOT NULL,
  phone TEXT,
  cpf_cnpj TEXT,
  role TEXT DEFAULT 'customer' CHECK(role IN ('customer', 'admin', 'staff')),
  company_name TEXT,
  company_cnpj TEXT,
  company_address TEXT,
  company_phone TEXT,
  bank_account TEXT,
  bank_routing TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  five_star_streak INTEGER DEFAULT 0,
  total_five_stars INTEGER DEFAULT 0,
  loyalty_bonus DECIMAL(10,2) DEFAULT 0.00,
  bonus_redeemed BOOLEAN DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  -- ✅ NEW: 2FA (Two-Factor Authentication) columns
  two_factor_enabled BOOLEAN DEFAULT 0,
  two_factor_secret TEXT,
  two_factor_backup_codes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TABELA: services
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) DEFAULT 40.00,
  discount_per_hour DECIMAL(10,2) DEFAULT 20.00,
  service_fee DECIMAL(5,2) DEFAULT 40.00,
  extra_quarter_multiplier DECIMAL(3,2) DEFAULT 1.50,
  duration INTEGER DEFAULT 60,
  category TEXT,
  active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TABELA: bookings
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration_hours INTEGER DEFAULT 2,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  base_price DECIMAL(10,2),
  staff_fee DECIMAL(10,2) DEFAULT 0.00,
  extra_quarter_hours DECIMAL(5,2) DEFAULT 0.00,
  post_work_fee DECIMAL(10,2) DEFAULT 0.00,
  final_price DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  rating INTEGER,
  review TEXT,
  is_post_work BOOLEAN DEFAULT 0,
  has_extra_quarter BOOLEAN DEFAULT 0,
  recurring BOOLEAN DEFAULT 0,
  admin_response TEXT,
  admin_response_at DATETIME,
  staff_id INTEGER,
  completed_at DATETIME,
  photos_count INTEGER DEFAULT 0,
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
  webhook_received_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ÍNDICES para performance
-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(method);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_confirmed_at ON payments(confirmed_at);

-- TABELA: loyalty_history
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

-- TABELA: recurring_bookings
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
-- Bookings
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_staff_id ON bookings(staff_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_rating ON bookings(rating);

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Loyalty History
CREATE INDEX IF NOT EXISTS idx_loyalty_user ON loyalty_history(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_booking ON loyalty_history(booking_id);

-- Recurring Bookings
CREATE INDEX IF NOT EXISTS idx_recurring_user ON recurring_bookings(user_id);

-- TABELA: chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  user_role TEXT CHECK(user_role IN ('customer', 'staff')),
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- TABELA: webhook_events
CREATE TABLE IF NOT EXISTS webhook_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL UNIQUE,
  source TEXT,
  payload LONGTEXT,
  signature VARCHAR(255),
  received_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);

-- TABELA: booking_photos
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
CREATE INDEX IF NOT EXISTS idx_booking_photos_booking_id ON booking_photos(booking_id);
CREATE INDEX IF NOT EXISTS idx_photos_type ON booking_photos(photo_type);

-- TABELA: webhook_retries
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
CREATE INDEX IF NOT EXISTS idx_webhook_retries_status ON webhook_retries(status);
CREATE INDEX IF NOT EXISTS idx_webhook_retries_operation_id ON webhook_retries(operation_id);
CREATE INDEX IF NOT EXISTS idx_webhook_retries_next_retry_at ON webhook_retries(next_retry_at);

-- TABELA: background_jobs
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
CREATE INDEX IF NOT EXISTS idx_background_jobs_status ON background_jobs(status);
CREATE INDEX IF NOT EXISTS idx_background_jobs_job_type ON background_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_background_jobs_next_run_at ON background_jobs(next_run_at);

-- TABELA: payment_reconciliation
CREATE TABLE IF NOT EXISTS payment_reconciliation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id TEXT NOT NULL UNIQUE,
  booking_id INTEGER,
  payment_id INTEGER,
  amount_in_system TEXT,
  status_in_system TEXT,
  reconciled BOOLEAN DEFAULT 0,
  reconciled_at DATETIME,
  notes TEXT,
  checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (payment_id) REFERENCES payments(id)
);

-- ÍNDICES PARA RECONCILIATION
CREATE INDEX IF NOT EXISTS idx_payment_reconciliation_transaction_id ON payment_reconciliation(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_reconciliation_reconciled ON payment_reconciliation(reconciled);
CREATE INDEX IF NOT EXISTS idx_payment_reconciliation_checked_at ON payment_reconciliation(checked_at);

-- TABELA: company_settings (Configurações do sistema)
CREATE TABLE IF NOT EXISTS company_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_company_settings_key ON company_settings(key);

-- (Duplicate recurring_bookings definition removed - canonical table defined earlier)

-- NOTE: The migrations file previously contained a duplicated definition of
-- `recurring_bookings` with a conflicting schema (columns `customer_id` /
-- `professional_id`) which caused index creation to fail when the first
-- `recurring_bookings` table (with `user_id`) was present. The duplicate
-- block was removed to keep a single canonical table definition above.
-- If you need migration steps to convert between schemas, add explicit
-- ALTER TABLE statements here instead of redefining the table.

-- ============================================
-- SEED DATA (Inserir APÓS todas as tabelas)
-- ============================================

-- SEED: Services padrão
INSERT OR IGNORE INTO services (name, description, base_price, discount_per_hour, service_fee, extra_quarter_multiplier, duration, category) VALUES
('Limpeza Básica', 'Limpeza geral da residência', 40.00, 20.00, 40.00, 1.50, 120, 'residencial'),
('Limpeza Profunda', 'Limpeza completa com detalhes', 40.00, 20.00, 40.00, 1.50, 180, 'residencial'),
('Limpeza Pós-Reforma', 'Limpeza especializada pós-obra', 40.00, 20.00, 40.00, 2.00, 240, 'comercial'),
('Limpeza de Escritório', 'Limpeza de ambiente comercial', 40.00, 20.00, 40.00, 1.50, 90, 'comercial'),
('Limpeza de Vidros', 'Serviço especializado em janelas', 40.00, 20.00, 40.00, 1.50, 60, 'especializado'),
('Higienização de Estofados', 'Limpeza de móveis estofados', 40.00, 20.00, 40.00, 1.50, 120, 'especializado');

-- ✅ ADMIN CRIADO VIA SCRIPT PÓS-DEPLOY
-- Não criar admin padrão com senha em migrations (segurança)
-- Execute em produção: npm run create-admin -- --email=admin@domain.com
-- Isso vai gerar uma senha aleatória e pedir para trocar na primeira login
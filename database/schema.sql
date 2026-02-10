-- Schema principal do banco de dados
-- SQLite3 - Compatível com backend Node.js

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255),
  address TEXT,
  profile_image VARCHAR(500),
  avatar_url VARCHAR(500),
  avatar_updated_at DATETIME,
  role VARCHAR(50) DEFAULT 'customer',
  admin_password_hash VARCHAR(255),
  admin_verified_at DATETIME,
  last_login DATETIME,
  bio TEXT,
  social_links JSON,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Serviços
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  icon VARCHAR(50),
  duration_minutes INTEGER,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  team_member_id INTEGER REFERENCES users(id),
  service_id INTEGER REFERENCES services(id),
  booking_date DATETIME NOT NULL,
  address TEXT NOT NULL,
  notes TEXT,
  metragem DECIMAL(10, 2),
  frequency VARCHAR(50) DEFAULT 'once',
  urgency VARCHAR(50) DEFAULT 'normal',
  total_price DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Serviços por Agendamento
CREATE TABLE IF NOT EXISTS booking_services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER REFERENCES bookings(id),
  service_id INTEGER REFERENCES services(id),
  price DECIMAL(10, 2),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Transações de Pagamento
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER REFERENCES bookings(id),
  user_id INTEGER REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(100),
  payment_gateway_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Avaliações
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER REFERENCES bookings(id),
  user_id INTEGER REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images JSON,
  is_verified BOOLEAN DEFAULT 1,
  is_approved BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Histórico de Notificações
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  booking_id INTEGER REFERENCES bookings(id),
  type VARCHAR(100),
  title VARCHAR(255),
  message TEXT,
  is_read BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Informações da Empresa
CREATE TABLE IF NOT EXISTS company_info (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  website VARCHAR(255),
  logo_url VARCHAR(500),
  bank_name VARCHAR(255),
  account_holder_name VARCHAR(255),
  account_number VARCHAR(50),
  account_type VARCHAR(50),
  routing_number VARCHAR(50),
  pix_key VARCHAR(255),
  tax_id VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  postal_code VARCHAR(20),
  business_hours_open TIME,
  [REDACTED_TOKEN] TIME,
  payment_terms TEXT,
  return_policy TEXT,
  privacy_policy TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Histórico de Auditoria
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER REFERENCES users(id),
  action VARCHAR(100),
  entity_type VARCHAR(100),
  entity_id INTEGER,
  changes JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Uploads de Arquivos
CREATE TABLE IF NOT EXISTS file_uploads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  file_name VARCHAR(255),
  file_path VARCHAR(500),
  file_type VARCHAR(100),
  file_size INTEGER,
  s3_key VARCHAR(500),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Inscrições Push
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  endpoint VARCHAR(500) UNIQUE,
  auth VARCHAR(255),
  p256dh VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Agendamentos Recorrentes
CREATE TABLE IF NOT EXISTS recurring_bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  team_member_id INTEGER REFERENCES users(id),
  service_id INTEGER REFERENCES services(id),
  address TEXT,
  frequency VARCHAR(50),
  start_date DATE,
  end_date DATE,
  total_price DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para Performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_reviews_booking ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON transactions(booking_id);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON notifications(user_id);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON audit_log(admin_id);

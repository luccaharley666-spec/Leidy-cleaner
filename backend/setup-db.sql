-- =====================================================
-- SETUP INICIAL DO BANCO DE DADOS
-- Cria as tabelas principais e dados de teste
-- =====================================================

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

-- Tabela de Pagamentos PIX
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER REFERENCES bookings(id),
  user_id INTEGER REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  method VARCHAR(50),
  status VARCHAR(50) DEFAULT 'waiting',
  transaction_id VARCHAR(255),
  qr_code TEXT,
  br_code VARCHAR(500),
  expires_at DATETIME,
  pix_key VARCHAR(255),
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

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  booking_id INTEGER REFERENCES bookings(id),
  type VARCHAR(100),
  title VARCHAR(255),
  message TEXT,
  is_read BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Chat
CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  booking_id INTEGER REFERENCES bookings(id),
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON transactions(user_id);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON notifications(user_id);

-- =====================================================
-- DADOS INICIAIS DE TESTE
-- =====================================================

-- Usuário Admin (senha: AdminPassword123!@#)
-- Hash bcrypt gerado com 12 rounds
INSERT OR IGNORE INTO users (name, email, phone, password_hash, role, is_active, created_at)
VALUES (
  'Admin',
  'admin@leidycleaner.com.br',
  '5551999999999',
  '$2b$12$qQ8jIgJnEQsNdMp0f/[REDACTED_TOKEN].mGfAkEQke',
  'admin',
  1,
  CURRENT_TIMESTAMP
);

-- Serviços de exemplo
INSERT OR IGNORE INTO services (name, description, base_price, duration_minutes, category, is_active)
VALUES
  ('Limpeza Residencial', 'Limpeza completa da casa', 150.00, 120, 'residencial', 1),
  ('Limpeza Comercial', 'Limpeza de escritório e espaços comerciais', 200.00, 120, 'comercial', 1),
  ('Limpeza Pós-Obra', 'Limpeza após reforma ou construção', 300.00, 240, 'especial', 1),
  ('Limpeza de Vidros', 'Limpeza especializada de janelas', 100.00, 60, 'serviço', 1);

-- Usuário de teste (cliente)
INSERT OR IGNORE INTO users (name, email, phone, password_hash, role, is_active, created_at)
VALUES (
  'Cliente Teste',
  'cliente@test.com',
  '5551988888888',
  '$2b$12$[REDACTED_TOKEN]',
  'customer',
  1,
  CURRENT_TIMESTAMP
);

-- Índices para chat se não existirem
CREATE INDEX IF NOT EXISTS idx_chat_user_id ON chat_messages(user_id) WHERE 1=0;
CREATE INDEX IF NOT EXISTS idx_chat_created_at ON chat_messages(created_at) WHERE 1=0;

-- Status final
SELECT 'Database setup completo!' as status;

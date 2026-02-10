#!/usr/bin/env node

/**
 * Database Initialization Script
 * Cria o banco SQLite e popula com dados iniciais
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'backend_data', 'limpeza.db');
const dbDir = path.dirname(dbPath);

// Garantir que o diretório existe
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco:', err.message);
    process.exit(1);
  }
  console.log('✅ Conectado ao banco SQLite:', dbPath);
});

// Habilitar foreign keys
db.run('PRAGMA foreign_keys = ON');

const schema = `
-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT,
  address TEXT,
  role TEXT DEFAULT 'customer',
  is_active INTEGER DEFAULT 1,
  five_star_streak INTEGER DEFAULT 0,
  total_five_stars INTEGER DEFAULT 0,
  loyalty_bonus DECIMAL(10, 2) DEFAULT 0,
  bonus_redeemed INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Serviços
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  base_price DECIMAL(10, 2),
  icon TEXT,
  duration_minutes INTEGER,
  category TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Agendamentos (completa com todas as colunas)
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  service_id INTEGER REFERENCES services(id),
  staff_id INTEGER REFERENCES users(id),
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  duration_hours INTEGER DEFAULT 2,
  address TEXT NOT NULL,
  phone TEXT,
  base_price DECIMAL(10, 2),
  extra_quarter_hours DECIMAL(10, 2) DEFAULT 0,
  staff_fee DECIMAL(10, 2) DEFAULT 0,
  [REDACTED_TOKEN] DECIMAL(10, 2) DEFAULT 0,
  final_price DECIMAL(10, 2),
  is_post_work INTEGER DEFAULT 0,
  has_extra_quarter INTEGER DEFAULT 0,
  has_staff INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'unpaid',
  rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  review TEXT,
  notes TEXT,
  frequency TEXT DEFAULT 'once',
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

-- Tabela de Transações
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER REFERENCES bookings(id),
  user_id INTEGER REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT,
  transaction_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending',
  notes TEXT,
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
  admin_response TEXT,
  is_verified INTEGER DEFAULT 1,
  is_approved INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  booking_id INTEGER REFERENCES bookings(id),
  type TEXT,
  title TEXT,
  message TEXT,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Subscriptions (Push)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT,
  auth TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Recorrente
CREATE TABLE IF NOT EXISTS recurring_bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  service_id INTEGER REFERENCES services(id),
  frequency TEXT,
  day_of_week TEXT,
  time TEXT,
  address TEXT,
  phone TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON transactions(booking_id);
`;

const seedData = `
-- Usuários
INSERT OR IGNORE INTO users (id, name, email, phone, password_hash, role) VALUES
(1, 'Admin User', 'admin@test.com', '(51) 98030-3740', '[REDACTED_TOKEN]', 'admin'),
(2, 'Leidy Silva', 'leidy@test.com', '(51) 99999-9999', '[REDACTED_TOKEN]', 'staff'),
(3, 'Maria Santos', 'maria@test.com', '(51) 88888-8888', '[REDACTED_TOKEN]', 'staff'),
(4, 'João Cliente', 'joao@example.com', '(51) 99999-1111', '[REDACTED_TOKEN]', 'customer');

-- Serviços
INSERT OR IGNORE INTO services (id, name, description, price, base_price, icon, duration_minutes, category) VALUES
(1, 'Limpeza Residencial', 'Limpeza completa de apartamentos e casas', 120.00, 120.00, '🏠', 180, 'residencial'),
(2, 'Limpeza Profunda', 'Higienização e desinfecção com produtos especiais', 180.00, 180.00, '✨', 240, 'profunda'),
(3, 'Limpeza Comercial', 'Para escritórios, lojas e consultórios', 150.00, 150.00, '🏢', 180, 'comercial'),
(4, 'Faxina Pós-Obra', 'Limpeza completa após reformas', 250.00, 250.00, '🔨', 300, 'especial'),
(5, 'Limpeza de Tapetes', 'Higienização e limpeza profunda de tapetes', 80.00, 80.00, '🧵', 120, 'especial'),
(6, 'Limpeza de Vidros', 'Limpeza de janelas, espelhos e fachadas', 100.00, 100.00, '🪟', 120, 'especial');

-- Agendamentos (com colunas corretas)
INSERT OR IGNORE INTO bookings (id, user_id, service_id, staff_id, date, time, duration_hours, address, phone, base_price, final_price, status, rating, notes) VALUES
(1, 4, 1, 2, '2026-02-15', '14:00', 2, 'Rua A, 123 - Porto Alegre, RS', '(51) 99999-1111', 120.00, 120.00, 'confirmed', NULL, 'Agendamento confirmado'),
(2, 4, 2, 3, '2026-02-08', '10:00', 3, 'Rua B, 456 - Porto Alegre, RS', '(51) 99999-1111', 180.00, 180.00, 'completed', 5, 'Excelente trabalho!'),
(3, 4, 1, 2, '2026-01-28', '16:00', 2, 'Rua C, 789 - Porto Alegre, RS', '(51) 99999-1111', 120.00, 120.00, 'completed', 4, 'Muito bom!');

-- Avaliações
INSERT OR IGNORE INTO reviews (id, booking_id, user_id, rating, comment, is_approved) VALUES
(1, 2, 4, 5, 'Excelente trabalho! Muito profissional.', 1),
(2, 3, 4, 4, 'Muito bom, recomendo!', 1);
`;

db.serialize(() => {
  console.log('\n📋 Criando schema do banco...');
  
  // Criar tabelas
  db.exec(schema, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabelas:', err.message);
      process.exit(1);
    }
    console.log('✅ Tabelas criadas com sucesso');

    // Inserir dados seed
    console.log('\n🌱 Inserindo dados iniciais...');
    db.exec(seedData, (err) => {
      if (err) {
        console.error('❌ Erro ao inserir dados:', err.message);
        process.exit(1);
      }
      console.log('✅ Dados iniciais inseridos');

      // Verificar dados
      console.log('\n📊 Verificando dados...');
      db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (!err) console.log(`   ✓ Usuários: ${row.count}`);
      });
      db.get('SELECT COUNT(*) as count FROM services', (err, row) => {
        if (!err) console.log(`   ✓ Serviços: ${row.count}`);
      });
      db.get('SELECT COUNT(*) as count FROM bookings', (err, row) => {
        if (!err) console.log(`   ✓ Agendamentos: ${row.count}`);
      });
      db.get('SELECT COUNT(*) as count FROM reviews', (err, row) => {
        if (!err) console.log(`   ✓ Avaliações: ${row.count}`);
      });

      setTimeout(() => {
        console.log('\n✅ Banco inicializado com sucesso!');
        console.log(`📍 Arquivo: ${dbPath}\n`);
        db.close();
        process.exit(0);
      }, 500);
    });
  });
});

db.on('error', (err) => {
  console.error('❌ Erro no banco:', err.message);
  process.exit(1);
});

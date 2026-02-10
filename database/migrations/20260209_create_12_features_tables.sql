-- Migration: create all 12 new feature tables
PRAGMA foreign_keys = ON;

-- Cancelamentos
CREATE TABLE IF NOT EXISTS cancellations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  reason VARCHAR(255),
  refund_amount REAL,
  created_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Fidelidade
CREATE TABLE IF NOT EXISTS loyalty_points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  points INTEGER NOT NULL,
  reason VARCHAR(255),
  booking_id INTEGER,
  created_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS loyalty_rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  discount_percent INTEGER,
  free_hours INTEGER,
  active INTEGER DEFAULT 1
);

-- Add-ons / Marketplace
CREATE TABLE IF NOT EXISTS addons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  category VARCHAR(100),
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS booking_addons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  addon_id INTEGER NOT NULL,
  quantity INTEGER DEFAULT 1,
  price_at_time REAL NOT NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (addon_id) REFERENCES addons(id)
);

-- Subscrições
CREATE TABLE IF NOT EXISTS subscription_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  hours_per_month INTEGER NOT NULL,
  stripe_price_id VARCHAR(255),
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  plan_id INTEGER NOT NULL,
  [REDACTED_TOKEN] VARCHAR(255),
  status VARCHAR(50),
  started_at DATETIME,
  cancelled_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
);

-- Localização
CREATE TABLE IF NOT EXISTS user_addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  address VARCHAR(255) NOT NULL,
  latitude REAL,
  longitude REAL,
  is_default INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Avaliação de profissional
CREATE TABLE IF NOT EXISTS [REDACTED_TOKEN] (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  professional_id INTEGER NOT NULL,
  admin_id INTEGER NOT NULL,
  rating INTEGER CHECK(rating BETWEEN 1 AND 5),
  feedback TEXT,
  created_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (professional_id) REFERENCES users(id),
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- Agendamentos por hora
CREATE TABLE IF NOT EXISTS hourly_bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  professional_id INTEGER NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_hours REAL NOT NULL,
  hourly_rate REAL NOT NULL,
  total_amount REAL NOT NULL,
  status VARCHAR(50),
  created_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (professional_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS hourly_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  professional_id INTEGER UNIQUE NOT NULL,
  hourly_rate REAL NOT NULL,
  min_booking_hours REAL DEFAULT 0.5,
  max_booking_hours REAL DEFAULT 8,
  FOREIGN KEY (professional_id) REFERENCES users(id)
);

-- Blog
CREATE TABLE IF NOT EXISTS blog_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_id INTEGER,
  keywords VARCHAR(255),
  views INTEGER DEFAULT 0,
  published INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Notificações Push
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  subscription TEXT NOT NULL,
  created_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Criar índices
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON cancellations(booking_id);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON loyalty_points(user_id);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON booking_addons(booking_id);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON [REDACTED_TOKEN](professional_id);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON hourly_bookings(professional_id, date);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

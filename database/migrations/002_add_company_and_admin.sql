-- Migration: Add company info, admin features, and avatar support
-- Date: 2025-02-01

-- 1. Add company banking information table
CREATE TABLE IF NOT EXISTS company_info (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  website VARCHAR(255),
  logo_url VARCHAR(500),
  
  -- Banking info
  bank_name VARCHAR(255),
  account_holder_name VARCHAR(255),
  account_number VARCHAR(50),
  account_type VARCHAR(50), -- 'checking' or 'savings'
  routing_number VARCHAR(50),
  pix_key VARCHAR(255), -- Brazilian PIX key
  tax_id VARCHAR(50), -- CNPJ for companies, CPF for individuals
  
  -- Address
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  postal_code VARCHAR(10),
  
  -- Business hours
  business_hours_open TIME,
  [REDACTED_TOKEN] TIME,
  
  -- Settings
  payment_terms TEXT,
  return_policy TEXT,
  privacy_policy TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Enhance users table with avatar and admin setup fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_updated_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_password_hash VARCHAR(255); -- For admin login
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_verified_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS social_links JSON;

-- 3. Create audit log for admin activities
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INTEGER,
  changes JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create file uploads table for tracking avatars
CREATE TABLE IF NOT EXISTS file_uploads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER,
  s3_key VARCHAR(500), -- For AWS S3 storage
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Add indices for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_audit_log_admin ON audit_log(admin_id);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON file_uploads(user_id);

-- 6. Initial company info (update with your details)
INSERT OR REPLACE INTO company_info (id, name, email, phone) VALUES (
  1,
  'Limpeza Pro',
  'contact@limpezapro.com',
  '+55 (11) 98000-0000'
);

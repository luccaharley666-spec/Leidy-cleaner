-- Seed: Create default admin user and company info
-- Production: Replace passwords and company info with real values

-- 1. Create default admin account (password: Admin@123456)
-- To generate new hash: bcrypt.hash('YourPassword123', 12)
-- Default admin password hash for: Admin@123456789!
INSERT OR REPLACE INTO users (id, name, email, phone, password_hash, role, admin_password_hash, is_active, created_at)
VALUES (
  1,
  'Admin Master',
  'admin@limpezapro.com',
  '+55 (11) 98000-0001',
  '$2b$12$[REDACTED_TOKEN]', -- bcrypt hash - CHANGE IN PRODUCTION
  'admin',
  '$2b$12$[REDACTED_TOKEN]', -- bcrypt hash for admin panel - CHANGE IN PRODUCTION
  true,
  datetime('now')
);

-- 2. Create staff manager account (password: Staff@123456)
INSERT OR REPLACE INTO users (id, name, email, phone, password_hash, role, is_active, created_at)
VALUES (
  2,
  'Gerente de Equipe',
  'staff@limpezapro.com',
  '+55 (11) 98000-0002',
  '$2b$12$[REDACTED_TOKEN]', -- bcrypt hash - CHANGE IN PRODUCTION
  'staff',
  true,
  datetime('now')
);

-- 3. Update company info with banking details
UPDATE company_info SET
  name = 'Limpeza Pro - Serviços de Limpeza',
  email = 'contato@limpezapro.com',
  phone = '+55 (11) 98000-0000',
  website = 'https://www.limpezapro.com.br',
  
  -- Banking Information (EXAMPLE - UPDATE WITH REAL DATA)
  bank_name = 'Banco do Brasil',
  account_holder_name = 'Limpeza Pro Ltda',
  account_number = '123456',
  account_type = 'checking',
  routing_number = '0001000',
  pix_key = 'seu-email@limpezapro.com', -- OR CPF OR CNPJ OR phone
  tax_id = '12.345.678/0001-90', -- Company CNPJ
  
  -- Address
  address = 'Rua Exemplo, 123',
  city = 'São Paulo',
  state = 'SP',
  postal_code = '01311-100',
  
  -- Business Hours
  business_hours_open = '08:00:00',
  [REDACTED_TOKEN] = '18:00:00',
  
  -- Policies
  payment_terms = '50% adiantado, 50% no dia do serviço',
  return_policy = 'Garantia de satisfação em 24h',
  privacy_policy = 'Seus dados são protegidos conforme Lei Geral de Proteção de Dados',
  
  updated_at = datetime('now')
WHERE id = 1;

-- 4. Create demo team member with photo
INSERT OR REPLACE INTO users (id, name, email, phone, password_hash, role, avatar_url, bio, is_active, created_at)
VALUES (
  3,
  'João da Limpeza',
  'joao@limpezapro.com',
  '+55 (11) 99000-0001',
  '$2b$12$[REDACTED_TOKEN]', -- password: Joao@123456
  'staff',
  '/uploads/avatars/joao-default.jpg',
  'Profissional experiente em limpeza residencial e comercial',
  true,
  datetime('now')
);

-- 5. Create demo customer
INSERT OR REPLACE INTO users (id, name, email, phone, password_hash, role, is_active, created_at)
VALUES (
  4,
  'Maria Silva',
  'maria@example.com',
  '+55 (11) 99111-1111',
  '$2b$12$[REDACTED_TOKEN]', -- password: Maria@123456
  'customer',
  true,
  datetime('now')
);

-- 6. Create sample services
INSERT OR IGNORE INTO services (id, name, description, base_price, duration_minutes, category, is_active, created_at)
VALUES
  (1, 'Limpeza Residencial', 'Limpeza completa de casa ou apartamento', 150.00, 120, 'residential', true, datetime('now')),
  (2, 'Limpeza Comercial', 'Limpeza de escritórios e espaços comerciais', 200.00, 180, 'commercial', true, datetime('now')),
  (3, 'Limpeza Profunda', 'Limpeza profunda com desinfecção', 300.00, 240, 'deep-clean', true, datetime('now')),
  (4, 'Limpeza Pós-Obra', 'Limpeza especializada após reforma', 400.00, 300, 'post-construction', true, datetime('now')),
  (5, 'Organização de Ambientes', 'Organização e arrumação de espaços', 120.00, 90, 'organization', true, datetime('now'));

-- 7. Log the seed execution
INSERT INTO audit_log (admin_id, action, entity_type, changes, created_at)
VALUES (1, 'SEED_DATA_CREATED', 'SYSTEM', '{"users": 4, "services": 5, "company_info": 1}', datetime('now'));

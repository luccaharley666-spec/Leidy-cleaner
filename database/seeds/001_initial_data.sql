-- Seed: Dados Iniciais
-- Insere usuários, serviços e dados da empresa

-- Inserir usuários com senhas hash (bcrypt)
-- Todas as senhas: Admin@123456789! (hash: $2b$10$[REDACTED_TOKEN]/tvQe)
-- staff@limpezapro.com / Staff@123456789! (hash: $2b$10$[REDACTED_TOKEN])
-- joao@limpezapro.com / Joao@123456789! (hash: $2b$10$[REDACTED_TOKEN])
-- maria@example.com / Maria@123456789! (hash: $2b$10$[REDACTED_TOKEN])

INSERT OR IGNORE INTO users (name, email, phone, password_hash, role, bio, created_at) VALUES
('Admin Master', 'admin@limpezapro.com', '11 99999-0001', '$2b$10$[REDACTED_TOKEN]/tvQe', 'admin', 'Administrador do Sistema', datetime('now')),
('Gerente de Equipe', 'staff@limpezapro.com', '11 99999-0002', '$2b$10$[REDACTED_TOKEN]', 'staff', 'Gerenciador de Equipes', datetime('now')),
('João Silva', 'joao@limpezapro.com', '11 99999-0003', '$2b$10$[REDACTED_TOKEN]', 'staff', 'Membro da equipe de limpeza', datetime('now')),
('Maria Santos', 'maria@example.com', '11 99999-0004', '$2b$10$[REDACTED_TOKEN]', 'customer', 'Cliente regulador', datetime('now'));

-- Inserir serviços
INSERT OR IGNORE INTO services (name, description, base_price, category, duration_minutes, icon, is_active) VALUES
('Limpeza Residencial', 'Limpeza completa de casas e apartamentos', 150.00, 'residential', 120, '🏠', 1),
('Limpeza Comercial', 'Limpeza de escritórios e estabelecimentos', 250.00, 'commercial', 180, '🏢', 1),
('Limpeza Profunda', 'Higienização e desinfecção completa', 300.00, 'deep', 240, '✨', 1),
('Pós-Obra', 'Limpeza após reformas e construção', 400.00, 'construction', 300, '🔨', 1),
('Organização de Ambientes', 'Organização e deselcução de espaços', 200.00, 'organization', 180, '📦', 1);

-- Inserir informações da empresa
INSERT OR IGNORE INTO company_info (
  name, email, phone, website, 
  bank_name, account_holder_name, account_number, account_type, routing_number, pix_key, tax_id,
  address, city, state, postal_code,
  payment_terms, return_policy, privacy_policy
) VALUES (
  'Limpeza Pro LTDA',
  'contato@limpezapro.com',
  '11 3000-0000',
  'https://limpezapro.com',
  'Banco do Brasil',
  'LIMPEZA PRO LTDA',
  '123456-7',
  'Corrente',
  '001',
  'limpezapro@pix.com',
  '12.345.678/0001-90',
  'Rua das Flores, 123',
  'São Paulo',
  'SP',
  '01310-100',
  'Pagamento em até 30 dias',
  'Satisfação garantida ou dinheiro de volta em 7 dias',
  'Respeitamos sua privacidade e proteção de dados'
);

-- Log de seed
INSERT INTO audit_log (admin_id, action, entity_type, entity_id, changes, created_at) VALUES
(1, 'SEED_INIT', 'SYSTEM', 0, '{"tables": ["users", "services", "company_info"]}', datetime('now'));

-- =====================================================
-- CHATBOT SYSTEM - AI-powered customer support
-- =====================================================

-- Conversation logs
CREATE TABLE IF NOT EXISTS [REDACTED_TOKEN] (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  user_message LONGTEXT,
  bot_response LONGTEXT,
  intent VARCHAR(50),
  sentiment VARCHAR(20), -- positive, neutral, negative
  was_helpful BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_created_at (created_at)
);

-- FAQ database
CREATE TABLE IF NOT EXISTS chatbot_faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(100), -- pricing, booking, policy, technical
  question VARCHAR(255),
  answer LONGTEXT,
  keywords VARCHAR(500), -- comma-separated for search
  relevance INT DEFAULT 5, -- 1-10, used for ranking
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_is_active (is_active)
);

-- Support tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  subject VARCHAR(255),
  description LONGTEXT,
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  status VARCHAR(20) DEFAULT 'open', -- open, in_progress, resolved, closed
  assigned_to INT,
  resolution TEXT,
  satisfaction_rating INT, -- 1-5
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  INDEX idx_userId (userId),
  INDEX idx_status (status),
  INDEX idx_priority (priority)
);

-- Chatbot analytics
CREATE TABLE IF NOT EXISTS chatbot_analytics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  conversation_count INT,
  avg_satisfaction DECIMAL(3,2),
  escalations_count INT,
  last_interaction TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_userId (userId)
);

-- Insert sample FAQs
INSERT INTO chatbot_faqs (category, question, answer, keywords, relevance, is_active) VALUES
('pricing', 'Qual é o preço da limpeza residencial?', 
'A limpeza residencial custa entre R$150 a R$300, dependendo do tamanho e complexidade do imóvel. Uma home visit gratuita pode ser agendada para obter uma cotação exata.',
'preço, residencial, quanto custa, valor', 9, true),

('pricing', 'Vocês fazem limpeza profunda?', 
'Sim! Limpeza profunda custa R$400-600 e inclui: higienização de todos os móveis, limpeza de vidros, desinfecção, etc.',
'profunda, completa, desinsetização', 8, true),

('booking', 'Como agendar um serviço?',
'Muito fácil! 1) Clique em "Agendar" no menu 2) Escolha o serviço 3) Selecione data e hora 4) Pagamento 5) Confirmação!',
'agendar, reservar, marcar, agendamento', 10, true),

('policy', 'Qual é a política de cancelamento?',
'Você pode cancelar sem custo até 24h antes do agendamento. Cancelamentos com menos de 24h terão uma taxa de 50%.',
'cancelar, remarcar, desmarcar, reembolso', 9, true),

('policy', 'Vocês trabalham no domingo?',
'Não, operamos segunda a sábado: de seg-sex 8h-18h, sábado 8h-14h. Domingos fechado. Mas você pode agendar domingo via app para segunda!',
'domingo, feriado, horário, aberto', 8, true),

('technical', 'O site está lento ou não carrega',
'Desculpe! Tente: 1) Limpar cache do navegador 2) Usar navegador diferente 3) Tentar em outro dispositivo. Se persistir, chame suporte!',
'lento, não carrega, bug, problema', 6, true),

('technical', 'Não consigo fazer pagamento',
'Primeira ajuda: 1) Confirme sua senha 2) Tente outro navegador 3) Verifique se cartão/PIX está correto. Ainda não funciona? Vamos conectar você com agente.',
'pagamento, cartão, pix, erro, não funciona', 8, true);

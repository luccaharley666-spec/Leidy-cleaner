-- =====================================================
-- NOTIFICATIONS SYSTEM - WhatsApp, SMS, Email
-- =====================================================

-- Tabela de preferências de notificação do usuário
CREATE TABLE IF NOT EXISTS [REDACTED_TOKEN] (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL UNIQUE,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  whatsapp_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT true,
  reminder_2days BOOLEAN DEFAULT true,
  reminder_1day BOOLEAN DEFAULT true,
  reminder_1hour BOOLEAN DEFAULT false,
  [REDACTED_TOKEN] VARCHAR(50) DEFAULT 'standard',
  phone_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId)
);

-- Tabela de histórico de notificações enviadas
CREATE TABLE IF NOT EXISTS notification_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  bookingId INT,
  type VARCHAR(50), -- 'email', 'sms', 'whatsapp', 'push'
  status VARCHAR(20), -- 'pending', 'sent', 'failed', 'read'
  recipient VARCHAR(255), -- email ou phone
  message_template VARCHAR(100),
  message_content LONGTEXT,
  error_message TEXT,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_bookingId (bookingId),
  INDEX idx_type (type),
  INDEX idx_sent_at (sent_at)
);

-- Tabela de templates de mensagens
CREATE TABLE IF NOT EXISTS [REDACTED_TOKEN] (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE,
  type VARCHAR(50), -- 'sms', 'whatsapp', 'email'
  subject VARCHAR(255),
  body LONGTEXT,
  variables JSON, -- {"name", "date", "time", "service"}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de fila de notificações agendadas
CREATE TABLE IF NOT EXISTS notification_queue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  bookingId INT,
  notification_type VARCHAR(50), -- '2days_before', '1day_before', '1hour_before'
  scheduled_send_time DATETIME,
  delivery_channels JSON, -- ["sms", "whatsapp", "email"]
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'sent', 'failed'
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  next_retry_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX [REDACTED_TOKEN] (scheduled_send_time),
  INDEX idx_status (status)
);

-- Inserts de templates padrão
INSERT INTO [REDACTED_TOKEN] (name, type, subject, body, variables, is_active) VALUES
('[REDACTED_TOKEN]', 'email', 'Agendamento Confirmado - {{serviceName}}', 
'Olá {{userName}},\n\nSeu agendamento foi confirmado!\n\nServiço: {{serviceName}}\nData: {{bookingDate}}\nHora: {{bookingTime}}\nLocal: {{location}}\n\nCódigo do Agendamento: #{{bookingId}}\n\nQualquer dúvida, entre em contato!\n\nLeidy Cleaner',
'["userName", "serviceName", "bookingDate", "bookingTime", "location", "bookingId"]', true),

('[REDACTED_TOKEN]', 'whatsapp', NULL,
'👋 Olá {{userName}}! Lembrando seu agendamento de {{serviceName}} em 2 dias:\n📅 {{bookingDate}} às {{bookingTime}}\n📍 {{location}}\n\nCódigo: #{{bookingId}}\n✓ Confirmar | 📅 Reagendar | 📞 Suporte',
'["userName", "serviceName", "bookingDate", "bookingTime", "location", "bookingId"]', true),

('[REDACTED_TOKEN]', 'sms', NULL,
'Leidy Cleaner: Agende de {{serviceName}} amanhã ({{bookingTime}}) no endereço {{location}}. Código: #{{bookingId}}. Confirme aqui: [link]',
'["serviceName", "bookingTime", "location", "bookingId"]', true),

('[REDACTED_TOKEN]', 'whatsapp', NULL,
'⏰ Falta 1 hora! {{firstName}}, estamos chegando em breve.\n🏠 Endereço: {{location}}\n\nEstou a caminho! Qualquer dúvida: [tel]',
'["firstName", "location"]', true),

('booking_completed', 'whatsapp', NULL,
'✨ Obrigada {{firstName}}! Sua limpeza foi concluída com sucesso! 🎉\n\n⭐ Deixe sua avaliação: [link]\n\nPromoção: Use VOLTA15 para -15% no próximo agendamento!',
'["firstName"]', true);

-- Demo Data for VAMOS Platform Testing
-- Dados realistas para demonstração

-- 1. Insert Demo Users (if not exists)
INSERT OR IGNORE INTO users (id, name, email, phone, password_hash, role, is_active, created_at)
VALUES 
  (1, 'Admin Leidy', 'admin@leidy.com', '11999999999', '$2b$10$[REDACTED_TOKEN]', 'admin', 1, datetime('now')),
  (2, 'Maria Silva', 'maria@leidy.com', '11988888888', '$2b$10$[REDACTED_TOKEN]', 'staff', 1, datetime('now')),
  (3, 'João Cliente', 'joao@email.com', '11985555555', '$2b$10$[REDACTED_TOKEN]', 'customer', 1, datetime('now')),
  (4, 'Ana Santos', 'ana@email.com', '11984444444', '$2b$10$[REDACTED_TOKEN]', 'customer', 1, datetime('now')),
  (5, 'Carlos Costa', 'carlos@email.com', '11983333333', '$2b$10$[REDACTED_TOKEN]', 'customer', 1, datetime('now'));

-- 2. Insert Demo Services (if not exists)
INSERT OR IGNORE INTO services (id, name, description, base_price, category, duration_minutes, is_active)
VALUES 
  (1, 'Limpeza Rápida', 'Limpeza de ambientes pequenos, 2-3 horas', 160.00, 'residential', 150, 1),
  (2, 'Limpeza Completa', 'Limpeza profunda de imóvel inteiro, 4-5 horas', 300.00, 'residential', 270, 1),
  (3, 'Limpeza Comercial', 'Limpeza de escritórios e lojas', 400.00, 'commercial', 180, 1),
  (4, 'Limpeza Pós-Mudança', 'Limpeza de imóvel após mudança', 500.00, 'special', 360, 1),
  (5, 'Organização e Faxina', 'Limpeza + organização de ambientes', 240.00, 'residential', 180, 1);

-- 3. Insert Demo Bookings (past and upcoming - completed)
INSERT OR IGNORE INTO bookings (id, user_id, team_member_id, service_id, booking_date, address, status, payment_status, total_price, notes, created_at)
VALUES 
  (1, 3, 2, 1, datetime('now', '-7 days', '10:00'), 'Rua A, 100 - São Paulo, SP', 'completed', 'paid', 160.00, 'Limpeza realizada com sucesso', datetime('now', '-7 days')),
  (2, 4, 2, 2, datetime('now', '-3 days', '14:00'), 'Av. Paulista, 500 - São Paulo, SP', 'completed', 'paid', 300.00, 'Cliente satisfeito com o resultado', datetime('now', '-3 days')),
  (3, 3, 2, 3, datetime('now', '+3 days', '09:00'), 'Rua B, 200 - São Paulo, SP', 'confirmed', 'unpaid', 400.00, 'Agendado para próxima semana', datetime('now')),
  (4, 5, 2, 1, datetime('now', '+7 days', '15:00'), 'Rua C, 300 - São Paulo, SP', 'pending', 'unpaid', 160.00, 'Aguardando confirmação do cliente', datetime('now')),
  (5, 4, 2, 5, datetime('now', '+14 days', '10:00'), 'Rua D, 400 - São Paulo, SP', 'confirmed', 'unpaid', 240.00, 'Limpeza + organização marcada', datetime('now'));

-- 4. Insert Demo Reviews (only for completed bookings)
INSERT OR IGNORE INTO reviews (id, booking_id, user_id, rating, comment, created_at)
VALUES 
  (1, 1, 3, 5, 'Excelente serviço! Maria foi muito atencioso e eficiente. Recomendo!', datetime('now', '-7 days')),
  (2, 2, 4, 4, 'Ótima limpeza, ambiente ficou impecável. Maria é profissional!', datetime('now', '-3 days'));

-- 5. Insert Demo Notifications
INSERT OR IGNORE INTO notifications (id, user_id, type, title, message, is_read, created_at)
VALUES 
  (1, 3, 'booking_confirmed', 'Agendamento Confirmado', 'Seu agendamento para 3 de fevereiro às 09:00 foi confirmado', 1, datetime('now', '-7 days')),
  (2, 4, 'review_request', 'Deixe uma Avaliação', 'Sua limpeza foi concluída. Deixe uma avaliação!', 1, datetime('now', '-3 days')),
  (3, 2, 'new_booking', 'Novo Agendamento', 'João Cliente agendou um serviço para 3 de fevereiro', 0, datetime('now'));

-- 6. Insert Demo Company Info
INSERT OR REPLACE INTO company_info (id, name, email, phone)
VALUES (1, 'VAMOS - Serviços de Limpeza', 'contato@vamos.com.br', '(11) 3000-0000');

-- Verify data inserted
.print
.print ✅ Demo data loaded successfully!
.print
SELECT COUNT(*) as "👤 Total de Usuários" FROM users;
SELECT COUNT(*) as "🧹 Total de Serviços" FROM services;
SELECT COUNT(*) as "📅 Total de Agendamentos" FROM bookings;
SELECT COUNT(*) as "⭐ Total de Avaliações" FROM reviews;
SELECT COUNT(*) as "🔔 Total de Notificações" FROM notifications;

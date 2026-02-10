-- =====================================================
-- SEED DATA - Dados Reais de Teste
-- Popula o banco com dados realistas para testes
-- =====================================================

-- Limpar dados existentes (opcionalmente)
-- DELETE FROM bookings;
-- DELETE FROM services;
-- DELETE FROM users;

-- ===== USUÁRIOS DE TESTE =====

-- Admin (já existe, apenas verificação)
INSERT OR IGNORE INTO users (id, name, email, phone, password_hash, role, is_active, created_at)
VALUES (
  1,
  'Administrador',
  'admin@leidycleaner.com.br',
  '5551999999999',
  '$2b$12$[REDACTED_TOKEN].ewt.hCy.[REDACTED_TOKEN]',
  'admin',
  1,
  '2026-01-01 10:00:00'
);

-- Gerente de operações
INSERT OR IGNORE INTO users (id, name, email, phone, password_hash, role, is_active, created_at)
VALUES (
  3,
  'Maria Silva',
  'maria@leidycleaner.com.br',
  '5551987654321',
  '$2b$12$[REDACTED_TOKEN].ewt.hCy.[REDACTED_TOKEN]',
  'manager',
  1,
  '2026-01-05 09:30:00'
);

-- Profissional de limpeza 1
INSERT OR IGNORE INTO users (id, name, email, phone, password_hash, role, is_active, created_at)
VALUES (
  4,
  'João Limpador',
  'joao@leidycleaner.com.br',
  '5551988888888',
  '$2b$12$[REDACTED_TOKEN].ewt.hCy.[REDACTED_TOKEN]',
  'staff',
  1,
  '2026-01-10 08:00:00'
);

-- Profissional de limpeza 2
INSERT OR IGNORE INTO users (id, name, email, phone, password_hash, role, is_active, created_at)
VALUES (
  5,
  'Ana Costa',
  'ana@leidycleaner.com.br',
  '5551977777777',
  '$2b$12$[REDACTED_TOKEN].ewt.hCy.[REDACTED_TOKEN]',
  'staff',
  1,
  '2026-01-15 07:45:00'
);

-- Clientes
INSERT OR IGNORE INTO users (id, name, email, phone, password_hash, role, is_active, created_at)
VALUES
  (10, 'Carlos Oliveira', 'carlos.oliveira@email.com', '5551999888777', '$2b$12$[REDACTED_TOKEN].ewt.hCy.[REDACTED_TOKEN]', 'customer', 1, '2026-01-20 14:00:00'),
  (11, 'Beatriz Santos', 'beatriz.santos@email.com', '5551999777666', '$2b$12$[REDACTED_TOKEN].ewt.hCy.[REDACTED_TOKEN]', 'customer', 1, '2026-01-22 15:30:00'),
  (12, 'Felipe Mendes', 'felipe.mendes@email.com', '5551999666555', '$2b$12$[REDACTED_TOKEN].ewt.hCy.[REDACTED_TOKEN]', 'customer', 1, '2026-01-25 11:00:00'),
  (13, 'Juliana Costa', 'juliana.costa@email.com', '5551999555444', '$2b$12$[REDACTED_TOKEN].ewt.hCy.[REDACTED_TOKEN]', 'customer', 1, '2026-01-28 16:45:00'),
  (14, 'Roberto Alves', 'roberto.alves@email.com', '5551999444333', '$2b$12$[REDACTED_TOKEN].ewt.hCy.[REDACTED_TOKEN]', 'customer', 1, '2026-02-01 09:15:00');

-- ===== SERVIÇOS =====

-- Deletar serviços antigos se houver
DELETE FROM services WHERE id <= 4;

INSERT INTO services (id, name, description, base_price, duration_minutes, category, is_active, created_at)
VALUES
  (1, 'Limpeza Residencial Básica', 'Limpeza completa de apartamento ou casa com até 100m²', 150.00, 120, 'residencial', 1, '2026-01-01 10:00:00'),
  (2, 'Limpeza Residencial Premium', 'Limpeza profunda com enceramento e limpeza de janelas', 250.00, 180, 'residencial', 1, '2026-01-01 10:00:00'),
  (3, 'Limpeza Comercial', 'Limpeza de escritórios, lojas e espaços comerciais', 200.00, 120, 'comercial', 1, '2026-01-01 10:00:00'),
  (4, 'Limpeza Pós-Obra', 'Limpeza especializada após reforma ou construção', 350.00, 240, 'especial', 1, '2026-01-01 10:00:00'),
  (5, 'Limpeza de Vidros', 'Limpeza especializada de janelas e vidros', 100.00, 60, 'serviço', 1, '2026-01-01 10:00:00'),
  (6, 'Limpeza de Sofás', 'Higienização e limpeza profunda de sofás e estofados', 120.00, 90, 'serviço', 1, '2026-01-01 10:00:00'),
  (7, 'Organização e Limpeza', 'Organização de ambientes + limpeza completa', 200.00, 150, 'serviço', 1, '2026-01-01 10:00:00');

-- ===== AGENDAMENTOS DE TESTE =====

-- Agendamento passado (concluído)
INSERT OR IGNORE INTO bookings (
  id, user_id, team_member_id, service_id, 
  booking_date, address, notes, metragem, status, 
  payment_status, total_price, created_at, updated_at
) VALUES (
  1, 10, 4, 1,
  '2026-02-01 10:00:00', 'Rua A, 123, Curitiba, PR', 'Cliente atencioso', 80.0,
  'completed', 'paid', 150.00, '2026-01-20 14:15:00', '2026-02-01 12:00:00'
);

-- Agendamento em andamento
INSERT OR IGNORE INTO bookings (
  id, user_id, team_member_id, service_id,
  booking_date, address, notes, metragem, status,
  payment_status, total_price, created_at, updated_at
) VALUES (
  2, 11, 5, 2,
  '2026-02-12 14:00:00', 'Rua B, 456, Curitiba, PR', 'Apto com 3 quartos',  120.0,
  'confirmed', 'paid', 250.00, '2026-01-22 15:45:00', '2026-01-23 09:00:00'
);

-- Agendamento pendente
INSERT OR IGNORE INTO bookings (
  id, user_id, team_member_id, service_id,
  booking_date, address, notes, metragem, status,
  payment_status, total_price, created_at, updated_at
) VALUES (
  3, 12, 4, 3,
  '2026-02-15 09:00:00', 'Av. C, 789, Curitiba, PR', 'Escritório 150m²', 150.0,
  'pending', 'unpaid', 200.00, '2026-01-25 11:30:00', '2026-01-25 11:30:00'
);

-- Agendamento com múltiplos serviços
INSERT OR IGNORE INTO bookings (
  id, user_id, team_member_id, service_id,
  booking_date, address, notes, metragem, status,
  payment_status, total_price, created_at, updated_at
) VALUES (
  4, 13, 5, 4,
  '2026-02-20 08:00:00', 'Rua D, 321, Curitiba, PR', 'Pós-obra, obra grande',  200.0,
  'scheduled', 'pending', 350.00, '2026-01-28 17:00:00', '2026-01-28 17:00:00'
);

-- Agendamento cancelado
INSERT OR IGNORE INTO bookings (
  id, user_id, team_member_id, service_id,
  booking_date, address, notes, metragem, status,
  payment_status, total_price, created_at, updated_at
) VALUES (
  5, 14, 4, 5,
  '2026-02-08 11:00:00', 'Rua E, 654, Curitiba, PR', 'Cancelado por cliente', 30.0,
  'cancelled', 'refunded', 100.00, '2026-02-01 09:20:00', '2026-02-02 10:15:00'
);

-- ===== TRANSAÇÕES DE PAGAMENTO =====

-- Pagamento concluído
INSERT OR IGNORE INTO transactions (id, booking_id, user_id, amount, payment_method, status, created_at)
VALUES
  (1, 1, 10, 150.00, 'pix', 'completed', '2026-02-01 10:30:00'),
  (2, 2, 11, 250.00, 'stripe', 'completed', '2026-01-23 09:15:00'),
  (3, 3, 12, 200.00, 'card', 'pending', '2026-01-25 11:35:00'),
  (4, 4, 13, 350.00, 'pix', 'pending', '2026-01-28 17:05:00'),
  (5, 5, 14, 100.00, 'pix', 'refunded', '2026-02-02 10:20:00');

-- ===== AVALIAÇÕES =====

-- Avaliação do agendamento concluído
INSERT OR IGNORE INTO reviews (id, booking_id, user_id, rating, comment, is_verified, is_approved, created_at)
VALUES (
  1, 1, 10, 5, 'Excelente trabalho! Equipe muito profissional e atenciosa. Recomendo!',
  1, 1, '2026-02-02 14:00:00'
);

-- Avaliação com comentário positivo
INSERT OR IGNORE INTO reviews (id, booking_id, user_id, rating, comment, is_verified, is_approved, created_at)
VALUES (
  2, 2, 11, 4, 'Muito bom, chegaram no horário e fizeram o serviço bem',
  1, 1, '2026-02-03 10:00:00'
);

-- ===== NOTIFICAÇÕES DE EXEMPLO =====

INSERT OR IGNORE INTO notifications (id, user_id, booking_id, type, title, message, is_read, created_at)
VALUES
  (1, 10, 1, 'booking_completed', 'Agendamento Concluído', 'Seu agendamento foi concluído com sucesso!', 1, '2026-02-01 12:05:00'),
  (2, 11, 2, 'booking_confirmed', 'Agendamento Confirmado', 'Seu agendamento foi confirmado para 12 de Fevereiro', 0, '2026-01-23 09:20:00'),
  (3, 12, 3, 'payment_pending', 'Pagamento Pendente', 'Por favor, finalize o pagamento do seu agendamento', 0, '2026-01-25 11:40:00');

-- ===== CHAT MESSAGES DE EXEMPLO =====

INSERT OR IGNORE INTO chat_messages (id, user_id, booking_id, message, created_at)
VALUES
  (1, 10, 1, 'Olá, gostaria de saber se vocês cobrem também a limpeza de vidros?', '2026-01-20 14:30:00'),
  (2, 4, 1, 'Sim, cobrimos! Temos um serviço especializado de limpeza de vidros.', '2026-01-20 14:35:00'),
  (3, 10, 1, 'Ótimo! Posso contratar também para a próxima vez', '2026-01-20 14:40:00'),
  (4, 11, 2, 'Qual é o horário exato da chegada na próxima semana?', '2026-01-24 10:00:00'),
  (5, 5, 2, 'Chegaremos entre 13:30 e 14:00. Você estará em casa?', '2026-01-24 10:05:00');

-- ===== STATUS FINAL =====

SELECT 
  (SELECT COUNT(*) FROM users WHERE role != 'admin') as usuarios_teste,
  (SELECT COUNT(*) FROM services) as servicos,
  (SELECT COUNT(*) FROM bookings) as agendamentos,
  (SELECT COUNT(*) FROM transactions) as transacoes,
  (SELECT COUNT(*) FROM reviews) as avaliacoes,
  (SELECT COUNT(*) FROM notifications) as notificacoes,
  (SELECT COUNT(*) FROM chat_messages) as mensagens;

-- Resultado esperado: 9 | 7 | 5 | 5 | 2 | 3 | 5

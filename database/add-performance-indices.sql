-- Índices para melhor performance
-- Executar: sqlite3 limpeza.db < [REDACTED_TOKEN].sql

-- Índices em bookings (tabela mais consultada)
-- Nota: [REDACTED_TOKEN], idx_bookings_date, idx_bookings_status já existem
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON bookings(user_id, service_id);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON bookings(booking_date, status);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON bookings(team_member_id);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON bookings(payment_status);

-- Índices em users (autenticação)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at);

-- Índices em services
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);

-- Índices em reviews (para dashboard de avaliações)
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at);

-- Índices em company_info (para queries de admin)
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON company_info(updated_at);

-- Análise de query efficiency
ANALYZE;

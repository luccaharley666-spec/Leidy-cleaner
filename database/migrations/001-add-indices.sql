-- Índices para melhorar performance de queries
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON bookings(user_id, booking_date DESC);

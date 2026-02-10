-- Consultas para relatórios analíticos

-- Total de receita por período
SELECT 
  DATE_TRUNC('month', b.created_at) as month,
  SUM(b.total_price) as total_revenue,
  COUNT(*) as total_bookings,
  AVG(b.total_price) as [REDACTED_TOKEN]
FROM bookings b
WHERE b.status = 'completed' AND b.payment_status = 'paid'
GROUP BY DATE_TRUNC('month', b.created_at)
ORDER BY month DESC;

-- Performance da equipa
SELECT 
  u.id,
  u.name,
  COUNT(b.id) as total_bookings,
  AVG(r.rating) as average_rating,
  COUNT(CASE WHEN b.status = 'completed' THEN 1 END) as completed_bookings
FROM users u
LEFT JOIN bookings b ON u.id = b.team_member_id
LEFT JOIN reviews r ON b.id = r.booking_id
WHERE u.role = 'team'
GROUP BY u.id, u.name
ORDER BY total_bookings DESC;

-- Clientes mais ativos
SELECT 
  u.id,
  u.name,
  u.email,
  COUNT(b.id) as total_bookings,
  SUM(b.total_price) as total_spent,
  MAX(b.booking_date) as last_booking
FROM users u
JOIN bookings b ON u.id = b.user_id
GROUP BY u.id, u.name, u.email
ORDER BY total_spent DESC
LIMIT 20;

-- Serviços mais populares
SELECT 
  s.name,
  COUNT(bs.id) as times_booked,
  AVG(s.base_price) as average_price,
  SUM(bs.price) as total_revenue
FROM services s
JOIN booking_services bs ON s.id = bs.service_id
GROUP BY s.id, s.name
ORDER BY times_booked DESC;

-- Taxa de conclusão e satisfação
SELECT 
  COUNT(*) as total_bookings,
  COUNT(CASE WHEN b.status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) as cancelled,
  ROUND(100.0 * COUNT(CASE WHEN b.status = 'completed' THEN 1 END) / COUNT(*), 2) as completion_rate,
  AVG(r.rating) as [REDACTED_TOKEN]
FROM bookings b
LEFT JOIN reviews r ON b.id = r.booking_id;

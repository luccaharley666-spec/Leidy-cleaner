/**
 * Staff Controller - Dashboard para Funcionárias
 * Agendamentos, ganhos, avaliações
 */

const db = require('../db');

class StaffController {
  /**
   * Dashboard da funcionária
   */
  async getDashboard(req, res) {
    try {
      const { staffId } = req.params || req.user.id;
      const userId = staffId || req.user.id;

      const dashboardData = {};

      // Resumo geral de ganhos
      const earningsQuery = `
        SELECT 
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as total_completed,
          ROUND(SUM(CASE WHEN status = 'completed' THEN final_price * 0.1 ELSE 0 END), 2) as total_earnings,
          ROUND(AVG(CASE WHEN rating IS NOT NULL THEN rating ELSE NULL END), 2) as average_rating,
          COUNT(CASE WHEN rating = 5 THEN 1 END) as five_stars_count
        FROM bookings
        WHERE staff_id = $1
      `;
      const earningsResult = await db.query(earningsQuery, [userId]);
      dashboardData.earnings = earningsResult.rows[0];

      // Ganhos este mês
      const monthlyQuery = `
        SELECT 
          ROUND(SUM(final_price * 0.1), 2) as monthly_earnings,
          COUNT(*) as monthly_bookings
        FROM bookings
        WHERE staff_id = $1
        AND status = 'completed'
        AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM NOW())
        AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM NOW())
      `;
      const monthlyResult = await db.query(monthlyQuery, [userId]);
      dashboardData.monthlyEarnings = monthlyResult.rows[0];

      // Agendamentos próximos
      const upcomingQuery = `
        SELECT 
          b.id,
          b.date,
          b.time,
          b.status,
          b.final_price,
          b.durationHours,
          u.name as customer_name,
          u.phone as customer_phone,
          s.name as service_name,
          b.address,
          ROUND(b.final_price * 0.1, 2) as commission
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN services s ON b.service_id = s.id
        WHERE b.staff_id = $1
        AND b.date BETWEEN NOW() AND NOW() + INTERVAL '7 days'
        AND b.status IN ('pending', 'confirmed')
        ORDER BY b.date, b.time
      `;
      const upcomingResult = await db.query(upcomingQuery, [userId]);
      dashboardData.upcomingBookings = upcomingResult.rows;

      // Avaliações recentes
      const reviewsQuery = `
        SELECT 
          b.id,
          b.date,
          b.rating,
          b.review,
          u.name as customer_name,
          s.name as service_name
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN services s ON b.service_id = s.id
        WHERE b.staff_id = $1
        AND b.rating IS NOT NULL
        AND b.date >= NOW() - INTERVAL '30 days'
        ORDER BY b.date DESC
        LIMIT 10
      `;
      const reviewsResult = await db.query(reviewsQuery, [userId]);
      dashboardData.recentReviews = reviewsResult.rows;

      // Streak de 5 estrelas
      const streakQuery = `
        SELECT five_star_streak as current_streak
        FROM users
        WHERE id = $1 AND role = 'staff'
      `;
      const streakResult = await db.query(streakQuery, [userId]);
      dashboardData.fiveStarStreak = streakResult.rows[0];

      res.json(dashboardData);
    } catch (error) {
      console.error('Erro ao buscar dashboard de funcionária:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Histórico de agendamentos da funcionária
   */
  async getBookingHistory(req, res) {
    try {
      const { staffId } = req.params || req.user.id;
      const { status, startDate, endDate, limit = 50, offset = 0 } = req.query;

      const userId = staffId || req.user.id;

      let query = `
        SELECT 
          b.id,
          b.date,
          b.time,
          b.status,
          b.final_price,
          b.rating,
          b.review,
          u.name as customer_name,
          u.phone as customer_phone,
          s.name as service_name,
          b.address,
          ROUND(b.final_price * 0.1, 2) as commission
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN services s ON b.service_id = s.id
        WHERE b.staff_id = $1
      `;

      const params = [userId];
      let paramCount = 2;

      if (status) {
        query += ` AND b.status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }

      if (startDate) {
        query += ` AND b.date >= $${paramCount}`;
        params.push(startDate);
        paramCount++;
      }

      if (endDate) {
        query += ` AND b.date <= $${paramCount}`;
        params.push(endDate);
        paramCount++;
      }

      query += ` ORDER BY b.date DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar histórico de agendamentos:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Ganhos por período
   */
  async getEarningsByPeriod(req, res) {
    try {
      const { staffId } = req.params || req.user.id;
      const userId = staffId || req.user.id;

      const query = `
        SELECT 
          DATE_TRUNC('day', date) as period,
          COUNT(*) as bookings,
          ROUND(SUM(final_price * 0.1), 2) as earnings
        FROM bookings
        WHERE staff_id = $1
        AND status = 'completed'
        AND date >= NOW() - INTERVAL '30 days'
        GROUP BY DATE_TRUNC('day', date)
        ORDER BY period DESC
      `;

      const result = await db.query(query, [userId]);
      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar ganhos por período:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Confirmar agendamento (marcar como em andamento)
   */
  async confirmBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const { staffId } = req.user.id;

      // Verificar se é da funcionária
      const checkQuery = `
        SELECT staff_id FROM bookings WHERE id = $1
      `;
      const checkResult = await db.query(checkQuery, [bookingId]);

      if (checkResult.rows.length === 0 || checkResult.rows[0].staff_id !== staffId) {
        return res.status(403).json({ error: 'Não autorizado' });
      }

      const updateQuery = `
        UPDATE bookings 
        SET status = 'in_progress'
        WHERE id = $1
        RETURNING *
      `;

      const result = await db.query(updateQuery, [bookingId]);
      res.json({ message: 'Agendamento iniciado', booking: result.rows[0] });
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Finalizar agendamento
   */
  async completeBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const { staffId } = req.user.id;

      const updateQuery = `
        UPDATE bookings 
        SET status = 'completed', completed_at = NOW()
        WHERE id = $1 AND staff_id = $2
        RETURNING *
      `;

      const result = await db.query(updateQuery, [bookingId, staffId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }

      res.json({ message: 'Agendamento finalizado', booking: result.rows[0] });
    } catch (error) {
      console.error('Erro ao finalizar agendamento:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Relatório para pagamento
   */
  async getPaymentReport(req, res) {
    try {
      const { staffId } = req.params || req.user.id;
      const userId = staffId || req.user.id;
      const { startDate, endDate } = req.query;

      let query = `
        SELECT 
          COUNT(*) as total_bookings,
          ROUND(SUM(final_price), 2) as total_service_value,
          ROUND(SUM(final_price * 0.1), 2) as total_commission,
          ROUND(AVG(final_price), 2) as [REDACTED_TOKEN],
          COUNT(CASE WHEN rating = 5 THEN 1 END) as five_stars_count,
          COUNT(CASE WHEN rating >= 4 THEN 1 END) as four_plus_stars
        FROM bookings
        WHERE staff_id = $1
        AND status = 'completed'
      `;

      const params = [userId];
      let paramCount = 2;

      if (startDate) {
        query += ` AND date >= $${paramCount}`;
        params.push(startDate);
        paramCount++;
      }

      if (endDate) {
        query += ` AND date <= $${paramCount}`;
        params.push(endDate);
        paramCount++;
      }

      const result = await db.query(query, params);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao gerar relatório de pagamento:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new StaffController();

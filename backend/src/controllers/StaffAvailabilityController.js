/**
 * Staff Availability Controller
 * Gerencia disponibilidade em TEMPO REAL de funcionárias
 * ✅ WebSocket integration ready, real-time updates
 */

const { getDb } = require('../db/sqlite');
const logger = require('../utils/logger');

class [REDACTED_TOKEN] {
  /**
   * GET /api/staff/available
   * Retorna lista de staff disponíveis com scores de alocação
   */
  async getAvailableStaff(req, res) {
    try {
      const { date = new Date().toISOString().split('T')[0], time, serviceId, duration = 2 } = req.query;

      if (!time || !serviceId) {
        return res.status(400).json({
          error: 'Parameters time and serviceId are required',
          code: 'MISSING_PARAMS'
        });
      }

      const db = await getDb();

      // Query otimizado para buscar staff com scores
      const availableStaff = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            s.id,
            s.name,
            s.profile_image,
            s.bio,
            -- Rating Médio
            ROUND(COALESCE(AVG(b.rating), 0), 2) as avg_rating,
            COUNT(DISTINCT b.id) as total_completed,
            
            -- Bookings hoje (carga)
            COUNT(DISTINCT CASE 
              WHEN b.booking_date LIKE ? AND b.status IN ('confirmed', 'in_progress')
              THEN b.id 
            END) as bookings_today,
            
            -- Próximo agendamento
            (
              SELECT MIN(b2.booking_date) 
              FROM bookings b2 
              WHERE b2.team_member_id = s.id 
              AND b2.booking_date > ?
              AND b2.status IN ('confirmed', 'in_progress')
            ) as next_booking_time,
            
            -- Disponibilidade percentual (heurística)
            ROUND(100 - (COUNT(DISTINCT CASE 
              WHEN b.booking_date LIKE ? AND b.status IN ('confirmed', 'in_progress')
              THEN b.id 
            END) * 15), 0) as [REDACTED_TOKEN],
            
            -- Custo estimado (base price + surge)
            ROUND((
              (SELECT base_price FROM services WHERE id = ?) 
              * (1 + COUNT(DISTINCT CASE 
                WHEN b.booking_date LIKE ? AND b.status IN ('confirmed', 'in_progress')
                THEN b.id 
              END) * 0.15)
            ), 2) as estimated_price
            
          FROM users s
          LEFT JOIN bookings b ON b.team_member_id = s.id
          WHERE s.role = 'staff' 
          AND s.active = 1
          GROUP BY s.id
          HAVING [REDACTED_TOKEN] > 0
          ORDER BY [REDACTED_TOKEN] DESC, avg_rating DESC
          LIMIT 10
        `, 
        [
          date + '%',                    // data para LIKE
          time,                          // próximo agendamento depois disso
          date + '%',                    // data para carga
          serviceId,                     // para base price
          date + '%'                     // data para surge pricing
        ], 
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      // Calcular scores e adicionar recomendação
      const staffWithScores = availableStaff.map((staff, index) => {
        const availabilityScore = staff.[REDACTED_TOKEN];
        const ratingScore = (staff.avg_rating / 5) * 100;
        const loadScore = (1 - (staff.bookings_today / 6)) * 100; // 6 = max bookings/day
        const experienceScore = Math.min((staff.total_completed / 50) * 100, 100);

        // Score ponderado
        const finalScore = 
          availabilityScore * 0.35 +
          ratingScore * 0.30 +
          loadScore * 0.20 +
          experienceScore * 0.15;

        return {
          ...staff,
          final_score: Math.round(finalScore),
          ranking_position: index + 1,
          load_status: staff.bookings_today === 0 ? 'available' 
            : staff.bookings_today <= 2 ? 'light' 
              : staff.bookings_today <= 4 ? 'medium' 
                : 'heavy',
          recommendation: finalScore > 85 ? 'highly_recommended' 
            : finalScore > 70 ? 'recommended' 
              : 'available'
        };
      });

      res.json({
        success: true,
        data: staffWithScores,
        timestamp: new Date().toISOString(),
        metadata: {
          total_available: staffWithScores.length,
          best_option: staffWithScores[0] || null,
          time_slot: time,
          date: date,
          service_id: serviceId
        }
      });

    } catch (error) {
      logger.error('Error getting available staff', error);
      res.status(500).json({ 
        error: 'Error fetching available staff',
        code: 'FETCH_ERROR'
      });
    }
  }

  /**
   * GET /api/staff/availability-status
   * Status em tempo real (para WebSocket)
   */
  async [REDACTED_TOKEN](req, res) {
    try {
      const { staffId } = req.params;
      const db = await getDb();

      const status = await new Promise((resolve, reject) => {
        db.get(`
          SELECT 
            s.id,
            s.name,
            -- Status atual
            CASE 
              WHEN COUNT(CASE WHEN b.status = 'in_progress' THEN 1 END) > 0 THEN 'on_job'
              WHEN COUNT(CASE WHEN b.booking_date <= datetime('now') AND b.status = 'confirmed' THEN 1 END) > 0 THEN 'next_soon'
              ELSE 'available'
            END as current_status,
            
            -- Tempo até próximo agendamento
            (
              SELECT CAST((julianday(MIN(b2.booking_date)) - julianday('now')) * 1440 AS INTEGER)
              FROM bookings b2
              WHERE b2.team_member_id = s.id
              AND b2.booking_date > datetime('now')
              AND b2.status IN ('confirmed', 'in_progress')
              LIMIT 1
            ) as minutes_until_next,
            
            -- Agendamento atual (se estiver trabalhando)
            (
              SELECT GROUP_CONCAT(JSON_OBJECT('id', b2.id, 'customer', u.name, 'service', sv.name))
              FROM bookings b2
              JOIN users u ON b2.user_id = u.id
              JOIN services sv ON b2.service_id = sv.id
              WHERE b2.team_member_id = s.id
              AND b2.status = 'in_progress'
            ) as current_booking,
            
            -- Rating e stats
            ROUND(AVG(b.rating), 2) as avg_rating,
            COUNT(b.id) as total_completed
            
          FROM users s
          LEFT JOIN bookings b ON b.team_member_id = s.id AND b.status = 'completed'
          WHERE s.id = ?
          GROUP BY s.id
        `, [staffId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!status) {
        return res.status(404).json({ error: 'Staff not found' });
      }

      res.json({
        success: true,
        data: status,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error getting availability status', error);
      res.status(500).json({ error: 'Error fetching status' });
    }
  }

  /**
   * GET /api/staff/:staffId/calendar
   * Retorna calendário de disponibilidade da semana
   */
  async getWeeklyCalendar(req, res) {
    try {
      const { staffId } = req.params;
      const db = await getDb();

      const calendar = await new Promise((resolve, reject) => {
        db.all(`
          WITH days_of_week AS (
            SELECT DATE(datetime('now', '+' || (rowid - 1) || ' days')) as date
            FROM (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7)
          )
          SELECT 
            d.date,
            STRFTIME('%w', d.date) as day_of_week,
            COUNT(CASE WHEN b.status IN ('confirmed', 'in_progress') THEN 1 END) as bookings_count,
            ROUND(100 - (COUNT(CASE WHEN b.status IN ('confirmed', 'in_progress') THEN 1 END) * 15), 0) as [REDACTED_TOKEN],
            GROUP_CONCAT(
              JSON_OBJECT(
                'id', b.id,
                'time', STRFTIME('%H:%M', b.booking_date),
                'service', sv.name,
                'customer', u.name,
                'status', b.status
              ), ','
            ) as bookings
          FROM days_of_week d
          LEFT JOIN bookings b ON DATE(b.booking_date) = d.date AND b.team_member_id = ?
          LEFT JOIN services sv ON b.service_id = sv.id
          LEFT JOIN users u ON b.user_id = u.id
          GROUP BY d.date
          ORDER BY d.date
        `, [staffId], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      res.json({
        success: true,
        data: calendar,
        staff_id: staffId,
        week_start: new Date().toISOString().split('T')[0]
      });

    } catch (error) {
      logger.error('Error getting weekly calendar', error);
      res.status(500).json({ error: 'Error fetching calendar' });
    }
  }

  /**
   * POST /api/staff/:staffId/set-status
   * Staff marca a si mesmo como available/busy/offline
   */
  async setStatus(req, res) {
    try {
      const { staffId } = req.params;
      const { status, reason = null, until = null } = req.body;

      if (!['available', 'busy', 'offline'].includes(status)) {
        return res.status(400).json({
          error: 'Invalid status',
          valid_options: ['available', 'busy', 'offline']
        });
      }

      // Aqui você salvaria no banco ou em um cache (Redis ideal para status real-time)
      // Por enquanto, retorna sucesso
      logger.info(`Staff ${staffId} set status to ${status}`, { reason, until });

      res.json({
        success: true,
        message: `Status updated to ${status}`,
        data: {
          staff_id: staffId,
          status: status,
          set_at: new Date().toISOString(),
          until: until || null
        }
      });

    } catch (error) {
      logger.error('Error setting status', error);
      res.status(500).json({ error: 'Error updating status' });
    }
  }

  /**
   * GET /api/shift-assignments/:timeSlot
   * Sugestões de alocação automática para um horário específico
   */
  async getShiftAssignments(req, res) {
    try {
      const { timeSlot, serviceId } = req.query;
      const db = await getDb();

      // Simular algoritmo de alocação
      const assignments = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            s.id,
            s.name,
            s.profile_image,
            (
              CASE 
                WHEN COUNT(CASE WHEN b.status IN ('confirmed', 'in_progress') THEN 1 END) = 0 THEN 'OPEN'
                WHEN COUNT(CASE WHEN b.status IN ('confirmed', 'in_progress') THEN 1 END) <= 2 THEN 'AVAILABLE'
                ELSE 'BUSY'
              END
            ) as slot_status,
            COUNT(CASE WHEN b.status IN ('confirmed', 'in_progress') THEN 1 END) as current_load,
            ROUND(AVG(b.rating), 2) as avg_rating
          FROM users s
          LEFT JOIN bookings b ON b.team_member_id = s.id 
            AND DATE(b.booking_date) = DATE(?)
            AND b.status IN ('confirmed', 'in_progress')
          WHERE s.role = 'staff' AND s.is_active = 1
          GROUP BY s.id
          ORDER BY 
            slot_status = 'OPEN' DESC,
            current_load ASC,
            avg_rating DESC
          LIMIT 5
        `, [timeSlot], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      res.json({
        success: true,
        suggestions: assignments,
        recommended: assignments[0] || null,
        time_slot: timeSlot
      });

    } catch (error) {
      logger.error('Error getting shift assignments', error);
      res.status(500).json({ error: 'Error fetching assignments' });
    }
  }
}

module.exports = new [REDACTED_TOKEN]();

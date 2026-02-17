/**
 * Smart Availability Service - Feature #1
 * Gerencia disponibilidade em tempo real com scoring avançado
 * ✅ Cálculo dinâmico de scores, recomendações, preços estimados
 */

const { getDb } = require('../db/sqlite');
const logger = require('../utils/logger');

class SmartAvailabilityService {
  /**
   * Busca staff disponível com scoring detalhado
   * @param {Object} options - {date, time, serviceId, duration}
   * @returns {Array} Staff com scores e recomendações
   */
  async getAvailableStaffWithScores(options) {
    const { date, time, serviceId, duration = 2 } = options;
    const db = await getDb();

    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          s.id,
          s.name,
          s.profile_image,
          s.bio,
          s.email as staff_email,
          
          -- RATINGS & REVIEWS
          ROUND(COALESCE(AVG(b.rating), 0), 2) as avg_rating,
          COUNT(DISTINCT b.id) as total_completed,
          COUNT(DISTINCT CASE WHEN b.rating = 5 THEN b.id END) as five_star_count,
          
          -- WORKLOAD TODAY
          COUNT(DISTINCT CASE 
            WHEN DATE(b.booking_date) = ? 
            AND b.status IN ('confirmed', 'in_progress', 'completed')
            THEN b.id 
          END) as bookings_today,
          
          -- ESTIMATED COST (base + surge)
          (SELECT base_price FROM services WHERE id = ?) as base_price,
          
          -- NEXT BOOKING
          (
            SELECT MIN(TIME(b2.booking_date))
            FROM bookings b2 
            WHERE b2.staff_id = s.id 
            AND DATE(b2.booking_date) = ?
            AND b2.status IN ('confirmed', 'in_progress')
          ) as next_booking_time,
          
          -- SPECIALIZATIONS (if exists)
          (
            SELECT GROUP_CONCAT(DISTINCT sp.specialty_name)
            FROM staff_specialties sp
            WHERE sp.staff_id = s.id
          ) as specialties
          
        FROM users s
        LEFT JOIN bookings b ON b.staff_id = s.id AND b.status = 'completed'
        WHERE s.role = 'staff' 
        AND s.is_active = 1
        GROUP BY s.id
        HAVING COUNT(DISTINCT b.id) > 0 OR s.id NOT IN (SELECT staff_id FROM bookings)
        ORDER BY s.id
      `, [date, serviceId, date], (err, rows) => {
        if (err) {
          logger.error('Error fetching available staff', err);
          reject(err);
          return;
        }

        // Calcular scores avançados
        const staffWithScores = (rows || []).map((staff, index) => {
          return this._calculateAdvancedScores(staff, { date, time, duration });
        });

        // Ordernar por score final
        staffWithScores.sort((a, b) => b.final_score - a.final_score);

        resolve(staffWithScores);
      });
    });
  }

  /**
   * Calcula scores avançados para um staff
   * @private
   */
  _calculateAdvancedScores(staff, options) {
    const { date, time, duration } = options;
    
    // 1. AVAILABILITY SCORE (0-100)
    // Baseado em carga de hoje
    const maxBookingsPerDay = 6;
    const currentLoad = staff.bookings_today || 0;
    const availabilityPercentage = Math.max(0, 100 - (currentLoad / maxBookingsPerDay) * 100);
    const availabilityScore = Math.min(100, availabilityPercentage);

    // 2. RATING SCORE (0-100)
    // Baseado na média de avaliações
    const avgRating = staff.avg_rating || 0;
    const ratingScore = (avgRating / 5) * 100;

    // 3. EXPERIENCE SCORE (0-100)
    // Baseado em número de agendamentos completados
    const totalCompleted = staff.total_completed || 0;
    const experienceScore = Math.min(100, (totalCompleted / 50) * 100);

    // 4. CONSISTENCY SCORE (0-100)
    // Baseado em proporção de 5 stars
    const consistencyScore = totalCompleted > 0 
      ? ((staff.five_star_count || 0) / totalCompleted) * 100 
      : 0;

    // 5. LOAD BALANCE SCORE (0-100)
    // Penaliza staff muito ocupado
    const loadBalanceScore = availabilityScore > 80 ? 100 
      : availabilityScore > 60 ? 80 
        : availabilityScore > 40 ? 60 
          : availabilityScore > 20 ? 40 
            : 20;

    // SCORE FINAL (ponderado)
    const finalScore = 
      availabilityScore * 0.30 +    // 30% disponibilidade
      ratingScore * 0.25 +          // 25% qualidade (rating)
      experienceScore * 0.20 +      // 20% experiência
      consistencyScore * 0.15 +     // 15% consistência
      loadBalanceScore * 0.10;      // 10% balanço de carga

    // Estimar preço com surge pricing
    const basePrice = staff.base_price || 150;
    const loadFactor = 1 + (currentLoad * 0.05); // +5% por agendamento
    const rushHourFactor = this._isRushHour(options.time) ? 1.15 : 1.0;
    const estimatedPrice = Math.round(basePrice * loadFactor * rushHourFactor * 100) / 100;

    // Recomendação
    let recommendation = 'available';
    if (finalScore >= 85) recommendation = 'highly_recommended';
    else if (finalScore >= 75) recommendation = 'recommended';
    else if (finalScore >= 60) recommendation = 'available';
    else recommendation = 'low_priority';

    // Status de carga
    let loadStatus = 'available';
    if (currentLoad === 0) loadStatus = 'available';
    else if (currentLoad <= 2) loadStatus = 'light';
    else if (currentLoad <= 4) loadStatus = 'medium';
    else loadStatus = 'heavy';

    return {
      ...staff,
      scores: {
        availability: Math.round(availabilityScore),
        rating: Math.round(ratingScore),
        experience: Math.round(experienceScore),
        consistency: Math.round(consistencyScore),
        load_balance: Math.round(loadBalanceScore)
      },
      final_score: Math.round(finalScore),
      estimated_price: estimatedPrice,
      recommendation,
      load_status: loadStatus,
      bookings_today: currentLoad,
      specialty_match: staff.specialties ? 'matched' : 'available'
    };
  }

  /**
   * Verifica se é horário de pico
   * @private
   */
  _isRushHour(timeStr) {
    const hour = parseInt(timeStr.split(':')[0]);
    // Picos: 8-9am, 12-1pm, 5-7pm
    return (hour >= 8 && hour <= 9) || 
           (hour >= 12 && hour <= 13) || 
           (hour >= 17 && hour <= 19);
  }

  /**
   * Obtém status em tempo real de um staff
   */
  async getStaffRealTimeStatus(staffId) {
    const db = await getDb();

    return new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          s.id,
          s.name,
          s.profile_image,
          -- Current status
          CASE 
            WHEN COUNT(CASE WHEN b.status = 'in_progress' THEN 1 END) > 0 THEN 'on_job'
            WHEN COUNT(CASE WHEN b.status = 'confirmed' AND TIME(b.booking_date) <= TIME('now') THEN 1 END) > 0 THEN 'next_soon'
            ELSE 'available'
          END as current_status,
          
          -- Current job info
          (
            SELECT JSON_OBJECT(
              'id', b.id,
              'customer', u.name,
              'service', sv.name,
              'end_time', TIME(DATETIME(b.booking_date, '+' || sv.duration || ' minutes'))
            )
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN services sv ON b.service_id = sv.id
            WHERE b.staff_id = s.id AND b.status = 'in_progress'
            LIMIT 1
          ) as current_job,
          
          -- Minutes until next
          CAST((julianday((
            SELECT MIN(b2.booking_date)
            FROM bookings b2
            WHERE b2.staff_id = s.id
            AND b2.booking_date > datetime('now')
            AND b2.status = 'confirmed'
          )) - julianday('now')) * 1440 AS INTEGER) as minutes_until_next,
          
          -- Today's stats
          COUNT(DISTINCT CASE WHEN DATE(b.booking_date) = DATE('now') THEN b.id END) as bookings_today,
          ROUND(AVG(b.rating), 2) as avg_rating,
          COUNT(DISTINCT b.id) as total_completed
          
        FROM users s
        LEFT JOIN bookings b ON b.staff_id = s.id AND b.status IN ('completed', 'in_progress', 'confirmed')
        WHERE s.id = ? AND s.role = 'staff'
        GROUP BY s.id
      `, [staffId], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }

  /**
   * Calcula sugestões de staff para auto-alocação
   */
  async getAutoAllocationSuggestions(options) {
    const { date, time, serviceId, maxSuggestions = 5 } = options;
    
    const availableStaff = await this.getAvailableStaffWithScores({
      date,
      time,
      serviceId,
      duration: 2
    });

    return availableStaff
      .filter(staff => staff.final_score >= 60) // Filtrar por score mínimo
      .slice(0, maxSuggestions)
      .map((staff, index) => ({
        ...staff,
        allocation_rank: index + 1,
        confidence: `${staff.final_score}%`,
        why_recommended: this._getRecommendationReason(staff)
      }));
  }

  /**
   * Gera razão textual da recomendação
   * @private
   */
  _getRecommendationReason(staff) {
    const reasons = [];
    
    if (staff.scores.availability >= 80) {
      reasons.push(`Disponível (${staff.bookings_today} agendamentos hoje)`);
    }
    if (staff.scores.rating >= 90) {
      reasons.push(`Excelente rating (${staff.avg_rating}/5)`);
    }
    if (staff.scores.experience >= 80) {
      reasons.push(`Experiente (${staff.total_completed} serviços)`);
    }
    if (staff.specialties) {
      reasons.push(`Especialista em: ${staff.specialties}`);
    }
    
    return reasons.length > 0 ? reasons.join('; ') : 'Atende aos requisitos';
  }

  /**
   * Calcula tendências de disponibilidade para a semana
   */
  async getWeeklyAvailabilityTrend(serviceId) {
    const db = await getDb();

    return new Promise((resolve, reject) => {
      db.all(`
        WITH week_days AS (
          SELECT DATE(datetime('now', '+' || (rowid - 1) || ' days')) as date
          FROM (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7)
        )
        SELECT 
          d.date as booking_date,
          STRFTIME('%w', d.date) as day_of_week,
          COUNT(DISTINCT s.id) as total_staff,
          COUNT(DISTINCT CASE WHEN COUNT_BOOKINGS.count <= 2 THEN s.id END) as available_staff,
          ROUND(100.0 * COUNT(DISTINCT CASE WHEN COUNT_BOOKINGS.count <= 2 THEN s.id END) / COUNT(DISTINCT s.id), 0) as availability_percentage,
          AVG(COUNT_BOOKINGS.count) as avg_load
        FROM week_days d
        CROSS JOIN users s
        LEFT JOIN (
          SELECT staff_id, COUNT(*) as count
          FROM bookings
          WHERE DATE(booking_date) = d.date
          AND status IN ('confirmed', 'in_progress')
          GROUP BY staff_id
        ) COUNT_BOOKINGS ON COUNT_BOOKINGS.staff_id = s.id
        WHERE s.role = 'staff' AND s.is_active = 1
        GROUP BY d.date
        ORDER BY d.date
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
}

module.exports = new SmartAvailabilityService();

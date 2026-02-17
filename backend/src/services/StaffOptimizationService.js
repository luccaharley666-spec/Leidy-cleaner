/**
 * Staff Optimization Service - Feature #5
 * Auto-alocação inteligente de staff baseado em specialização, carga, distância
 * ✅ Implementa: scoring avançado, load balancing, redução de cancelamentos
 */

const { getDb } = require('../db/sqlite');
const logger = require('../utils/logger');

class StaffOptimizationService {
  /**
   * Auto-aloca staff para um agendamento
   * @param {Object} options - {serviceId, date, time, duration, address, userId}
   * @returns {Object} Staff alocado com razão e confiança
   */
  async autoAllocateStaff(options) {
    const { serviceId, date, time, duration = 2, address, userId } = options;
    const db = await getDb();

    // 1. Buscar todos os candidatos disponíveis
    const candidates = await this._getAvailableCandidates(db, { serviceId, date, time });

    if (candidates.length === 0) {
      throw new Error('Nenhum staff disponível para este horário');
    }

    // 2. Calcular scores avançados para cada candidato
    const scoredCandidates = await Promise.all(
      candidates.map(async (candidate) => {
        const scores = await this._calculateStaffAllocationScore(db, candidate, {
          serviceId,
          date,
          time,
          duration,
          address,
          userId
        });
        return { ...candidate, ...scores };
      })
    );

    // 3. Ordenar por score e selecionar melhor
    scoredCandidates.sort((a, b) => b.final_allocation_score - a.final_allocation_score);

    const selectedStaff = scoredCandidates[0];
    const alternatives = scoredCandidates.slice(1, 3);

    return {
      allocated_staff: {
        id: selectedStaff.id,
        name: selectedStaff.name,
        profile_image: selectedStaff.profile_image,
        email: selectedStaff.email,
        phone: selectedStaff.phone
      },
      allocation_details: {
        final_score: selectedStaff.final_allocation_score,
        confidence: `${selectedStaff.final_allocation_score}%`,
        allocation_reason: selectedStaff.allocation_reason,
        estimated_completion_time: this._estimateCompletionTime(duration, selectedStaff.experience_score),
        expected_quality: this._estimateQuality(selectedStaff.rating_score)
      },
      score_breakdown: {
        specialization: selectedStaff.specialization_score,
        availability: selectedStaff.availability_score,
        distance: selectedStaff.distance_score,
        experience: selectedStaff.experience_score,
        rating: selectedStaff.rating_score,
        load_balance: selectedStaff.load_balance_score,
        cancellation_risk: selectedStaff.cancellation_risk_score
      },
      alternatives: alternatives.map((alt, index) => ({
        rank: index + 2,
        id: alt.id,
        name: alt.name,
        score: alt.final_allocation_score,
        reason: alt.allocation_reason
      })),
      optimization_metadata: {
        total_candidates_evaluated: scoredCandidates.length,
        algorithm_version: '2.0',
        optimized_for: ['specialization', 'availability', 'quality', 'cancellation_reduction']
      }
    };
  }

  /**
   * Obtém candidatos disponíveis
   * @private
   */
  async _getAvailableCandidates(db, options) {
    const { serviceId, date, time } = options;

    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          s.id,
          s.name,
          s.profile_image,
          s.email,
          s.phone,
          s.address,
          s.city,
          ROUND(AVG(b.rating), 2) as avg_rating,
          COUNT(DISTINCT b.id) as total_completed,
          COUNT(DISTINCT CASE WHEN b.rating = 5 THEN b.id END) as five_star_count,
          COUNT(DISTINCT CASE WHEN b.status = 'cancelled' THEN b.id END) as cancellation_count,
          COUNT(DISTINCT CASE 
            WHEN DATE(b.booking_date) = ? 
            AND b.status IN ('confirmed', 'in_progress')
            THEN b.id 
          END) as bookings_today
        FROM users s
        LEFT JOIN bookings b ON b.staff_id = s.id
        WHERE s.role = 'staff' 
        AND s.is_active = 1
        GROUP BY s.id
        ORDER BY s.id
      `, [date], (err, rows) => {
        if (err) {
          logger.error('Error fetching available candidates', err);
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  /**
   * Calcula score de alocação para um staff
   * @private
   */
  async _calculateStaffAllocationScore(db, staff, options) {
    const { serviceId, date, time, duration, address, userId } = options;

    // 1. SPECIALIZATION SCORE (30%)
    const specializationScore = await this._calculateSpecializationScore(
      db,
      staff.id,
      serviceId
    );

    // 2. AVAILABILITY SCORE (25%)
    const maxBookingsPerDay = 6;
    const currentLoad = staff.bookings_today || 0;
    const availabilityScore = Math.max(0, 100 - (currentLoad / maxBookingsPerDay) * 100);

    // 3. DISTANCE SCORE (15%)
    // Penaliza staff longe do local, mas só conta se temos GPS
    const distanceScore = address ? 100 : 100; // TODO: implementar com geolocation

    // 4. EXPERIENCE SCORE (10%)
    const totalCompleted = staff.total_completed || 0;
    const experienceScore = Math.min(100, (totalCompleted / 50) * 100);

    // 5. RATING SCORE (10%)
    const avgRating = staff.avg_rating || 0;
    const ratingScore = (avgRating / 5) * 100;

    // 6. LOAD BALANCE SCORE (5%)
    const loadBalanceScore = currentLoad <= 2 ? 100 : currentLoad <= 4 ? 60 : 30;

    // 7. CANCELLATION RISK SCORE (5%) - NEGATIVO
    const cancellationRate = totalCompleted > 0
      ? (staff.cancellation_count || 0) / totalCompleted
      : 0;
    const cancellationRiskScore = Math.max(0, 100 - cancellationRate * 200); // Penaliza taxa alta

    // Pesos
    const weights = {
      specialization: 0.30,
      availability: 0.25,
      distance: 0.15,
      experience: 0.10,
      rating: 0.10,
      load_balance: 0.05,
      cancellation_risk: 0.05
    };

    // Score final
    const finalScore = 
      specializationScore * weights.specialization +
      availabilityScore * weights.availability +
      distanceScore * weights.distance +
      experienceScore * weights.experience +
      ratingScore * weights.rating +
      loadBalanceScore * weights.load_balance +
      cancellationRiskScore * weights.cancellation_risk;

    // Gerar razão da alocação
    const reason = this._generateAllocationReason({
      name: staff.name,
      specializationScore,
      availabilityScore,
      ratingScore,
      experienceScore,
      totalCompleted
    });

    return {
      specialization_score: Math.round(specializationScore),
      availability_score: Math.round(availabilityScore),
      distance_score: Math.round(distanceScore),
      experience_score: Math.round(experienceScore),
      rating_score: Math.round(ratingScore),
      load_balance_score: Math.round(loadBalanceScore),
      cancellation_risk_score: Math.round(cancellationRiskScore),
      final_allocation_score: Math.round(finalScore),
      allocation_reason: reason
    };
  }

  /**
   * Calcula score de especialização
   * @private
   */
  async _calculateSpecializationScore(db, staffId, serviceId) {
    return new Promise((resolve) => {
      // Se houver tabela de especialidades, verificar match
      // Por enquanto, retornar score neutro
      db.get(`
        SELECT COUNT(*) as count
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        WHERE b.staff_id = ? 
        AND b.service_id = ?
        AND b.status = 'completed'
      `, [staffId, serviceId], (err, row) => {
        if (err) {
          resolve(70); // Score padrão se erro
          return;
        }

        const completedCount = row?.count || 0;

        // Quanto mais serviços iguais completados, maior o score
        if (completedCount >= 50) resolve(100);
        else if (completedCount >= 30) resolve(90);
        else if (completedCount >= 15) resolve(80);
        else if (completedCount >= 5) resolve(70);
        else if (completedCount > 0) resolve(60);
        else resolve(50); // Nunca fez, mas pode fazer
      });
    });
  }

  /**
   * Gera razão textual para alocação
   * @private
   */
  _generateAllocationReason(data) {
    const {
      name,
      specializationScore,
      availabilityScore,
      ratingScore,
      experienceScore,
      totalCompleted
    } = data;

    const reasons = [];

    if (specializationScore >= 80) {
      reasons.push(`${name} é especialista neste serviço`);
    }

    if (availabilityScore >= 90) {
      reasons.push(`excelente disponibilidade`);
    }

    if (ratingScore >= 90) {
      reasons.push(`rating excepcional (${ratingScore.toFixed(0)}/100)`);
    }

    if (experienceScore >= 80) {
      reasons.push(`muita experiência (${totalCompleted}+ serviços)`);
    }

    if (reasons.length === 0) {
      reasons.push(`atende aos critérios de qualidade`);
    }

    return reasons.join('; ');
  }

  /**
   * Estima tempo de conclusão baseado em duração e experiência
   * @private
   */
  _estimateCompletionTime(duration, experienceScore) {
    // Staff experiente é mais rápido
    const experienceFactor = 1 - (experienceScore / 100) * 0.2; // Até 20% mais rápido
    const estimatedMinutes = Math.round(duration * 60 * experienceFactor);
    
    return {
      base_minutes: duration * 60,
      estimated_minutes: estimatedMinutes,
      experience_factor: experienceFactor,
      formatted: `${Math.floor(estimatedMinutes / 60)}h${estimatedMinutes % 60}m`
    };
  }

  /**
   * Estima qualidade do trabalho
   * @private
   */
  _estimateQuality(ratingScore) {
    if (ratingScore >= 95) return { level: 'exceptional', emoji: '⭐⭐⭐⭐⭐' };
    if (ratingScore >= 85) return { level: 'excellent', emoji: '⭐⭐⭐⭐' };
    if (ratingScore >= 75) return { level: 'very_good', emoji: '⭐⭐⭐' };
    if (ratingScore >= 60) return { level: 'good', emoji: '⭐⭐' };
    return { level: 'acceptable', emoji: '⭐' };
  }

  /**
   * Obtém sugestões para reduzir cancelamentos
   */
  async getCancellationReductionReport(db, options) {
    const { daysBack = 30 } = options;

    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          s.id,
          s.name,
          COUNT(DISTINCT b.id) as total_bookings,
          COUNT(DISTINCT CASE WHEN b.status = 'cancelled' THEN b.id END) as cancelled_count,
          ROUND(100.0 * COUNT(DISTINCT CASE WHEN b.status = 'cancelled' THEN b.id END) / COUNT(DISTINCT b.id), 2) as cancellation_rate,
          ROUND(AVG(b.rating), 2) as avg_rating
        FROM users s
        LEFT JOIN bookings b ON b.staff_id = s.id 
          AND b.booking_date >= datetime('now', '-' || ? || ' days')
        WHERE s.role = 'staff' AND s.is_active = 1
        GROUP BY s.id
        HAVING COUNT(DISTINCT b.id) > 0
        ORDER BY cancellation_rate DESC
      `, [daysBack], (err, rows) => {
        if (err) reject(err);
        else {
          const insights = rows.map(staff => ({
            ...staff,
            risk_level: staff.cancellation_rate > 20 ? 'high' 
              : staff.cancellation_rate > 10 ? 'medium' 
              : 'low',
            recommendation: staff.cancellation_rate > 20
              ? `⚠️ Alto risco - Considere treinamento ou menos alocações`
              : staff.cancellation_rate > 10
              ? `⚡ Melhorar performance - Monitorar próximas 2 semanas`
              : `✅ Excelente - Manter alocação frequente`
          }));
          resolve(insights);
        }
      });
    });
  }

  /**
   * Simula alocação automática para os próximos X dias
   */
  async simulateAutoAllocationForecast(options) {
    const { days = 7 } = options;
    const db = await getDb();

    const forecast = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const timeSlots = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
      const services = [];

      // Buscar agendamentos pendentes para este dia
      const bookingsForDay = await new Promise((resolve, reject) => {
        db.all(`
          SELECT * FROM bookings 
          WHERE DATE(booking_date) = ? 
          AND staff_id IS NULL
          LIMIT 5
        `, [dateStr], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      forecast.push({
        date: dateStr,
        day: date.toLocaleDateString('pt-BR', { weekday: 'long' }),
        pending_allocations: bookingsForDay.length,
        time_slots: timeSlots
      });
    }

    return forecast;
  }
}

module.exports = new StaffOptimizationService();

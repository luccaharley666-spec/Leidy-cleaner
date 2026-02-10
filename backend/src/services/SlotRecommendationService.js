/**
 * [REDACTED_TOKEN].js
 * Recomenda horários e staff baseado em rating, disponibilidade e preferências
 */

const db = require('../db');
const logger = require('../utils/logger');

class [REDACTED_TOKEN] {
  /**
   * Recomendar slots para um serviço
   * Retorna os 5 melhores horários ordenados por: rating > preferência de horário > disponibilidade
   */
  static async recommendSlots(serviceId, date = null, maxResults = 5) {
    try {
      // Se date não fornecido, começar de amanhã
      if (!date) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        date = tomorrow.toISOString().split('T')[0];
      }

      // Buscar disponibilidades do staff para este serviço
      const availableSlots = await db.all(`
        SELECT 
          s.id as slot_id,
          s.staff_id,
          u.name as staff_name,
          u.avatar,
          AVG(r.rating) as rating_avg,
          COUNT(r.id) as reviews_count,
          s.time,
          s.date,
          pr.base_price
        FROM availability s
        JOIN users u ON s.staff_id = u.id
        LEFT JOIN reviews r ON r.staff_id = u.id
        JOIN services pr ON s.service_id = pr.id
        WHERE s.service_id = ? 
          AND s.date >= ?
          AND s.available = 1
          AND u.is_active = 1
        GROUP BY s.staff_id, s.date, s.time
        ORDER BY rating_avg DESC, s.date ASC, s.time ASC
        LIMIT ${maxResults * 2}  -- Pega o dobro para filtrar
      `, serviceId, date);

      if (!availableSlots.length) {
        logger.warn('No available slots found', { serviceId, date });
        return {
          success: true,
          slots: [],
          message: 'Nenhum horário disponível para este período'
        };
      }

      // Processar e ordenar slots
      const processedSlots = availableSlots.map(slot => ({
        id: slot.slot_id,
        staffId: slot.staff_id,
        staffName: slot.staff_name,
        avatar: slot.avatar,
        rating: slot.rating_avg || 0,
        reviewsCount: slot.reviews_count || 0,
        date: slot.date,
        time: slot.time,
        timeFormatted: this.formatTime(slot.time),
        price: slot.base_price,
        recommended: slot.rating_avg >= 4.5, // Recomendado se rating >= 4.5
        score: this.calculateScore(slot) // Score para ordenação
      }));

      // Ordenar por score (rating > horário matutino > disponibilidade)
      const sorted = processedSlots.sort((a, b) => b.score - a.score);

      return {
        success: true,
        slots: sorted.slice(0, maxResults),
        topRating: sorted[0]?.rating || 0
      };
    } catch (err) {
      logger.error('Recommendation failed', err);
      return { success: false, error: 'Erro ao buscar slots' };
    }
  }

  /**
   * Score de recomendação
   * Fatores: rating (60%), horário (20%), experiência (20%)
   */
  static calculateScore(slot) {
    // Rating (0-100): 60% do score
    const ratingScore = (slot.rating || 0) * 60;

    // Horário preferido (20%): 8-10h é melhor, +20 pontos
    const hour = parseInt(slot.time);
    const timeScore = (hour >= 8 && hour <= 10) ? 20 : (hour <= 16 ? 15 : 5);

    // Experiência (20%): Número de reviews bem-sucedidas
    const experienceScore = Math.min(slot.reviewsCount * 2, 20);

    return ratingScore + timeScore + experienceScore;
  }

  /**
   * Formatar hora
   */
  static formatTime(time) {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes || '00'}`;
  }

  /**
   * Recomendar serviços complementares
   * Se agendou limpeza profunda, sugerir higiene de sofá, etc
   */
  static async [REDACTED_TOKEN](serviceId) {
    try {
      const service = await db.get('SELECT category FROM services WHERE id = ?', serviceId);

      if (!service) {
        return { success: false, error: 'Serviço não encontrado' };
      }

      // Regras de complemento
      const complementaryRules = {
        'deep_cleaning': ['carpet_cleaning', 'window_cleaning', 'sofa_sanitizing'],
        'residential': ['carpet_cleaning', 'deep_cleaning', 'laundry_service'],
        'commercial': ['office_cleaning', 'carpet_cleaning', 'window_cleaning'],
        'carpet_cleaning': ['sofa_sanitizing', 'upholstery_cleaning'],
        'window_cleaning': ['exterior_cleaning']
      };

      const complementary = complementaryRules[service.category] || [];

      if (!complementary.length) {
        return { success: true, services: [] };
      }

      const services = await db.all(
        `SELECT id, name, description, base_price, category
         FROM services
         WHERE category IN (${complementary.map(() => '?').join(',')})
         AND active = 1
         ORDER BY base_price DESC
         LIMIT 3`,
        ...complementary
      );

      return {
        success: true,
        services: services.map(s => ({
          ...s,
          recommended: true,
          discount: '10% se contratar juntos'
        }))
      };
    } catch (err) {
      logger.error('Complementary recommendation failed', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Recomendar horário baseado em histórico do usuário
   */
  static async recommendTimeOfDay(userId) {
    try {
      const history = await db.all(
        `SELECT time FROM bookings 
         WHERE user_id = ? AND status = 'completed'
         ORDER BY created_at DESC
         LIMIT 10`,
        userId
      );

      if (!history.length) {
        return { success: true, preferredTime: '09:00', message: 'Sem histórico' };
      }

      // Encontrar hora mais frequente
      const hours = history.map(b => parseInt(b.time));
      const mode = this.findMode(hours);

      return { success: true, preferredTime: `${String(mode).padStart(2, '0')}:00` };
    } catch (err) {
      logger.error('Time recommendation failed', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Encontrar valor modal (mais frequente)
   */
  static findMode(array) {
    if (!array.length) return 9;
    
    const frequency = {};
    for (const num of array) {
      frequency[num] = (frequency[num] || 0) + 1;
    }
    
    return Object.keys(frequency).reduce((a, b) => 
      frequency[a] > frequency[b] ? a : b
    );
  }
}

module.exports = [REDACTED_TOKEN];

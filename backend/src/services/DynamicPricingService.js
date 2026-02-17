/**
 * Dynamic Pricing Service - Feature #2
 * Cálculo dinâmico de preços baseado em demanda, horário, cliente
 * ✅ Implementa: rush pricing, loyalty discount, early-bird, seasonal
 */

const { getDb } = require('../db/sqlite');
const logger = require('../utils/logger');

class DynamicPricingService {
  /**
   * Calcula preço final dinâmico para um agendamento
   * @param {Object} options - {serviceId, date, time, duration, userId}
   * @returns {Object} Detalhes de preço com breakdown
   */
  async calculateDynamicPrice(options) {
    const { serviceId, date, time, duration = 2, userId } = options;
    const db = await getDb();

    // 1. Buscar preço base do serviço
    const basePrice = await new Promise((resolve, reject) => {
      db.get(
        'SELECT base_price FROM services WHERE id = ?',
        [serviceId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row?.base_price || 100);
        }
      );
    });

    // 2. Calcular fatores dinâmicos
    const demandFactor = await this._getDemandFactor(date, time);
    const loyaltyDiscount = await this._getLoyaltyDiscount(userId);
    const rushHourFactor = this._getRushHourFactor(time);
    const dayOfWeekFactor = this._getDayOfWeekFactor(date);
    const seasonalFactor = this._getSeasonalFactor(date);
    const earlyBirdDiscount = await this._getEarlyBirdDiscount(date);

    // 3. Calcular preço com duração
    const durationFactor = duration > 2 
      ? 1 + ((duration - 2) * 0.15)  // +15% por hora adicional
      : 1;

    // 4. Aplicar multiplicadores
    let dynamicPrice = basePrice * durationFactor;
    
    // Aplicar fatores multiplicadores (não são descontos)
    dynamicPrice *= demandFactor;    // Demand surge
    dynamicPrice *= rushHourFactor;  // Rush hour premium
    dynamicPrice *= dayOfWeekFactor; // Dia da semana
    dynamicPrice *= seasonalFactor;  // Seasonal variation

    // Aplicar descontos aditivos (após multiplicadores)
    dynamicPrice *= (1 - loyaltyDiscount);    // Loyalty discount
    dynamicPrice *= (1 - earlyBirdDiscount);  // Early bird discount

    // 5. Arredondar para 2 casas decimais
    dynamicPrice = Math.round(dynamicPrice * 100) / 100;

    // Calcular economia
    const baseCalculatedPrice = Math.round(basePrice * durationFactor * 100) / 100;
    const savings = baseCalculatedPrice - dynamicPrice;
    const savingsPercentage = baseCalculatedPrice > 0 
      ? Math.round((savings / baseCalculatedPrice) * 100) 
      : 0;

    return {
      base_price: basePrice,
      duration_hours: duration,
      duration_multiplier: durationFactor,
      
      price_factors: {
        demand_factor: demandFactor,
        rush_hour_factor: rushHourFactor,
        day_of_week_factor: dayOfWeekFactor,
        seasonal_factor: seasonalFactor
      },
      
      discounts: {
        loyalty_discount: Math.round(loyaltyDiscount * 100),
        early_bird_discount: Math.round(earlyBirdDiscount * 100),
        total_discount_percentage: Math.round((loyaltyDiscount + earlyBirdDiscount) * 100)
      },
      
      final_price: dynamicPrice,
      base_calculated_price: baseCalculatedPrice,
      savings: savings > 0 ? savings : 0,
      savings_percentage: savingsPercentage > 0 ? savingsPercentage : 0,
      
      pricing_breakdown: {
        base: basePrice,
        duration_adjusted: Math.round(basePrice * durationFactor * 100) / 100,
        with_demand: Math.round(basePrice * durationFactor * demandFactor * 100) / 100,
        with_rush: Math.round(basePrice * durationFactor * demandFactor * rushHourFactor * 100) / 100,
        with_day_factor: Math.round(basePrice * durationFactor * demandFactor * rushHourFactor * dayOfWeekFactor * 100) / 100,
        with_seasonal: Math.round(basePrice * durationFactor * demandFactor * rushHourFactor * dayOfWeekFactor * seasonalFactor * 100) / 100,
        final: dynamicPrice
      },
      
      timestamps: {
        calculated_at: new Date().toISOString(),
        date: date,
        time: time
      }
    };
  }

  /**
   * Calcula fator de demanda baseado em bookings existentes
   * @private
   */
  async _getDemandFactor(date, time) {
    const db = await getDb();

    return new Promise((resolve, reject) => {
      // Contar bookings no mesmo horário
      db.get(`
        SELECT COUNT(*) as booking_count
        FROM bookings
        WHERE DATE(booking_date) = ?
        AND TIME(booking_date) = ?
        AND status IN ('confirmed', 'in_progress')
      `, [date, time], (err, row) => {
        if (err) {
          logger.error('Error calculating demand factor', err);
          resolve(1.0); // Fator neutro em caso de erro
          return;
        }

        const bookingCount = row?.booking_count || 0;
        
        // Surge pricing baseado em bookings já feitos
        // 0 bookings = 1.0 (sem aumento)
        // 1-2 bookings = 1.1 (+10%)
        // 3-4 bookings = 1.25 (+25%)
        // 5+ bookings = 1.5 (+50%)
        let factor = 1.0;
        if (bookingCount >= 5) factor = 1.5;
        else if (bookingCount >= 3) factor = 1.25;
        else if (bookingCount >= 1) factor = 1.1;

        resolve(factor);
      });
    });
  }

  /**
   * Calcula desconto por lealdade do cliente
   * @private
   */
  async _getLoyaltyDiscount(userId) {
    if (!userId) return 0;
    
    const db = await getDb();

    return new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          total_five_stars,
          five_star_streak,
          loyalty_bonus,
          COUNT(DISTINCT b.id) as total_bookings
        FROM users u
        LEFT JOIN bookings b ON b.user_id = u.id
        WHERE u.id = ?
        GROUP BY u.id
      `, [userId], (err, row) => {
        if (err) {
          logger.error('Error calculating loyalty discount', err);
          resolve(0);
          return;
        }

        const totalBookings = row?.total_bookings || 0;
        const totalFiveStars = row?.total_five_stars || 0;
        const fiveStarStreak = row?.five_star_streak || 0;
        const loyaltyBonus = row?.loyalty_bonus || 0;

        let discount = 0;

        // Desconto progressivo por número de bookings
        if (totalBookings >= 50) discount += 0.15; // 15%
        else if (totalBookings >= 30) discount += 0.10; // 10%
        else if (totalBookings >= 15) discount += 0.07; // 7%
        else if (totalBookings >= 5) discount += 0.05; // 5%

        // Bônus por streak de 5 stars
        if (fiveStarStreak >= 5) discount += 0.10; // +10%
        else if (fiveStarStreak >= 3) discount += 0.05; // +5%

        // Bônus resgatado
        if (loyaltyBonus > 0) {
          discount += 0.05; // +5% por bônus
        }

        // Máximo de desconto por lealdade é 25%
        return resolve(Math.min(discount, 0.25));
      });
    });
  }

  /**
   * Calcula desconto early-bird
   * @private
   */
  async _getEarlyBirdDiscount(date) {
    const today = new Date();
    const bookingDate = new Date(date);
    const daysInAdvance = Math.floor((bookingDate - today) / (1000 * 60 * 60 * 24));

    // Desconto aumenta quanto antes booking é feito
    if (daysInAdvance >= 14) return 0.20;  // 20% se agendado 2+ semanas antes
    if (daysInAdvance >= 7) return 0.15;   // 15% se agendado 1+ semana antes
    if (daysInAdvance >= 3) return 0.10;   // 10% se agendado 3+ dias antes
    if (daysInAdvance >= 1) return 0.05;   // 5% se agendado 1+ dia antes

    return 0; // Sem desconto same-day ou próximo dia
  }

  /**
   * Fator de pico de horário
   * @private
   */
  _getRushHourFactor(time) {
    const hour = parseInt(time.split(':')[0]);

    // Horários de pico: manhã cedo (8-9), meio-dia (12-13), final tarde (17-19)
    if ((hour >= 8 && hour <= 9) || (hour >= 12 && hour <= 13) || (hour >= 17 && hour <= 19)) {
      return 1.30; // +30% em horário de pico
    }

    // Horários normais
    if (hour >= 9 && hour <= 17) {
      return 1.10; // +10% durante horário comercial
    }

    // Madrugada/muito cedo/muito tarde
    if (hour >= 6 && hour < 8) {
      return 0.85; // -15% muito cedo (incentivo)
    }
    if (hour >= 19 && hour <= 22) {
      return 1.20; // +20% à noite
    }

    return 1.0; // Fator neutro para outros horários
  }

  /**
   * Fator por dia da semana
   * @private
   */
  _getDayOfWeekFactor(date) {
    const day = new Date(date).getDay();

    // 0 = domingo, 6 = sábado
    if (day === 0 || day === 6) {
      return 1.25; // +25% fim de semana
    }

    // Segunda é mais barata (incentivo)
    if (day === 1) {
      return 0.90; // -10% segunda
    }

    // Dias normais
    return 1.0;
  }

  /**
   * Fator sazonal
   * @private
   */
  _getSeasonalFactor(date) {
    const parsedDate = new Date(date);
    const month = parsedDate.getMonth() + 1; // 1-12

    // Período de limpeza de primavera (setembro-outubro)
    if (month >= 9 && month <= 10) {
      return 1.15; // +15%
    }

    // Período antes de festas (novembro-dezembro)
    if (month >= 11 && month <= 12) {
      return 1.20; // +20%
    }

    // Período pós-festas (janeiro)
    if (month === 1) {
      return 0.95; // -5%
    }

    // Período baixo (fevereiro-março)
    if (month >= 2 && month <= 3) {
      return 0.90; // -10%
    }

    return 1.0; // Fator neutro
  }

  /**
   * Obtém histórico de preços dinâmicos
   */
  async getPriceHistory(serviceId, daysBack = 30) {
    const db = await getDb();

    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          DATE(booking_date) as date,
          COUNT(*) as bookings,
          AVG(final_price) as avg_price,
          MIN(final_price) as min_price,
          MAX(final_price) as max_price,
          ROUND(STDEV(final_price), 2) as price_volatility
        FROM bookings
        WHERE service_id = ?
        AND booking_date >= datetime('now', '-' || ? || ' days')
        GROUP BY DATE(booking_date)
        ORDER BY date DESC
      `, [serviceId, daysBack], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  /**
   * Simula preços para os próximos dias
   */
  async getPriceForecast(serviceId, days = 7) {
    const forecast = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const times = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
      
      for (const time of times) {
        const pricing = await this.calculateDynamicPrice({
          serviceId,
          date: dateStr,
          time,
          duration: 2,
          userId: null
        });

        forecast.push({
          date: dateStr,
          day: date.toLocaleDateString('pt-BR', { weekday: 'long' }),
          time: time,
          price: pricing.final_price,
          base_price: pricing.base_price,
          demand_factor: pricing.price_factors.demand_factor
        });
      }
    }

    return forecast;
  }
}

module.exports = new DynamicPricingService();

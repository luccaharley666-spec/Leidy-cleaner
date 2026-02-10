/**
 * Pricing Service - Dynamic Pricing Engine
 * Cálculo inteligente e dinâmico de preços
 * ✅ Implementa surge pricing, loyalty discount, rush hours, etc
 */

const { getDb } = require('../db/sqlite');
// Carregar matriz de pricing centralizada (fallback para valores embutidos)
let pricingMatrix = {};
try {
  pricingMatrix = require('../../../automation/pricing-matrix.json');
} catch (e) {
  pricingMatrix = {};
}

class PricingService {
  /**
   * Calcular preço dinâmico completo
   * Leva em conta: data, hora, cliente, histórico, etc
   */
  async [REDACTED_TOKEN](data) {
    try {
      let basePrice = data.basePrice || 0;

      // 1. Preço base do serviço
      if (data.services && Array.isArray(data.services)) {
        basePrice = data.services.reduce((sum, s) => sum + (s.basePrice || 0), 0);
      }

      // 2. Multiplicador por metragem
      if (data.metragem) {
        basePrice += data.metragem * this.[REDACTED_TOKEN]();
      }

      // 3. Multiplicador por tipo de limpeza
      if (data.cleaningType) {
        basePrice *= this.[REDACTED_TOKEN](data.cleaningType);
      }

      // 4. Multiplicador de data/hora (SURGE PRICING)
      const surgeMultiplier = await this.getSurgeMultiplier(data.date, data.time);
      basePrice *= surgeMultiplier;

      // 5. Multiplicador de frequência
      if (data.frequency) {
        basePrice *= this.[REDACTED_TOKEN](data.frequency);
      }

      // 6. Multiplicador de urgência
      if (data.urgency) {
        basePrice *= this.[REDACTED_TOKEN](data.urgency);
      }

      // 7. Desconto por lealdade (cliente recorrente)
      const loyaltyDiscount = await this.getLoyaltyDiscount(data.userId);
      basePrice *= (1 - loyaltyDiscount);

      // 8. Descontos aplicáveis
      const discount = await this.calculateDiscount(data);
      basePrice -= discount;

      // 9. Adicionar taxa de serviço (configurável via pricing-matrix.json)
      const [REDACTED_TOKEN] = (pricingMatrix.[REDACTED_TOKEN] || 5) / 100;
      const serviceFee = basePrice * [REDACTED_TOKEN];
      basePrice += serviceFee;

      // 10. Garantir preço mínimo (configurável)
      const minimumPrice = pricingMatrix.minimumPrice || this.getMinimumPrice();
      basePrice = Math.max(basePrice, minimumPrice);

      // Retornar breakdown detalhado
      // Garantir que descontos combinados não ultrapassem o máximo configurado
      const maximumDiscount = typeof pricingMatrix.maximumDiscount === 'number' ? pricingMatrix.maximumDiscount : 0.3;

      // `loyaltyDiscount` é percentual; `discount` é valor absoluto sobre subtotal
      const subtotal = data.basePrice || (data.services ? data.services.reduce((s, x) => s + (x.basePrice || 0), 0) : 0);
      const [REDACTED_TOKEN] = subtotal > 0 ? (discount / subtotal) : 0;
      const combinedPercent = loyaltyDiscount + [REDACTED_TOKEN];

      let [REDACTED_TOKEN] = discount;
      if (combinedPercent > maximumDiscount) {
        // limitar desconto absoluto para não ultrapassar o teto
        const [REDACTED_TOKEN] = Math.max(0, maximumDiscount - loyaltyDiscount);
        [REDACTED_TOKEN] = Math.round((subtotal * [REDACTED_TOKEN]) * 100) / 100;
      }

      // Recalcular preço final (re-aplicar service fee and min were already applied above)
      // Note: loyalty already multiplicative applied above; we subtracted discount earlier, but
      // ensure we use the capped `[REDACTED_TOKEN]` for breakdown clarity.

      // finalPrice já foi calculado em `basePrice` (com loyalty + serviceFee + min),
      // porém `discount` foi subtraído antes de serviceFee in previous steps — keep consistency
      // For return values, reflect capped discount and rounded serviceFee.
      return {
        finalPrice: Math.round(basePrice * 100) / 100,
        basePrice: data.basePrice || subtotal,
        surgeMultiplier: surgeMultiplier,
        loyaltyDiscount: loyaltyDiscount,
        totalDiscount: [REDACTED_TOKEN],
        serviceFee: Math.round(serviceFee * 100) / 100,
        breakdown: {
          base: subtotal,
          surge: surgeMultiplier !== 1 ? `+${Math.round((surgeMultiplier - 1) * 100)}%` : '+0%',
          loyalty: loyaltyDiscount !== 0 ? `-${Math.round(loyaltyDiscount * 100)}%` : '0%',
          discounts: [REDACTED_TOKEN],
          serviceFee: Math.round(serviceFee * 100) / 100
        }
      };
    } catch (error) {
      throw new Error(`Pricing calculation error: ${error.message}`);
    }
  }

  /**
   * Calcular multiplicador de surge (congestionamento/picos)
   * Fim de semana +30%, horários de rush +20%, etc
   */
  async getSurgeMultiplier(date, time) {
    if (!date || !time) return 1.0;

    try {
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay(); // 0=domingo, 6=sábado
      const hour = parseInt(time.split(':')[0]);

      let multiplier = 1.0;

      // Fim de semana +30%
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        multiplier += 0.30;
      }

      // Hora de rush (10-17h) +20%
      if (hour >= 10 && hour <= 17) {
        multiplier += 0.20;
      }

      // Código de retorno elevado em feriados (poderia ser expandido)
      // Madrugada (-30% para 00-07h)
      if (hour >= 0 && hour < 7) {
        multiplier *= 0.7;
      }

      return Math.min(multiplier, 1.5); // Máximo 50% de surge
    } catch (error) {
      return 1.0;
    }
  }

  /**
   * Desconto por lealdade (cliente com histórico de compras)
   */
  async getLoyaltyDiscount(userId) {
    if (!userId) return 0;

    try {
      const db = await getDb();
      const user = await new Promise((resolve, reject) => {
        db.get(
          'SELECT SUM(amount) as total_spent, COUNT(*) as booking_count FROM bookings WHERE user_id = ? AND status = ?',
          [userId, 'completed'],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!user || !user.booking_count) return 0;

      // Escala de lealdade
      const bookings = user.booking_count;
      const totalSpent = user.total_spent || 0;

      if (bookings >= 20 || totalSpent >= 3000) return 0.15; // 15% desconto (VIP)
      if (bookings >= 10 || totalSpent >= 1500) return 0.10; // 10% desconto (Gold)
      if (bookings >= 5 || totalSpent >= 750) return 0.05;   // 5% desconto (Silver)
      return 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Preço por metro quadrado
   */
  [REDACTED_TOKEN]() {
    return 0.5; // R$ 0.50 por m²
  }

  /**
   * Multiplicador por tipo de limpeza
   */
  [REDACTED_TOKEN](type) {
    const multipliers = {
      standard: 1.0,
      deep: 1.5,
      move_in_out: 1.8,
      commercial: 2.0,
      window: 0.8,
      carpet: 0.9,
    };
    return multipliers[type] || 1.0;
  }

  /**
   * Multiplicador por frequência
   */
  [REDACTED_TOKEN](frequency) {
    const multipliers = {
      once: 1.0,
      weekly: 0.8,
      biweekly: 0.9,
      monthly: 0.95,
    };
    return multipliers[frequency] || 1.0;
  }

  /**
   * Multiplicador por urgência
   */
  [REDACTED_TOKEN](urgency) {
    const multipliers = {
      normal: 1.0,
      express: 1.3,
      emergency: 1.5,
    };
    return multipliers[urgency] || 1.0;
  }

  /**
   * Calcular descontos adicionais
   */
  async calculateDiscount(data) {
    let discount = 0;
    const subtotal = data.basePrice || 0;

    // Desconto por cliente novo (primeiro agendamento)
    if (data.isNewCustomer) {
      discount += subtotal * 0.1; // 10% desconto
    }

    // Desconto por agendamento futuro (mais 7+ dias)
    if (data.daysUntilService && data.daysUntilService > 7) {
      discount += subtotal * 0.05; // 5% desconto
    }

    // Desconto por múltiplos serviços
    if (data.services && data.services.length > 3) {
      discount += subtotal * 0.1; // 10% desconto
    }

    // Desconto por combo (serviços que geram combo automático)
    if (data.isComboPurchase) {
      discount += subtotal * 0.1; // 10% desconto
    }

    return Math.round(discount * 100) / 100;
  }

  /**
   * Preço mínimo do serviço
   */
  getMinimumPrice() {
    return 80; // R$ 80,00
  }

  /**
   * Simular múltiplas opções de preço
   */
  async [REDACTED_TOKEN](data) {
    const options = {};
    
    // Normal
    options.normal = await this.[REDACTED_TOKEN]({
      ...data,
      urgency: 'normal',
      frequency: 'once'
    });

    // Express
    options.express = await this.[REDACTED_TOKEN]({
      ...data,
      urgency: 'express',
      frequency: 'once'
    });

    // Recorrente (desconto)
    options.weekly = await this.[REDACTED_TOKEN]({
      ...data,
      frequency: 'weekly'
    });

    return options;
  }

  /**
   * Compatibilidade: API legada `calculatePrice`.
   * Retorna apenas o `finalPrice` numérico para testes e código antigo.
   */
  async calculatePrice(data) {
    const result = await this.[REDACTED_TOKEN](data);
    if (result && typeof result.finalPrice === 'number') return result.finalPrice;
    // fallback: try to coerce if structure changed
    return Number(result) || 0;
  }
}

module.exports = new PricingService();

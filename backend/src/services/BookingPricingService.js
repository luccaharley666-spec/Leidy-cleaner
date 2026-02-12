/**
 * Booking Pricing Service
 * Integra cálculo de preço com sistema de horas pré-pagas
 */

// // // // const PLACEHOLDER = require('./PLACEHOLDER');
const { getDb } = require('../db/sqlite');

class HourlyBookingPricingService {
  /**
   * Calcular preço final de booking com opção de usar crédito de horas
   */
  async calculateHourlyBookingPrice(bookingData) {
    const { userId, durationHours, useHourCredit = false } = bookingData;

    try {
      // 1. Calcular preço base em horas
      const hourPrice = await HourPricingService.calculateHourPrice({
        hours: durationHours,
        userId: userId,
      });

      if (!hourPrice.success) {
        return {
          success: false,
          error: hourPrice.error,
        };
      }

      // 2. Se quiser usar crédito, verificar disponibilidade
      let finalPrice = hourPrice.finalPrice;
      let paidWithCredits = false;
      let hoursConsumed = 0;

      if (useHourCredit && userId) {
        const credit = await HourPricingService.getUserHourCredit(userId);

        if (credit.hasCredit && credit.availableHours >= durationHours) {
          // Usar crédito: desconta a taxa de serviço (40%)
          finalPrice = hourPrice.discountedPrice || hourPrice.finalPrice;
          paidWithCredits = true;
          hoursConsumed = durationHours;
        }
      }

      return {
        success: true,
        hourPrice: hourPrice,
        finalPrice: Math.round(finalPrice * 100) / 100,
        paidWithCredits: paidWithCredits,
        hoursConsumed: hoursConsumed,
        breakdown: hourPrice.breakdown,
        creditInfo: hourPrice.creditInfo,
      };
    } catch (error) {
      logger.error('Erro ao calcular preço:', error.message);
      return {
        success: false,
        error: 'Erro ao calcular preço do agendamento',
      };
    }
  }

  /**
   * Confirmar booking e consumir crédito se aplicável
   */
  async confirmAndConsumeHourCredit(bookingId, userId, hoursToConsume, paidWithCredits) {
    const db = getDb();

    try {
      // 1. Atualizar status do booking
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE bookings 
           SET payment_status = 'paid', 
               paid_with_credits = ?,
               hours_used = ?
           WHERE id = ?`,
          [paidWithCredits ? 1 : 0, hoursToConsume, bookingId],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // 2. Se pagou com crédito, consumir horas
      if (paidWithCredits && hoursToConsume > 0) {
        await HourPricingService.consumeHourCredit(userId, hoursToConsume);
      }

      return {
        success: true,
        bookingId: bookingId,
        paidWithCredits: paidWithCredits,
        hoursConsumed: hoursToConsume,
      };
    } catch (error) {
      logger.error('Erro ao confirmar pagamento:', error.message);
      return {
        success: false,
        error: 'Erro ao confirmar pagamento do agendamento',
      };
    }
  }

  /**
   * Gerar breakdown visual do preço para exibição
   */
  createPriceBreakdown(hourPrice, paidWithCredits = false) {
    const { breakdown } = hourPrice;

    const items = [
      {
        label: 'Preço Base (horas)',
        value: breakdown.basePrice,
        type: 'base',
      },
      {
        label: 'Taxa de Serviço (40%)',
        value: breakdown.serviceFee,
        type: paidWithCredits ? 'waived' : 'fee',
        waived: paidWithCredits,
      },
      {
        label: 'Pós-Obra (20%)',
        value: breakdown.postWorkFee,
        type: 'fee',
      },
      {
        label: 'Organização (10%)',
        value: breakdown.organizationFee,
        type: 'fee',
      },
      {
        label: 'Produto',
        value: breakdown.productFee,
        type: 'fixed',
      },
    ];

    return {
      items: items,
      subtotal: breakdown.basePrice + breakdown.serviceFee + breakdown.postWorkFee + breakdown.organizationFee + breakdown.productFee,
      total: hourPrice.finalPrice,
      paidWithCredits: paidWithCredits,
      discount: paidWithCredits ? breakdown.serviceFee : 0,
    };
  }
}

module.exports = new HourlyBookingPricingService();

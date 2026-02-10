/**
 * Recurring Booking Service
 * Agendamentos recorrentes (semanal, quinzenal, mensal)
 */

const logger = require('../utils/logger');

class [REDACTED_TOKEN] {
  constructor() {
    this.recurringBookings = new Map();
  }

  /**
   * Criar booking recorrente
   */
  async [REDACTED_TOKEN](booking) {
    try {
      const {
        userId,
        serviceId,
        frequency, // 'weekly', 'biweekly', 'monthly'
        startDate,
        endDate,
        dayOfWeek, // 0-6 (Monday-Sunday)
        time,
        notes
      } = booking;

      if (!['weekly', 'biweekly', 'monthly'].includes(frequency)) {
        throw new Error('Frequency inválida');
      }

      const recurringId = `rec_${Date.now()}`;
      const recurring = {
        id: recurringId,
        userId,
        serviceId,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        dayOfWeek,
        time,
        notes,
        status: 'active',
        nextOccurrence: this.[REDACTED_TOKEN](frequency, dayOfWeek, time),
        createdAt: new Date(),
        discount: 10 // 10% desconto para recorrentes
      };

      this.recurringBookings.set(recurringId, recurring);

      logger.log({
        level: 'info',
        message: 'Recurring booking created',
        recurringId,
        frequency,
        discount: `${recurring.discount}%`
      });

      return recurring;
    } catch (error) {
      logger.error('Failed to create recurring booking', { error: error.message });
      throw error;
    }
  }

  /**
   ✅ NOVO: Calcular próxima ocorrência
   */
  [REDACTED_TOKEN](frequency, dayOfWeek, time) {
    const now = new Date();
    const nextDate = new Date(now);

    if (frequency === 'weekly') {
      const daysUntilNext = (dayOfWeek - nextDate.getDay() + 7) % 7 || 7;
      nextDate.setDate(nextDate.getDate() + daysUntilNext);
    } else if (frequency === 'biweekly') {
      const daysUntilNext = (dayOfWeek - nextDate.getDay() + 7) % 7 || 7;
      nextDate.setDate(nextDate.getDate() + daysUntilNext + 7);
    } else if (frequency === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
      nextDate.setDate(dayOfWeek);
    }

    const [hours, minutes] = time.split(':');
    nextDate.setHours(hours, minutes, 0, 0);
    return nextDate;
  }

  /**
   ✅ NOVO: Pausar recorrência temporariamente
   */
  async pauseRecurring(recurringId, pauseUntil) {
    try {
      const recurring = this.recurringBookings.get(recurringId);
      if (!recurring) throw new Error('Recurring booking not found');

      recurring.status = 'paused';
      recurring.pausedUntil = new Date(pauseUntil);

      logger.log({
        level: 'info',
        message: 'Recurring booking paused',
        recurringId,
        pausedUntil: pauseUntil
      });

      return recurring;
    } catch (error) {
      logger.error('Failed to pause recurring', { error: error.message });
      throw error;
    }
  }

  /**
   ✅ NOVO: Retomar recorrência
   */
  async resumeRecurring(recurringId) {
    try {
      const recurring = this.recurringBookings.get(recurringId);
      if (!recurring) throw new Error('Recurring booking not found');

      recurring.status = 'active';
      recurring.pausedUntil = null;

      return recurring;
    } catch (error) {
      logger.error('Failed to resume recurring', { error: error.message });
      throw error;
    }
  }

  /**
   ✅ NOVO: Cancelar recorrência
   */
  async cancelRecurring(recurringId) {
    try {
      const recurring = this.recurringBookings.get(recurringId);
      if (!recurring) throw new Error('Recurring booking not found');

      recurring.status = 'cancelled';
      recurring.cancelledAt = new Date();

      logger.log({
        level: 'info',
        message: 'Recurring booking cancelled',
        recurringId
      });

      return recurring;
    } catch (error) {
      logger.error('Failed to cancel recurring', { error: error.message });
      throw error;
    }
  }

  /**
   ✅ NOVO: Gerar bookings automáticos para próximas ocorrências
   */
  async generateNextBooking(recurringId) {
    try {
      const recurring = this.recurringBookings.get(recurringId);
      if (!recurring) throw new Error('Not found');

      if (recurring.status !== 'active') return null;

      const nextBooking = {
        id: `book_${Date.now()}`,
        recurringId,
        userId: recurring.userId,
        serviceId: recurring.serviceId,
        scheduledFor: recurring.nextOccurrence,
        notes: recurring.notes,
        discount: recurring.discount,
        status: 'scheduled'
      };

      // Atualizar próxima ocorrência
      recurring.nextOccurrence = this.[REDACTED_TOKEN](
        recurring.frequency,
        recurring.dayOfWeek,
        recurring.time
      );

      logger.log({
        level: 'info',
        message: 'Auto booking generated',
        recurringId,
        bookingId: nextBooking.id
      });

      return nextBooking;
    } catch (error) {
      logger.error('Failed to generate booking', { error: error.message });
      throw error;
    }
  }

  /**
   ✅ NOVO: Listar bookings recorrentes do usuário
   */
  async [REDACTED_TOKEN](userId) {
    const userRecurring = Array.from(this.recurringBookings.values())
      .filter(r => r.userId === userId);

    return {
      userId,
      recurring: userRecurring,
      count: userRecurring.length,
      activeCount: userRecurring.filter(r => r.status === 'active').length,
      totalSavings: userRecurring.length * 50 // Exemplo: $50 por recorrência
    };
  }

  /**
   ✅ NOVO: Modificar configuração de recorrência
   */
  async updateRecurring(recurringId, updates) {
    try {
      const recurring = this.recurringBookings.get(recurringId);
      if (!recurring) throw new Error('Not found');

      Object.assign(recurring, updates);
      recurring.updatedAt = new Date();

      return recurring;
    } catch (error) {
      logger.error('Failed to update recurring', { error: error.message });
      throw error;
    }
  }
}

module.exports = new [REDACTED_TOKEN]();

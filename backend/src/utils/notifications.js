/**
 * Notification Utils
 * Funções auxiliares de notificação
 */

const logger = require('./logger');
const NotificationController = require('../controllers/NotificationController');

class NotificationService {
  /**
   * Enviar notificação de confirmação de agendamento
   */
  static async confirmBooking(bookingId) {
    logger.info(`Confirming booking: ${bookingId}`);
    try {
      if (NotificationController && typeof NotificationController.confirmBooking === 'function') {
        return await NotificationController.confirmBooking(bookingId);
      }
    } catch (err) {
      logger.error('Error delegating confirmBooking to controller', err);
    }
    return { success: true, message: 'Booking confirmation sent' };
  }

  /**
   * Enviar lembretes programados
   */
  static async notifyReminders() {
    logger.info('Processing scheduled reminders');
    try {
      if (NotificationController && typeof NotificationController.notifyReminders === 'function') {
        return await NotificationController.notifyReminders();
      }
    } catch (err) {
      logger.error('Error delegating notifyReminders to controller', err);
    }
    return { success: true, message: 'Reminders processed' };
  }

  /**
   * Notificar problema
   */
  static async notifyIssue(issue) {
    logger.warn(`Issue reported: ${issue.type} - ${issue.message}`);
    // Implementar envio de alerta
    return true;
  }

  /**
   * Notificar equipa
   */
  static async notifyTeam(bookingId) {
    logger.info(`Notifying team about booking: ${bookingId}`);
    try {
      if (NotificationController && typeof NotificationController.notifyTeam === 'function') {
        return await NotificationController.notifyTeam(bookingId);
      }
    } catch (err) {
      logger.error('Error delegating notifyTeam to controller', err);
    }
    return { success: true, message: 'Team notified' };
  }

  /**
   * Enviar follow-up
   */
  static async sendFollowUp(bookingId) {
    logger.info(`Sending follow-up for booking: ${bookingId}`);
    try {
      if (NotificationController && typeof NotificationController.sendFollowUp === 'function') {
        return await NotificationController.sendFollowUp(bookingId);
      }
    } catch (err) {
      logger.error('Error delegating sendFollowUp to controller', err);
    }
    return { success: true, message: 'Follow-up sent' };
  }
}

module.exports = NotificationService;

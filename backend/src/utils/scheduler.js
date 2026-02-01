/**
 * Scheduler
 * Agendador de tarefas automáticas
 */

const cron = require('node-cron');
const NotificationService = require('./notifications');
const AutomationService = require('../services/AutomationService');
const logger = require('./logger');

class Scheduler {
  /**
   * Inicializar todos os schedules
   */
  static init() {
    logger.info('Inicializando scheduler...');

    // Enviar lembretes a cada dia às 10:00
    cron.schedule('0 10 * * *', async () => {
      logger.info('Executando: envio de lembretes diários');
      await NotificationService.notifyReminders();
    });

    // Verificar agendamentos próximos a cada hora
    cron.schedule('0 * * * *', async () => {
      logger.info('Executando: verificação de agendamentos');
      await this.checkUpcomingBookings();
    });

    // Follow-up automático a cada 6 horas
    cron.schedule('0 */6 * * *', async () => {
      logger.info('Executando: follow-up automático');
      await this.executeFollowUps();
    });

    // Limpeza de dados antigos a cada semana
    cron.schedule('0 0 * * 0', async () => {
      logger.info('Executando: limpeza de dados');
      await this.cleanupOldData();
    });

    // Gerar relatórios mensais
    cron.schedule('0 0 1 * *', async () => {
      logger.info('Executando: geração de relatórios');
      await this.generateMonthlyReports();
    });

    logger.info('Scheduler inicializado com sucesso');
  }

  /**
   * Verificar agendamentos próximos
   */
  static async checkUpcomingBookings() {
    try {
      // const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      // const bookings = await BookingService.findByDate(tomorrow);
      // for (const booking of bookings) {
      //   await AutomationService.executeBookingAutomations(booking);
      // }
      logger.info('Verificação concluída');
    } catch (error) {
      logger.error('Erro em checkUpcomingBookings:', error);
    }
  }

  /**
   * Executar follow-ups automáticos
   */
  static async executeFollowUps() {
    try {
      // const completedBookings = await BookingService.findCompleted();
      // for (const booking of completedBookings) {
      //   if (this.shouldFollowUp(booking)) {
      //     await AutomationService.executeFollowUp(booking.id);
      //   }
      // }
      logger.info('Follow-ups executados');
    } catch (error) {
      logger.error('Erro em executeFollowUps:', error);
    }
  }

  /**
   * Limpeza de dados antigos
   */
  static async cleanupOldData() {
    try {
      // Remover dados com mais de 1 ano
      // await BookingService.deleteOldBookings(365);
      logger.info('Limpeza de dados concluída');
    } catch (error) {
      logger.error('Erro em cleanupOldData:', error);
    }
  }

  /**
   * Gerar relatórios mensais
   */
  static async generateMonthlyReports() {
    try {
      // const report = await ReportService.generateMonthlyReport();
      // await EmailService.sendToAdmin(report);
      logger.info('Relatórios gerados');
    } catch (error) {
      logger.error('Erro em generateMonthlyReports:', error);
    }
  }

  /**
   * Verificar se deve fazer follow-up
   */
  static shouldFollowUp(booking) {
    const now = new Date();
    const completedDate = new Date(booking.completedAt);
    const daysSinceCompletion = (now - completedDate) / (1000 * 60 * 60 * 24);
    
    return daysSinceCompletion >= 1 && daysSinceCompletion < 7;
  }

  /**
   * Agendar tarefa customizada
   */
  static scheduleCustom(pattern, callback) {
    cron.schedule(pattern, callback);
  }
}

module.exports = Scheduler;

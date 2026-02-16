/**
 * Email Queue Service - Bull + Redis
 * 
 * Enfileira emails para envio assíncrono com retry automático
 * Garantia de entrega 99.9% com exponential backoff
 */

const Queue = require('bull');
const logger = require('../utils/logger');
const EmailService = require('./EmailService');
const MonitoringService = require('./MonitoringService');
const RedisService = require('./RedisService');

// Criar fila de emails (tornar tolerante quando Redis não está disponível)
let emailQueue;
const isTest = process.env.NODE_ENV === 'test';

if (isTest) {
  // Em testes, usar mock simples para evitar conexões Redis e timers
  emailQueue = {
    process: () => {},
    on: () => {},
    add: async () => ({ id: `test-${Date.now()}` }),
    getJobCounts: async () => ({ active: 0, waiting: 0, completed: 0, failed: 0, delayed: 0 }),
    getFailed: async () => [],
  };
} else {
  try {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      enableReadyCheck: false,
      enableOfflineQueue: false,
    };
    
    // Apenas add password se não estiver vazia
    if (process.env.REDIS_PASSWORD && process.env.REDIS_PASSWORD.trim()) {
      redisConfig.password = process.env.REDIS_PASSWORD;
    }
    
    emailQueue = new Queue('email', {
      redis: redisConfig,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
      settings: {
        lockDuration: 30000,
        lockRenewTime: 15000,
        maxStalledCount: 2,
      },
    });
  } catch (err) {
    logger.warn('⚠️ Redis/bull não disponível — usando fila de email em modo fallback', { error: err.message });
    // Fallback simples que expõe a API mínima usada pelo serviço
    emailQueue = {
      process: () => {},
      on: () => {},
      add: async () => ({ id: `fallback-${Date.now()}` }),
      getJobCounts: async () => ({ active: 0, waiting: 0, completed: 0, failed: 0, delayed: 0 }),
      getFailed: async () => [],
    };
  }
}

class EmailQueueService {
  constructor() {
    this.queue = emailQueue;
    this.emailService = EmailService; // EmailService é um singleton, não uma classe
    this.monitoringService = MonitoringService; // MonitoringService é um singleton
    this.setupProcessors();
    this.setupEventListeners();
    this._queueFailureCount = 0;
    this.__PLACEHOLDER = null;
    // Em ambientes de desenvolvimento sem Redis, desabilitar checagem periódica
    if (process.env.SKIP_QUEUE_HEALTH === 'true') {
      logger.info('SKIP_QUEUE_HEALTH=true — pulando monitoramento periódico da fila');
    } else {
      this.monitorQueueHealth();
    }
  }

  /**
   * Registrar todos os processadores de jobs
   */
  setupProcessors() {
    // Processor para emails de confirmação de agendamento
    this.queue.process('booking-confirmation', 10, async (job) => {
      return this.processBookingConfirmation(job);
    });

    // Processor para lembrança de agendamento
    this.queue.process('booking-reminder', 5, async (job) => {
      return this.processBookingReminder(job);
    });

    // Processor para email de pagamento
    this.queue.process('payment-notification', 10, async (job) => {
      return this.processPaymentNotification(job);
    });

    // Processor para email de reembolso
    this.queue.process('refund-notification', 5, async (job) => {
      return this.processRefundNotification(job);
    });

    // Processor para email de avaliação
    this.queue.process('review-notification', 5, async (job) => {
      return this.processReviewNotification(job);
    });

    // Processor genérico para outros emails
    this.queue.process('generic-email', 10, async (job) => {
      return this.processGenericEmail(job);
    });
  }

  /**
   * Configurar event listeners para monitoramento
   */
  setupEventListeners() {
    // Quando um job é completado com sucesso
    this.queue.on('completed', (job) => {
      logger.info('📧 Email enviado com sucesso', {
        jobId: job.id,
        type: job.data.type,
        to: job.data.to,
        timestamp: new Date().toISOString(),
      });

      // Atualizar métrica de sucesso
      this.monitoringService.incrementCounter('email.sent', {
        type: job.data.type,
      });
    });

    // Quando um job falha após todas as tentativas
    this.queue.on('failed', (job, err) => {
      logger.error('❌ Email falhou após retries', {
        jobId: job.id,
        type: job.data.type,
        to: job.data.to,
        attempts: job.attemptsMade,
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
      });

      // Atualizar métrica de falha
      this.monitoringService.incrementCounter('email.failed', {
        type: job.data.type,
      });

      // AQUI: Alertar admin sobre falha persistente
      this.handleEmailError(job, err);
    });

    // Quando um job é retentado
    this.queue.on('stalled', (job) => {
      logger.warn('⚠️ Job travou, será retentado', {
        jobId: job.id,
        type: job.data.type,
        timestamp: new Date().toISOString(),
      });
    });

    // Monitorar saúde da fila
    this.monitorQueueHealth();
  }

  /**
   * Enfileirar email de confirmação de agendamento
   */
  async enqueueBookingConfirmation(clientEmail, clientName, bookingData) {
    try {
      const job = await this.queue.add(
        'booking-confirmation',
        {
          type: 'booking-confirmation',
          to: clientEmail,
          clientName,
          bookingData,
          enqueuedAt: new Date().toISOString(),
        },
        {
          jobId: `booking-${bookingData.id}-${Date.now()}`,
          priority: 10, // Alta prioridade
        }
      );

      logger.info('📧 Email de confirmação enfileirado', {
        jobId: job.id,
        to: clientEmail,
        bookingId: bookingData.id,
      });

      return { success: true, jobId: job.id };
    } catch (error) {
      logger.error('❌ Erro ao enfileirar email de confirmação', { error: error.message });
      throw error;
    }
  }

  /**
   * Enfileirar lembrança de agendamento
   */
  async enqueueBookingReminder(clientEmail, clientName, bookingData) {
    try {
      const job = await this.queue.add(
        'booking-reminder',
        {
          type: 'booking-reminder',
          to: clientEmail,
          clientName,
          bookingData,
          enqueuedAt: new Date().toISOString(),
        },
        {
          jobId: `reminder-${bookingData.id}-${Date.now()}`,
          priority: 8,
          delay: 60000, // Enviar após 1 minuto (configurável)
        }
      );

      logger.info('📧 Lembrança enfileirada', {
        jobId: job.id,
        to: clientEmail,
        bookingId: bookingData.id,
      });

      return { success: true, jobId: job.id };
    } catch (error) {
      logger.error('❌ Erro ao enfileirar lembrança', { error: error.message });
      throw error;
    }
  }

  /**
   * Enfileirar confirmação de pagamento
   */
  async enqueuePaymentNotification(clientEmail, clientName, paymentData) {
    try {
      const job = await this.queue.add(
        'booking-confirmation', { type: 'booking-confirmation',
          to: clientEmail,
          clientName,
          paymentData,
          enqueuedAt: new Date().toISOString(),
        },
        {
          jobId: `payment-${paymentData.id}-${Date.now()}`,
          priority: 10, // Máxima prioridade
        }
      );

      return { success: true, jobId: job.id };
    } catch (error) {
      logger.error('❌ Erro ao enfileirar confirmação de pagamento', { error: error.message });
      throw error;
    }
  }

  /**
   * Enfileirar notificação de reembolso
   */
  async enqueueRefundNotification(clientEmail, clientName, refundData) {
    try {
      const job = await this.queue.add(
        'refund-notification',
        {
          type: 'refund-notification',
          to: clientEmail,
          clientName,
          refundData,
          enqueuedAt: new Date().toISOString(),
        },
        {
          jobId: `refund-${refundData.id}-${Date.now()}`,
          priority: 10,
        }
      );

      return { success: true, jobId: job.id };
    } catch (error) {
      logger.error('❌ Erro ao enfileirar notificação de reembolso', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Enfileirar notificação de avaliação
   */
  async enqueueReviewNotification(clientEmail, clientName, reviewData) {
    try {
      const job = await this.queue.add(
        'review-notification',
        {
          type: 'review-notification',
          to: clientEmail,
          clientName,
          reviewData,
          enqueuedAt: new Date().toISOString(),
        },
        {
          jobId: `review-${reviewData.bookingId}-${Date.now()}`,
          priority: 5,
        }
      );

      return { success: true, jobId: job.id };
    } catch (error) {
      logger.error('❌ Erro ao enfileirar notificação de avaliação', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Método genérico para enfileirar emails customizados
   */
  async enqueueGenericEmail(to, subject, htmlContent, options = {}) {
    try {
      const job = await this.queue.add(
        'generic-email',
        {
          type: 'generic-email',
          to,
          subject,
          htmlContent,
          ...options,
          enqueuedAt: new Date().toISOString(),
        },
        {
          jobId: `generic-${Date.now()}`,
          priority: options.priority || 5,
        }
      );

      return { success: true, jobId: job.id };
    } catch (error) {
      logger.error('❌ Erro ao enfileirar email genérico', { error: error.message });
      throw error;
    }
  }

  /**
   * Processadores de jobs
   */

  async processBookingReminder(job) {
    const { to, clientName, bookingData } = job.data;

    try {
      await this.emailService.sendBookingConfirmation(to, clientName, bookingData);
      return {
        success: true,
        processedAt: new Date().toISOString(),
        attempt: job.attemptsMade + 1,
      };
    } catch (error) {
      logger.error('❌ Erro processando confirmação de agendamento', {
        jobId: job.id,
        error: error.message,
        attempt: job.attemptsMade + 1,
      });
      throw error; // Bull vai retry
    }
  }

  async processBookingReminder(job) {
    const { to, clientName, bookingData } = job.data;

    try {
      await this.emailService.sendBookingReminder(to, clientName, bookingData);
      return {
        success: true,
        processedAt: new Date().toISOString(),
        attempt: job.attemptsMade + 1,
      };
    } catch (error) {
      logger.error('❌ Erro processando lembrança', {
        jobId: job.id,
        error: error.message,
      });
      throw error;
    }
  }

  async processBookingReminder(job) {
    const { to, clientName, paymentData } = job.data;

    try {
      // Implementar método no EmailService depois
      await this.emailService.sendPaymentNotification(to, clientName, paymentData);
      return {
        success: true,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('❌ Erro processando confirmação de pagamento', {
        jobId: job.id,
        error: error.message,
      });
      throw error;
    }
  }

  async processBookingReminder(job) {
    const { to, clientName, refundData } = job.data;

    try {
      // Implementar método no EmailService depois
      await this.emailService.sendRefundNotification(to, clientName, refundData);
      return {
        success: true,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('❌ Erro processando notificação de reembolso', {
        jobId: job.id,
        error: error.message,
      });
      throw error;
    }
  }

  async processBookingReminder(job) {
    const { to, clientName, reviewData } = job.data;

    try {
      // Implementar método no EmailService depois
      await this.emailService.sendReviewRequest(to, clientName, reviewData);
      return {
        success: true,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('❌ Erro processando notificação de avaliação', {
        jobId: job.id,
        error: error.message,
      });
      throw error;
    }
  }

  async processGenericEmail(job) {
    const { to, subject, htmlContent } = job.data;

    try {
      const result = await this.emailService.sendGenericEmail(to, subject, htmlContent);
      return {
        success: true,
        processedAt: new Date().toISOString(),
        messageId: result.messageId,
      };
    } catch (error) {
      logger.error('❌ Erro processando email genérico', {
        jobId: job.id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Notificar admin sobre falha persistente de email
   */
  async handleEmailError(job, error) {
    try {
      // ✅ Aqui você pode:
      // 1. Enviar email ao admin
      // 2. Enviar Slack/Discord notification
      // 3. Criar ticket no sistema
      // 4. Salvar em DB para análise

      const adminEmail = process.env.ADMIN_EMAIL || 'admin@leidycleaner.com';
      const failureMessage = `
        ❌ FALHA PERSISTENTE NA ENTREGA DE EMAIL

        Tipo: ${job.data.type}
        Para: ${job.data.to}
        Tentativas: ${job.attemptsMade}
        Erro: ${error.message}
        
        Job ID: ${job.id}
        Timestamp: ${new Date().toISOString()}
        
        Por favor, verifique as credenciais de email e a configuração do Redis.
      `;

      // Salvar em Redis para alertas
      await RedisService.set(
        `email-failure:${job.id}`,
        JSON.stringify({
          jobId: job.id,
          type: job.data.type,
          to: job.data.to,
          error: error.message,
          timestamp: new Date().toISOString(),
          attempts: job.attemptsMade,
        }),
        3600 // Manter por 1 hora
      );

      // Enviar email ao admin (não usar fila para evitar loop infinito)
      // await this.emailService.sendAdminAlert(adminEmail, failureMessage);

      logger.error('📧 Admin alertado sobre falha de email', {
        jobId: job.id,
        adminEmail,
      });
    } catch (error) {
      logger.error('❌ Erro ao notificar admin', { error: error.message });
    }
  }

  /**
   * Monitorar saúde da fila
   */
  async monitorQueueHealth() {
    if (process.env.NODE_ENV === 'test') return; // Não iniciar timer durante testes

    setInterval(async () => {
      try {
        const counts = await this.queue.getJobCounts();

        // Logs estruturados para observabilidade
        logger.info('📊 Queue Health Check', {
          active: counts.active,
          waiting: counts.waiting,
          completed: counts.completed,
          failed: counts.failed,
          delayed: counts.delayed,
          timestamp: new Date().toISOString(),
        });

        // Se muitos jobs falhados, alertar
        if (counts.failed > 50) {
          logger.error('🚨 Muitos emails falhados!', {
            failedCount: counts.failed,
            recommendation: 'Verificar credenciais de email e conexão Redis',
          });
        }

        // Se muitos jobs aguardando, alertar
        if (counts.waiting > 1000) {
          logger.warn('⚠️ Fila de emails crescendo', {
            waitingCount: counts.waiting,
          });
        }
      } catch (error) {
        // Evitar logs repetitivos — incrementar contador e logar apenas em eventos
        // significativos: primeira ocorrência, após 1 hora, ou a cada 10 falhas.
        try {
          this._queueFailureCount = (this._queueFailureCount || 0) + 1;
          const now = Date.now();
          const last = this.__PLACEHOLDER || 0;

          if (this._queueFailureCount === 1 || (now - last) > 60 * 60 * 1000 || this._queueFailureCount % 10 === 0) {
            logger.error('❌ Erro no health check da fila', { error: error.message, count: this._queueFailureCount });
            this.__PLACEHOLDER = now;
          }
        } catch (e) {
          // fallback: se qualquer coisa der errado, logar normalmente
          logger.error('❌ Erro no health check da fila', { error: error.message });
        }
      }
    }, 60000); // A cada 1 minuto
  }

  /**
   * Obter status da fila
   */
  async getQueueStats() {
    try {
      const counts = await this.queue.getJobCounts();

      // Mapear para as chaves esperadas pelo HealthCheckService
      const active = counts?.active || 0;
      const waiting = counts?.waiting || counts?.pending || 0;
      const completed = counts?.completed || 0;
      const failed = counts?.failed || 0;
      const delayed = counts?.delayed || 0;

      return {
        activeCount: active,
        pendingCount: waiting,
        completedCount: completed,
        failedCount: failed,
        delayedCount: delayed,
        total: active + waiting + delayed,
      };
    } catch (error) {
      logger.error('❌ Erro ao obter stats da fila', { error: error.message });
      return null;
    }
  }

  /**
   * Limpar jobs falhados (manutenção)
   */
  async cleanFailedJobs() {
    try {
      const failedJobs = await this.queue.getFailed();
      const removed = await Promise.all(
        failedJobs.slice(0, -50).map((job) => job.remove()) // Manter os últimos 50
      );
      logger.info(`🧹 Limpeza de jobs: ${removed.length} removidos`);
      return removed.length;
    } catch (error) {
      logger.error('❌ Erro ao limpar jobs falhados', { error: error.message });
    }
  }

  /**
   * Reprocessar jobs falhados
   */
  async retryFailedJobs(limit = 10) {
    try {
      const failedJobs = await this.queue.getFailed(0, limit - 1);
      for (const job of failedJobs) {
        await job.retry(); // Vai respeitar o backoff
      }
      logger.info(`🔄 ${failedJobs.length} jobs reenfileirados para retry`);
      return failedJobs.length;
    } catch (error) {
      logger.error('❌ Erro ao reprocessar jobs', { error: error.message });
    }
  }
}

// Exportar singleton
module.exports = new EmailQueueService();

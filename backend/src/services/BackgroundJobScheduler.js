const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const [REDACTED_TOKEN] = require('./[REDACTED_TOKEN]');
const RetryQueueService = require('./RetryQueueService');

/**
 * [REDACTED_TOKEN]
 * Gerencia jobs de background: reconciliação, limpeza, notificações, etc
 */
class [REDACTED_TOKEN] {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  /**
   * Iniciar o scheduler
   */
  async start() {
    if (this.isRunning) {
      console.warn('⚠️  Scheduler já está rodando');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Iniciando Background Job Scheduler');

    // Registrar jobs padrão
    this.registerJob('reconcile_payments', this.[REDACTED_TOKEN].bind(this), '*/15 * * * *'); // A cada 15 min
    this.registerJob('[REDACTED_TOKEN]', this.[REDACTED_TOKEN].bind(this), '*/5 * * * *');  // A cada 5 min
    this.registerJob('cleanup_old_events', this.jobCleanupOldEvents.bind(this), '0 3 * * *');         // 3 AM diariamente
    this.registerJob('[REDACTED_TOKEN]', this.[REDACTED_TOKEN].bind(this), '*/10 * * * *'); // A cada 10 min

    // Iniciar processamento
    this.processJobs();
  }

  /**
   * Parar o scheduler
   */
  stop() {
    console.log('⏹️  Parando Background Job Scheduler');
    this.isRunning = false;
  }

  /**
   * Registrar um job
   */
  registerJob(jobType, handler, cronExpression = null) {
    this.jobs.set(jobType, {
      handler,
      cronExpression: cronExpression || '*/30 * * * *', // Default: a cada 30 min
      lastRun: null,
      nextRun: new Date()
    });

    console.log(`📋 Job registrado: ${jobType}`);
  }

  /**
   * Processar jobs pendentes
   */
  async processJobs() {
    while (this.isRunning) {
      const now = new Date();

      for (const [jobType, jobConfig] of this.jobs.entries()) {
        if (now >= jobConfig.nextRun) {
          console.log(`⏱️  Executando job: ${jobType}`);

          try {
            const jobId = uuidv4();

            // Registrar início do job
            await db.run(
              `INSERT INTO background_jobs (job_id, job_type, status, scheduled_at, started_at)
               VALUES (?, ?, ?, ?, ?)`,
              jobId,
              jobType,
              'running',
              jobConfig.nextRun.toISOString(),
              new Date().toISOString()
            );

            // Executar handler
            const result = await jobConfig.handler();

            // Registrar conclusão
            await db.run(
              `UPDATE background_jobs 
               SET status = 'completed', result = ?, completed_at = ? 
               WHERE job_id = ?`,
              JSON.stringify(result),
              new Date().toISOString(),
              jobId
            );

            console.log(`✅ Job concluído: ${jobType}`, result);

            // Agendar próxima execução (próximos 30 segundos para evitar execução dupla)
            jobConfig.lastRun = now;
            jobConfig.nextRun = new Date(now.getTime() + 30 * 1000);
          } catch (error) {
            console.error(`❌ Erro ao executar job ${jobType}:`, error.message);

            // Registrar erro
            try {
              await db.run(
                `INSERT INTO background_jobs (job_id, job_type, status, error_message, scheduled_at, started_at) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                uuidv4(),
                jobType,
                'failed',
                error.message,
                now.toISOString(),
                now.toISOString()
              );
            } catch (dbError) {
              console.error('❌ Erro ao registrar falha no DB:', dbError.message);
            }

            // Reagendar próxima tentativa em 1 minuto
            jobConfig.nextRun = new Date(now.getTime() + 60 * 1000);
          }
        }
      }

      // Aguardar 5 segundos antes de verificar novamente
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  /**
   * Job: Reconciliar pagamentos PIX
   */
  async [REDACTED_TOKEN]() {
    return [REDACTED_TOKEN].reconcileAll();
  }

  /**
   * Job: Processar fila de retentativas de webhooks
   */
  async [REDACTED_TOKEN]() {
    return RetryQueueService.processQueue();
  }

  /**
   * Job: Limpar eventos antigos
   */
  async jobCleanupOldEvents() {
    try {
      const [REDACTED_TOKEN] = await db.run(
        `DELETE FROM webhook_events WHERE received_at < datetime('now', '-30 days')`
      );

      const [REDACTED_TOKEN] = await db.run(
        `DELETE FROM [REDACTED_TOKEN] WHERE checked_at < datetime('now', '-30 days')`
      );

      return {
        success: true,
        [REDACTED_TOKEN]: [REDACTED_TOKEN].changes || 0,
        [REDACTED_TOKEN]: [REDACTED_TOKEN].changes || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Job: Enviar notificações pendentes
   */
  async [REDACTED_TOKEN]() {
    try {
      const logger = require('../utils/logger');
      const EmailService = require('./EmailService');
      const TwilioService = require('./TwilioService');

      // Buscar notificações pendentes da tabela notifications
      const notifications = db.all(
        `SELECT * FROM notifications 
         WHERE sent = 0 AND scheduled_for <= datetime('now')
         ORDER BY scheduled_for ASC
         LIMIT 100`
      );

      if (!notifications || notifications.length === 0) {
        logger.debug('No pending notifications to send');
        return { success: true, notificationsSent: 0 };
      }

      let sent = 0;
      let failed = 0;

      for (const notification of notifications) {
        try {
          // Send based on type
          if (notification.type === 'email') {
            await EmailService.send(notification.recipient, notification.subject, notification.body);
          } else if (notification.type === 'sms') {
            await TwilioService.sendSMS(notification.recipient, notification.body);
          } else if (notification.type === 'whatsapp') {
            await TwilioService.sendWhatsApp(notification.recipient, notification.body);
          }

          // Mark as sent
          db.run(
            'UPDATE notifications SET sent = 1, sent_at = datetime("now") WHERE id = ?',
            [notification.id]
          );

          sent++;
        } catch (error) {
          logger.warn(`Failed to send notification ${notification.id}:`, error.message);
          failed++;
        }
      }

      logger.info('Background job: notifications sent', { sent, failed, total: notifications.length });
      return { success: true, notificationsSent: sent, failed };
    } catch (error) {
      logger.error('Error in [REDACTED_TOKEN]:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obter status de todos os jobs
   */
  async getJobsStatus() {
    try {
      const dbJobs = await db.all(
        `SELECT * FROM background_jobs ORDER BY scheduled_at DESC LIMIT 100`
      );

      return {
        registeredJobs: Array.from(this.jobs.keys()),
        recentExecutions: dbJobs || []
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Obter estatísticas de jobs
   */
  async getJobsStats() {
    try {
      const stats = await db.get(
        `SELECT 
          COUNT(*) as total_runs,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
          SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END) as running
         FROM background_jobs`
      );

      return stats || { total_runs: 0, successful: 0, failed: 0, running: 0 };
    } catch (error) {
      return { error: error.message };
    }
  }
}

module.exports = new [REDACTED_TOKEN]();

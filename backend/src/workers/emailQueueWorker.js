#!/usr/bin/env node

/**
 * Email Queue Worker
 * 
 * Processa filas de emails em background
 * 
 * Uso:
 * node src/workers/emailQueueWorker.js
 * 
 * Ou com PM2:
 * pm2 start src/workers/emailQueueWorker.js --name "email-queue"
 */

require('dotenv').config();
const logger = require('../utils/logger');
const EmailQueueService = require('../services/EmailService'); // Consolidated service

class EmailQueueWorker {
  constructor() {
    this.queue = EmailQueueService.queue;
    this.isRunning = false;
  }

  /**
   * Iniciar worker
   */
  async start() {
    try {
      logger.info('🚀 Iniciando Email Queue Worker');

      // Verificar conexão com Redis
      try {
        const client = this.queue.client;
        await client.ping();
        logger.info('✅ Conectado ao Redis com sucesso');
      } catch (error) {
        logger.error('❌ Falha ao conectar ao Redis', { error: error.message });
        throw new Error('Não foi possível conectar ao Redis');
      }

      this.isRunning = true;

      // Obter stats iniciais
      const stats = await EmailQueueService.getQueueStats();
      logger.info('📊 Stats da fila', stats);

      // Limpar jobs falhados antigos (manutenção)
      await this.performMaintenance();

      logger.info('✅ Email Queue Worker iniciado com sucesso');
      logger.info('⏳ Aguardando jobs na fila...');

      // Manter o processo rodando
      process.on('SIGTERM', () => {
        logger.info('📴 SIGTERM recebido, encerrando gracefully...');
        this.stop();
      });

      process.on('SIGINT', () => {
        logger.info('📴 SIGINT recebido, encerrando gracefully...');
        this.stop();
      });

      // Monitorar saúde da fila periodicamente
      this.healthCheckInterval = setInterval(() => {
        this.performHealthCheck();
      }, 60000); // A cada 1 minuto
    } catch (error) {
      logger.error('❌ Erro ao iniciar worker', { 
        error: error.message,
        stack: error.stack 
      });
      process.exit(1);
    }
  }

  /**
   * Parar worker gracefully
   */
  async stop() {
    try {
      logger.info('🛑 Encerrando worker...');
      this.isRunning = false;

      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }

      // Parar de processar novos jobs
      await this.queue.close();

      logger.info('✅ Worker encerrado');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Erro ao encerrar worker', { error: error.message });
      process.exit(1);
    }
  }

  /**
   * Verificar saúde da fila
   */
  async performHealthCheck() {
    try {
      const stats = await EmailQueueService.getQueueStats();

      // Log estruturado também disponível em logs/combined.log
      if (stats.failed > 20) {
        logger.warn('⚠️ Muitos jobs falhados', { ...stats });
      }

      if (stats.waiting > 500) {
        logger.warn('⚠️ Fila de espera crescendo muito', { ...stats });
      }

      // Log periodicamente
      if (stats.active > 0 || stats.waiting > 0 || stats.failed > 0) {
        logger.debug('📊 Status da fila', { ...stats, timestamp: new Date().toISOString() });
      }
    } catch (error) {
      logger.error('❌ Erro no health check', { error: error.message });
    }
  }

  /**
   * Realizar manutenção da fila
   */
  async performMaintenance() {
    try {
      logger.info('🧹 Iniciando manutenção da fila');

      // Limpar jobs falhados (manter apenas os últimos 50)
      const cleanedCount = await EmailQueueService.cleanFailedJobs();
      if (cleanedCount) {
        logger.info(`✅ Limpeza concluída: ${cleanedCount} jobs removidos`);
      }

      // Retentar jobs falhados recentemente (últimas 24h)
      // const retriedCount = await EmailQueueService.retryFailedJobs(5);
      // if (retriedCount) {
      //   logger.info(`✅ Retry iniciado para ${retriedCount} jobs`);
      // }
    } catch (error) {
      logger.error('❌ Erro na manutenção', { error: error.message });
    }
  }
}

// Criar e iniciar worker
const worker = new EmailQueueWorker();
worker.start().catch((error) => {
  logger.error('Fatal error starting worker', { error: error.message });
  process.exit(1);
});

// Exportar para testes
module.exports = EmailQueueWorker;

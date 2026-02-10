/**
 * Health Check Controller
 * Endpoints para monitoramento de saúde da aplicação
 */

const HealthCheckService = require('../services/HealthCheckService');
const logger = require('../utils/logger');

class [REDACTED_TOKEN] {
  /**
   * GET /health - Health check detalhado
   * Retorna status completo de todos os serviços
   */
  static async getDetailedHealth(req, res) {
    try {
      const health = await HealthCheckService.getFullHealthStatus();
      
      const statusCode = health.status === 'healthy' ? 200 : 
        health.status === 'degraded' ? 200 : 503;
      
      res.status(statusCode).json(health);
    } catch (error) {
      logger.error('Health check failed', { error: error.message });
      res.status(503).json({
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /health/live - Liveness probe (para load balancers)
   * Retorna 200 se a aplicação está rodando
   */
  static async getLiveness(req, res) {
    try {
      const isAlive = await HealthCheckService.getLivenessProbe();
      res.status(isAlive ? 200 : 503).json({
        status: isAlive ? 'alive' : 'dead',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Liveness probe failed', { error: error.message });
      res.status(503).json({
        status: 'dead',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /health/ready - Readiness probe (para orquestração)
   * Retorna 200 se a aplicação está pronta para receber requisições
   */
  static async getReadiness(req, res) {
    try {
      const isReady = await HealthCheckService.getReadinessProbe();
      res.status(isReady ? 200 : 503).json({
        status: isReady ? 'ready' : 'not_ready',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Readiness probe failed', { error: error.message });
      res.status(503).json({
        status: 'not_ready',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /health/ready/db - Database ready check
   */
  static async getDatabaseReady(req, res) {
    try {
      const dbHealth = await HealthCheckService.checkDatabase();
      const isHealthy = dbHealth.status === 'healthy';
      
      res.status(isHealthy ? 200 : 503).json(dbHealth);
    } catch (error) {
      logger.error('Database readiness check failed', { error: error.message });
      res.status(503).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /health/queue - Email queue status
   */
  static async getQueueStatus(req, res) {
    try {
      const queueHealth = await HealthCheckService.checkEmailQueue();
      const statusCode = queueHealth.status === 'healthy' ? 200 : 
        queueHealth.status === 'degraded' ? 200 : 503;
      
      res.status(statusCode).json(queueHealth);
    } catch (error) {
      logger.error('Queue status check failed', { error: error.message });
      res.status(503).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = [REDACTED_TOKEN];

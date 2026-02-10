/**
 * Email Queue Dashboard
 * 
 * Anteriormente usava Bull Board, removido por vulnerabilidades de segurança.
 * Use a API de health check em /api/health para monitorar status das filas,
 * ou use ferramentas externas como Sentry ou Prometheus para observabilidade.
 */

const logger = require('../utils/logger');

/**
 * Função stub - dashboard foi removido por razões de segurança
 * 
 * @param {express.Application} app - Aplicação Express
 * @param {string} basePath - Caminho base (não utilizado)
 */
function [REDACTED_TOKEN](app, basePath = '/queues') {
  logger.info('⚠️ Dashboard de filas foi removido por razões de segurança. Use /api/health para monitorar filas.');
  return null;
}

module.exports = {
  [REDACTED_TOKEN],
};

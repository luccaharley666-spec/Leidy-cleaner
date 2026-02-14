/**
 * Rate Limit Middleware Configuration
 * ✅ Limites específicos por endpoint para proteção contra DDoS e abuso
 */

const RateLimitService = require('../services/RateLimitService');
const logger = require('../utils/logger');

/**
 * Limiters pré-configurados por tipo de operação
 */
const limiters = {
  /**
   * Criar booking - Máximo 5 por minuto (evita spam de agendamentos)
   */
  createBooking: RateLimitService.createMiddleware({
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 5,
    keyGenerator: (req) => req.user?.id || req.ip,
    message: 'Máximo 5 agendamentos por minuto. Tente novamente em breve.',
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  }),

  /**
   * Login - Máximo 5 tentativas por 15 minutos (proteção brute force)
   */
  login: RateLimitService.createMiddleware({
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5,
    keyGenerator: (req) => req.body?.email || req.ip,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    skipSuccessfulRequests: true, // Não contar sucessos
    skipFailedRequests: false
  }),

  /**
   * Payment - Máximo 2 por minuto (evita cobrança duplicada)
   */
  payment: RateLimitService.createMiddleware({
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 2,
    keyGenerator: (req) => req.user?.id || req.ip,
    message: 'Máximo 2 pagamentos por minuto.',
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  }),

  /**
   * Refund - Máximo 3 por hora (evita abuso de reembolsos)
   */
  refund: RateLimitService.createMiddleware({
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 3,
    keyGenerator: (req) => req.user?.id || req.ip,
    message: 'Máximo 3 reembolsos por hora.',
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  }),

  /**
   * Registrar novo usuário - Máximo 10 por hora por IP (proteção against bot registration)
   */
  register: RateLimitService.createMiddleware({
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 10,
    keyGenerator: (req) => req.ip,
    message: 'Máximo 10 registros por hora. Tente novamente mais tarde.',
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  }),

  /**
   * Criar review - Máximo 3 por hora (evita spam de avaliações)
   */
  createReview: RateLimitService.createMiddleware({
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 3,
    keyGenerator: (req) => req.user?.id || req.ip,
    message: 'Máximo 3 avaliações por hora.',
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  }),

  /**
   * Upload de arquivo - Máximo 5 por 10 minutos (prevenção de abuso)
   */
  upload: RateLimitService.createMiddleware({
    windowMs: 10 * 60 * 1000, // 10 minutos
    maxRequests: 5,
    keyGenerator: (req) => req.user?.id || req.ip,
    message: 'Máximo 5 uploads por 10 minutos.',
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  }),

  /**
   * Admin POST/PUT - Máximo 20 por minuto (criação/atualização de recursos)
   */
  adminWrite: RateLimitService.createMiddleware({
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 20,
    keyGenerator: (req) => req.user?.id || req.ip,
    message: 'Limite de operações administrativas excedido. Tente novamente em breve.',
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  }),

  /**
   * API geral - Máximo 100 por minuto (proteção DDoS)
   */
  general: RateLimitService.createMiddleware({
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 100,
    keyGenerator: (req) => req.ip,
    message: 'Muitas requisições. Tente novamente mais tarde.'
  }),

  /**
   * Rígido - Máximo 10 por minuto (para endpoints sensíveis)
   */
  strict: RateLimitService.createMiddleware({
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 10,
    keyGenerator: (req) => req.ip,
    message: 'Limite de requisições excedido.'
  })
};

/**
 * Hook para logar violações de rate limit
 */
function logRateLimitWarning(req, res, next) {
  const rateLimitHeader = res.getHeader('X-RateLimit-Remaining');
  
  if (rateLimitHeader && parseInt(rateLimitHeader) < 2) {
    logger.warn('⚠️ Rate limit approaching', {
      ip: req.ip,
      userId: req.user?.id,
      endpoint: req.path,
      remaining: rateLimitHeader
    });
  }

  next();
}

module.exports = {
  limiters,
  logRateLimitWarning
};

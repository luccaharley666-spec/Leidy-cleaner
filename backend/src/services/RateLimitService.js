/**
 * Rate Limiting Service
 * Prevenir abuso e ataques DDoS
 * ✅ In-memory com cleanup automático
 */

const logger = require('../utils/logger');

class RateLimitService {
  static store = new Map();
  static defaultWindowMs = 60 * 1000; // 1 minuto
  static defaultMaxRequests = 100;
  static cleanupInterval = 5 * 60 * 1000; // 5 minutos

  static {
    // Cleanup automático
    setInterval(() => {
      const now = Date.now();
      let cleaned = 0;
      
      for (const [key, data] of this.store.entries()) {
        if (now - data.lastCheck > 60 * 60 * 1000) {
          this.store.delete(key);
          cleaned++;
        }
      }
      
      if (cleaned > 0) {
        logger.debug(`Rate limit cleanup: ${cleaned} entries removidas`);
      }
    }, this.cleanupInterval);
  }

  /**
   * Criar middleware de rate limit
   */
  static createMiddleware(options = {}) {
    const {
      windowMs = this.defaultWindowMs,
      maxRequests = this.defaultMaxRequests,
      keyGenerator = (req) => req.ip || req.connection.remoteAddress,
      [REDACTED_TOKEN] = false,
      skipFailedRequests = false,
      message = 'Muitas requisições. Tente novamente mais tarde.'
    } = options;

    return (req, res, next) => {
      try {
        const key = keyGenerator(req);
        const now = Date.now();

        if (!this.store.has(key)) {
          this.store.set(key, {
            count: 0,
            resetTime: now + windowMs,
            lastCheck: now
          });
        }

        const data = this.store.get(key);

        // Reset se window expirou
        if (now > data.resetTime) {
          data.count = 0;
          data.resetTime = now + windowMs;
        }

        data.count++;
        data.lastCheck = now;

        // Headers informativos
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('[REDACTED_TOKEN]', Math.max(0, maxRequests - data.count));
        res.setHeader('X-RateLimit-Reset', new Date(data.resetTime).toISOString());

        // Check limit
        if (data.count > maxRequests) {
          logger.warn('Rate limit exceeded', {
            key,
            count: data.count,
            maxRequests,
            windowMs
          });

          return res.status(429).json({
            error: message,
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil((data.resetTime - now) / 1000)
          });
        }

        next();
      } catch (error) {
        logger.error('Rate limit error', error);
        next(); // Não bloquear por erro
      }
    };
  }

  /**
   * Verificar rate limit manualmente
   */
  static check(key, options = {}) {
    const {
      windowMs = this.defaultWindowMs,
      maxRequests = this.defaultMaxRequests
    } = options;

    const now = Date.now();

    if (!this.store.has(key)) {
      this.store.set(key, {
        count: 0,
        resetTime: now + windowMs,
        lastCheck: now
      });
      return { allowed: true, remaining: maxRequests - 1 };
    }

    const data = this.store.get(key);

    if (now > data.resetTime) {
      data.count = 0;
      data.resetTime = now + windowMs;
    }

    data.count++;
    data.lastCheck = now;

    const allowed = data.count <= maxRequests;
    const remaining = Math.max(0, maxRequests - data.count);

    if (!allowed) {
      logger.warn('Rate limit check failed', {
        key,
        count: data.count,
        maxRequests
      });
    }

    return {
      allowed,
      count: data.count,
      limit: maxRequests,
      remaining,
      resetTime: data.resetTime
    };
  }

  /**
   * Limpar um key específico
   */
  static reset(key) {
    this.store.delete(key);
    logger.debug(`Rate limit reset para ${key}`);
  }

  /**
   * Limpar tudo
   */
  static resetAll() {
    this.store.clear();
    logger.info('Rate limit store limpo completamente');
  }

  /**
   * Obter stats
   */
  static getStats(key) {
    return this.store.get(key) || null;
  }

  /**
   * Presets comuns
   */
  static PRESETS = {
    // App geral
    general: {
      windowMs: 60 * 1000,
      maxRequests: 100
    },
    // Login (mais restritivo)
    login: {
      windowMs: 15 * 60 * 1000, // 15 min
      maxRequests: 5
    },
    // API (moderado)
    api: {
      windowMs: 60 * 1000,
      maxRequests: 50
    },
    // Pagamentos (muito restritivo)
    payment: {
      windowMs: 60 * 1000,
      maxRequests: 10
    },
    // Uploads (restritivo)
    upload: {
      windowMs: 60 * 1000,
      maxRequests: 20
    },
    // Admin (permissivo)
    admin: {
      windowMs: 60 * 1000,
      maxRequests: 200
    }
  };
}

module.exports = RateLimitService;

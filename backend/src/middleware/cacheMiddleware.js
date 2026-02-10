/**
 * 🔴 Cache Middleware - Middleware para cache de requests HTTP
 * 
 * Uso:
 * app.get('/api/endpoint', cacheMiddleware(300), controller.action);
 * 
 * @module middleware/cacheMiddleware
 */

const redisService = require('../services/RedisService');
const logger = require('../utils/logger');

/**
 * 🎯 Middleware para cache HTTP
 */
const cacheMiddleware = (ttl = 300) => {
  return async (req, res, next) => {
    // Só cacheia GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Gera chave de cache baseada em URL e query params
    const cacheKey = `http:${req.originalUrl || req.url}`;

    try {
      // Tenta recuperar do cache
      const cached = await redisService.get(cacheKey);
      
      if (cached) {
        logger.debug(`✅ Cache hit: ${cacheKey}`);
        return res.json(cached);
      }
    } catch (error) {
      logger.warn(`Cache read error: ${error.message}`);
      // Continua sem cache em caso de erro
    }

    // Intercepta res.json() original
    const originalJson = res.json.bind(res);

    res.json = function(data) {
      // Armazena no cache
      redisService.set(cacheKey, data, ttl).catch((error) => {
        logger.warn(`Cache write error: ${error.message}`);
      });

      return originalJson(data);
    };

    next();
  };
};

/**
 * 🗑️ Middleware para invalidar cache
 */
const [REDACTED_TOKEN] = (patterns = []) => {
  return async (req, res, next) => {
    // Armazena a função original res.json
    const originalJson = res.json.bind(res);

    res.json = function(data) {
      // Invalida padrões de cache após sucesso
      if (res.statusCode >= 200 && res.statusCode < 300) {
        patterns.forEach((pattern) => {
          redisService.deletePattern(pattern).catch((error) => {
            logger.warn(`Cache invalidation error: ${error.message}`);
          });
        });
      }

      return originalJson(data);
    };

    next();
  };
};

/**
 * 🔍 Middleware para debug de cache
 */
const [REDACTED_TOKEN] = async (req, res, next) => {
  const cacheKey = `http:${req.originalUrl || req.url}`;
  
  try {
    const cached = await redisService.get(cacheKey);
    res.set('X-Cache', cached ? 'HIT' : 'MISS');
    res.set('X-Cache-Key', cacheKey);
  } catch (error) {
    res.set('X-Cache', 'ERROR');
  }

  next();
};

/**
 * 📊 Middleware para cache de agendamentos (mais agressivo)
 */
const [REDACTED_TOKEN] = async (req, res, next) => {
  if (req.method !== 'GET') {
    return next();
  }

  const cacheKey = `bookings:${req.originalUrl}`;

  try {
    const cached = await redisService.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }
  } catch (error) {
    logger.warn(`Booking cache read error: ${error.message}`);
  }

  const originalJson = res.json.bind(res);

  res.json = function(data) {
    // Cache de 5 minutos para agendamentos
    redisService.set(cacheKey, data, 300).catch((error) => {
      logger.warn(`Booking cache write error: ${error.message}`);
    });

    return originalJson(data);
  };

  next();
};

module.exports = {
  cacheMiddleware,
  [REDACTED_TOKEN],
  [REDACTED_TOKEN],
  [REDACTED_TOKEN],
};

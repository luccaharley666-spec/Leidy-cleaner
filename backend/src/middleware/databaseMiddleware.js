/**
 * Database Connection Pool & Query Tracking Middleware
 * Rastreia e analisa queries para otimização
 */

const [REDACTED_TOKEN] = require('../services/[REDACTED_TOKEN]');
const logger = require('../utils/logger');

/**
 * Middleware para rastrear tempo de execução das queries
 */
function [REDACTED_TOKEN](db) {
  return function(req, res, next) {
    // Interceptar métodos de query do banco
    const originalRun = db.run?.bind(db);
    const originalAll = db.all?.bind(db);
    const originalGet = db.get?.bind(db);
    const originalExec = db.exec?.bind(db);

    if (originalRun) {
      db.run = function(sql, params, callback) {
        const startTime = Date.now();
        const wrappedCallback = (err, result) => {
          const executionTime = Date.now() - startTime;
          [REDACTED_TOKEN].trackQuery(sql, executionTime);
          if (callback) callback(err, result);
        };
        return originalRun(sql, params, wrappedCallback);
      };
    }

    if (originalAll) {
      db.all = function(sql, params, callback) {
        const startTime = Date.now();
        const wrappedCallback = (err, rows) => {
          const executionTime = Date.now() - startTime;
          [REDACTED_TOKEN].trackQuery(sql, executionTime);
          if (callback) callback(err, rows);
        };
        return originalAll(sql, params, wrappedCallback);
      };
    }

    if (originalGet) {
      db.get = function(sql, params, callback) {
        const startTime = Date.now();
        const wrappedCallback = (err, row) => {
          const executionTime = Date.now() - startTime;
          [REDACTED_TOKEN].trackQuery(sql, executionTime);
          if (callback) callback(err, row);
        };
        return originalGet(sql, params, wrappedCallback);
      };
    }

    next();
  };
}

/**
 * Middleware para log de queries preparadas
 */
function logPreparedQueries(req, res, next) {
  if (process.env.DB_LOG_QUERIES === 'true') {
    logger.log({
      level: 'debug',
      message: `Database Query: ${req.method} ${req.path}`,
      timestamp: new Date().toISOString()
    });
  }
  next();
}

/**
 * Middleware para cache de queries (se habilitado)
 */
function [REDACTED_TOKEN](cache) {
  return function(req, res, next) {
    if (!req.query.cache || req.method !== 'GET') {
      return next();
    }

    const cacheKey = `query:${req.method}:${req.path}:${JSON.stringify(req.query)}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.json(cached);
    }

    // Interceptar response para cachear
    const originalJson = res.json;
    res.json = function(data) {
      cache.set(cacheKey, data, 300000); // 5 minutos
      res.set('X-Cache', 'MISS');
      return originalJson.call(this, data);
    };

    next();
  };
}

/**
 * Middleware para monitorar conexões
 */
function [REDACTED_TOKEN]() {
  return function(req, res, next) {
    // Adicionar info de pool ao request
    req.dbPoolStats = {
      activeConnections: 0,
      idleConnections: 0,
      waitingRequests: 0,
      timestamp: new Date().toISOString()
    };

    // Log se há muitas conexões ativas
    if (req.dbPoolStats.activeConnections > 50) {
      logger.warn('High database connection count', {
        activeConnections: req.dbPoolStats.activeConnections
      });
    }

    next();
  };
}

module.exports = {
  [REDACTED_TOKEN],
  logPreparedQueries,
  [REDACTED_TOKEN],
  [REDACTED_TOKEN]
};

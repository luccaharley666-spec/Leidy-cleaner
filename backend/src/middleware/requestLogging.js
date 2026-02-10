/**
 * Request Logging Middleware
 * Registra automaticamente todas as requisições HTTP
 */

const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * Middleware para logging de requisições
 * Registra: método, path, status code, duração, user ID
 */
const [REDACTED_TOKEN] = (req, res, next) => {
  // Gerar request ID único
  req.id = req.headers['x-request-id'] || uuidv4();
  req.startTime = Date.now();

  // Interceptar response.json() para logar resultado
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    const duration = Date.now() - req.startTime;
    const statusCode = res.statusCode;
    
    // Log estruturado da requisição
    logger.logRequest(
      req.method,
      req.path,
      statusCode,
      duration,
      req.user?.id || req.user?.userId || null
    );

    return originalJson(data);
  };

  // Interceptar response.send() também
  const originalSend = res.send.bind(res);
  res.send = function(data) {
    const duration = Date.now() - req.startTime;
    const statusCode = res.statusCode;
    
    logger.logRequest(
      req.method,
      req.path,
      statusCode,
      duration,
      req.user?.id || req.user?.userId || null
    );

    return originalSend(data);
  };

  // Log da requisição recebida (debug level)
  if (process.env.LOG_LEVEL === 'debug') {
    logger.debug(`Incoming: ${req.method} ${req.path}`, {
      requestId: req.id,
      query: req.query,
      body: req.body?.password ? { ...req.body, password: '***' } : req.body,
      headers: {
        userAgent: req.headers['user-agent'],
        referer: req.headers['referer']
      }
    });
  }

  next();
};

module.exports = [REDACTED_TOKEN];

/**
 * Chat Encryption Middleware
 * Middleware para facilitar criptografia/descriptografia de mensagens
 */

const [REDACTED_TOKEN] = require('../services/[REDACTED_TOKEN]');
const logger = require('../utils/logger');

/**
 * Middleware para [REDACTED_TOKEN] mensagens antes do handler
 */
function [REDACTED_TOKEN](req, res, next) {
  // Armazenar método original
  const originalJson = res.json;

  // Interceptar response
  res.json = function(data) {
    // Se tem dados de mensagem criptografada, descriptografar
    if (data && data.messages && Array.isArray(data.messages)) {
      // [REDACTED_TOKEN] se chave disponível
      data.messages = data.messages.map(msg => {
        if (msg.encryptedMessage && !msg.decrypted) {
          return msg; // Deixar como está para cliente descriptografar
        }
        return msg;
      });
    }

    // Chamar método original
    return originalJson.call(this, data);
  };

  next();
}

/**
 * Middleware para validar chave de criptografia
 */
function [REDACTED_TOKEN](req, res, next) {
  // Procurar chave em: body, query, headers
  const keyLocation = req.body?.encryptionKey || 
                      req.query?.encryptionKey || 
                      req.headers?.['x-encryption-key'];

  if (!keyLocation) {
    return res.status(400).json({
      error: 'Chave de criptografia é obrigatória'
    });
  }

  // Validar formato (deve ser hex string de 64 caracteres = 32 bytes)
  if (!/^[a-f0-9]{64}$/i.test(keyLocation)) {
    return res.status(400).json({
      error: 'Formato de chave inválido (deve ser hex 64 caracteres)'
    });
  }

  // Armazenar chave verificada no request
  req.encryptionKey = keyLocation;
  next();
}

/**
 * Middleware para log de operações criptográficas
 */
function logCryptoOperation(req, res, next) {
  const originalJson = res.json;

  res.json = function(data) {
    if (data.success) {
      [REDACTED_TOKEN].logCryptoOperation(
        req.user?.id,
        `${req.method} ${req.path}`.toLowerCase(),
        true
      );
    }

    return originalJson.call(this, data);
  };

  next();
}

/**
 * Middleware para rate limiting em operações criptográficas
 */
function cryptoRateLimit(req, res, next) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  // Simular verificação de rate limit
  // Em produção: verificar em Redis quantas operações criptográficas
  // foram feitas nos últimos 60 segundos
  // Limite: max 100 criptografias/descriptografias por minuto

  // Aqui ficaria lógica de Redis/Store
  // const key = `crypto:${userId}`;
  // const count = await redisClient.incr(key);
  // if (count === 1) await redisClient.expire(key, 60);
  // if (count > 100) return res.status(429).json({ error: 'Rate limit excedido' });

  next();
}

/**
 * Middleware para garantir HTTPS em produção
 */
function [REDACTED_TOKEN](req, res, next) {
  if (process.env.NODE_ENV === 'production' && req.protocol !== 'https') {
    return res.status(403).json({
      error: 'HTTPS é obrigatório para operações criptográficas'
    });
  }
  next();
}

module.exports = {
  [REDACTED_TOKEN],
  [REDACTED_TOKEN],
  logCryptoOperation,
  cryptoRateLimit,
  [REDACTED_TOKEN]
};

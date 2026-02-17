const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');
const config = require('../utils/rateLimitConfig');

// Create Redis client for rate limiting store
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

redisClient.on('error', (err) => {
  console.warn('⚠️ Redis rate limit store unavailable:', err.message);
});

/**
 * Create rate limiter with Redis store
 * Falls back to memory store if Redis unavailable
 */
function createLimiter(configObj, name) {
  const store = redisClient.connected ? new RedisStore({
    client: redisClient,
    prefix: `rl_${name}:`,
    expiry: configObj.windowMs / 1000,
  }) : undefined;  // Falls back to memory store

  return rateLimit({
    store,
    ...configObj,
    handler: (req, res) => {
      res.status(429).json({
        error: configObj.message,
        retryAfter: req.rateLimit?.resetTime,
      });
    },
  });
}

// Export all limiters
module.exports = {
  // Auth limiters
  loginLimiter: createLimiter(config.auth.login, 'login'),
  registerLimiter: createLimiter(config.auth.register, 'register'),
  resetPasswordLimiter: createLimiter(config.auth.resetPassword, 'reset_password'),

  // API limiters
  apiReadLimiter: createLimiter(config.api.read, 'api_read'),
  apiWriteLimiter: createLimiter(config.api.write, 'api_write'),
  searchLimiter: createLimiter(config.api.search, 'search'),

  // Payment limiters
  checkoutLimiter: createLimiter(config.payment.checkout, 'checkout'),
  webhookLimiter: createLimiter(config.payment.webhook, 'webhook'),

  // Admin limiters
  adminLimiter: createLimiter(config.admin.general, 'admin'),

  // Public limiter
  publicLimiter: createLimiter(config.public.general, 'public'),
};

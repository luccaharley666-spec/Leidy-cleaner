import rateLimit from 'express-rate-limit';
import { Request } from 'express';

/**
 * Rate limiter por User ID
 * Protege contra bot abuse mesmo em rede compartilhada (NAT)
 * 
 * Limits:
 * - Usuários autenticados: 100 req/15min
 * - IP anônimo: 50 req/15min
 */

export const userRateLimit = rateLimit({
  keyGenerator: (req: any) => {
    // Prioriza user_id se autenticado
    if (req.user?.id) {
      return `user:${req.user.id}`;
    }
    // Fallback para IP
    return req.ip || 'unknown';
  },
  max: (req: any) => {
    // Usuários autenticados: mais tolerantes
    if (req.user?.id) {
      return 100;
    }
    // Anônimos: mais restritivo
    return 50;
  },
  windowMs: 15 * 60 * 1000, // 15 minutos
  message: 'Too many requests from this user, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip health checks
  skip: (req: Request) => req.path === '/health',
  // Custom handler para error
  handler: (req: Request, res: any) => {
    const rateLimit = (req as any).rateLimit;
    const retryAfter = rateLimit?.resetTime 
      ? Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      : 900; // 15 min default
    
    res.status(429).json({
      error: {
        message: 'Too many requests',
        status: 429,
        retryAfter,
      }
    });
  },
  // Store opciona: usar Redis em produção
  store: undefined, // MemoryStore padrão (trocar por Redis em prod)
});

/**
 * Rate limiter específico para auth (mais restritivo)
 * 5 tentativas / 15 minutos por user/IP
 */
export const authRateLimit = rateLimit({
  keyGenerator: (req: any) => {
    // Se enviar email, usar como key
    const email = req.body?.email || '';
    if (email) {
      return `auth:email:${email}`;
    }
    return `auth:ip:${req.ip}`;
  },
  max: 5, // Muito restritivo para auth
  windowMs: 15 * 60 * 1000, // 15 minutos
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: any) => {
    const rateLimit = (req as any).rateLimit;
    const retryAfter = rateLimit?.resetTime 
      ? Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      : 900;
    
    res.status(429).json({
      error: {
        message: 'Too many authentication attempts',
        status: 429,
        retryAfter,
      }
    });
  },
});

/**
 * Para usar em produção com Redis (muito melhor para distribuído):
 * 
 * import RedisStore from 'rate-limit-redis';
 * import redis from 'redis';
 * 
 * const redisClient = redis.createClient();
 * 
 * export const userRateLimit = rateLimit({
 *   store: new RedisStore({
 *     client: redisClient,
 *     prefix: 'rl:user:',
 *   }),
 *   keyGenerator: (req: any) => req.user?.id || req.ip,
 *   max: 100,
 *   windowMs: 15 * 60 * 1000,
 * });
 */

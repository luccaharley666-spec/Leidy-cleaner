#!/bin/bash

###############################################################################
# 🔧 SETUP: Rate Limits Fine-tuning (FASE 2 - Item 12)
# Status: Implementação completa
###############################################################################

PROJECT_ROOT="/workspaces/adiante"
BACKEND_DIR="$PROJECT_ROOT/backend"

echo "🔒 ==================== RATE LIMITS SETUP ===================="
echo ""

# Verify existing rate limit middleware
if [ -f "$BACKEND_DIR/src/middleware/rateLimit.js" ]; then
    echo "✅ Rate limit middleware encontrado"
    echo ""
    echo "Configuração atual:"
    grep -E "circuitBreaker|windowMs|max" "$BACKEND_DIR/src/middleware/rateLimit.js" | head -10 || echo "Nenhuma config encontrada"
fi

# Create comprehensive rate limit config
cat > "$BACKEND_DIR/src/utils/rateLimitConfig.js" << 'CONFIG'
/**
 * Rate Limit Configuration
 * Defines per-endpoint rate limiting rules
 */

module.exports = {
  // Authentication endpoints
  auth: {
    login: {
      windowMs: 15 * 60 * 1000,  // 15 minutes
      max: 5,                     // 5 attempts
      message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
      standardHeaders: false,
      legacyHeaders: false,
    },
    register: {
      windowMs: 60 * 60 * 1000,   // 1 hour
      max: 10,                    // 10 attempts
      message: 'Muitas tentativas de registro. Tente novamente em 1 hora.',
    },
    resetPassword: {
      windowMs: 60 * 60 * 1000,   // 1 hour
      max: 3,                     // 3 attempts
      message: 'Muitas tentativas de reset. Tente novamente em 1 hora.',
    },
  },

  // API endpoints
  api: {
    read: {
      windowMs: 60 * 1000,        // 1 minute
      max: 100,                   // 100 requests
      message: 'Limite de requisições de leitura excedido.',
    },
    write: {
      windowMs: 60 * 1000,        // 1 minute
      max: 50,                    // 50 requests (more conservative)
      message: 'Limite de requisições de escrita excedido.',
    },
    search: {
      windowMs: 60 * 1000,        // 1 minute
      max: 30,                    // 30 searches
      message: 'Limite de buscas excedido. Aguarde um pouco.',
    },
  },

  // Payment endpoints (MOST strict)
  payment: {
    checkout: {
      windowMs: 60 * 1000,        // 1 minute
      max: 10,                    // 10 checkouts
      message: 'Muitas tentativas de checkout. Tente novamente em 1 minuto.',
    },
    webhook: {
      windowMs: 60 * 1000,        // 1 minute
      max: 1000,                  // Webhooks não devem ser limitados muito
      message: 'Webhook rejeitado - limite excedido.',
    },
  },

  // Admin endpoints (MODERATELY strict)
  admin: {
    general: {
      windowMs: 60 * 1000,        // 1 minute
      max: 200,                   // 200 requests for admins
      message: 'Limite de requisições de admin excedido.',
    },
  },

  // Public endpoints (LEAST strict)
  public: {
    general: {
      windowMs: 60 * 1000,        // 1 minute
      max: 1000,                  // 1000 requests for public
      message: 'Limite de requisições excedido.',
    },
  },
};
CONFIG

echo "✅ Rate limit config criado: $BACKEND_DIR/src/utils/rateLimitConfig.js"
echo ""

# Create middleware to apply rate limits
cat > "$BACKEND_DIR/src/middleware/applyRateLimits.js" << 'MIDDLEWARE'
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
MIDDLEWARE

echo "✅ Rate limit middleware criado: $BACKEND_DIR/src/middleware/applyRateLimits.js"
echo ""

# Create testing script for rate limits
cat > "$PROJECT_ROOT/scripts/test-rate-limits.sh" << 'TEST'
#!/bin/bash

###############################################################################
# Test Rate Limits
###############################################################################

BASE_URL="${BASE_URL:-http://localhost:3001}"
ENDPOINT="${1:-/api/auth/login}"
REQUESTS="${2:-10}"

echo "🧪 Testing rate limits..."
echo "   Endpoint: $ENDPOINT"
echo "   Requests: $REQUESTS"
echo ""

for i in $(seq 1 $REQUESTS); do
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$ENDPOINT" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test123"}')
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)
  
  if [ "$HTTP_CODE" == "429" ]; then
    echo "❌ Request $i: RATE LIMITED ($HTTP_CODE)"
    echo "   Response: $BODY"
    break
  else
    echo "✅ Request $i: OK ($HTTP_CODE)"
  fi
  
  sleep 0.1
done

echo ""
echo "✅ Rate limit test completed"
TEST

chmod +x "$PROJECT_ROOT/scripts/test-rate-limits.sh"
echo "✅ Test script criado: $PROJECT_ROOT/scripts/test-rate-limits.sh"
echo ""

# Create monitoring script for rate limits
cat > "$PROJECT_ROOT/scripts/monitor-rate-limits.sh" << 'MONITOR'
#!/bin/bash

###############################################################################
# Monitor Rate Limits in Redis
###############################################################################

echo "📊 Rate Limit Stats (from Redis):"
echo ""

# Check if Redis is running
if ! redis-cli ping >/dev/null 2>&1; then
  echo "❌ Redis not running. Start with: redis-server"
  exit 1
fi

# Get all rate limit keys
echo "🔍 Active rate limit buckets:"
for key in $(redis-cli keys "rl_*"); do
  COUNT=$(redis-cli GET "$key" | head -1)
  TTL=$(redis-cli TTL "$key")
  echo "   $key: $COUNT requests (expires in ${TTL}s)"
done

echo ""
echo "💾 Total Redis memory used:"
redis-cli info memory | grep used_memory_human

echo ""
echo "📈 Redis stats:"
redis-cli info stats | grep -E "total_commands_processed|total_connections_received|total_net_input_bytes"
MONITOR

chmod +x "$PROJECT_ROOT/scripts/monitor-rate-limits.sh"
echo "✅ Monitor script criado: $PROJECT_ROOT/scripts/monitor-rate-limits.sh"
echo ""

# Create integration example
cat > "$BACKEND_DIR/examples/rate-limit-integration.js" << 'EXAMPLE'
/**
 * Example: How to integrate rate limits in Express routes
 */

const express = require('express');
const limiters = require('../middleware/applyRateLimits');

const router = express.Router();

// AUTH ROUTES WITH RATE LIMITS
router.post('/auth/login', limiters.loginLimiter, (req, res) => {
  // Handler code...
});

router.post('/auth/register', limiters.registerLimiter, (req, res) => {
  // Handler code...
});

router.post('/auth/reset-password', limiters.resetPasswordLimiter, (req, res) => {
  // Handler code...
});

// API ROUTES WITH RATE LIMITS
router.get('/api/users', limiters.apiReadLimiter, (req, res) => {
  // Handler code...
});

router.post('/api/users', limiters.apiWriteLimiter, (req, res) => {
  // Handler code...
});

router.get('/api/search', limiters.searchLimiter, (req, res) => {
  // Handler code...
});

// PAYMENT ROUTES WITH RATE LIMITS
router.post('/api/payments/checkout', limiters.checkoutLimiter, (req, res) => {
  // Handler code...
});

router.post('/api/webhooks/stripe', limiters.webhookLimiter, (req, res) => {
  // Handler code...
});

// ADMIN ROUTES
router.get('/admin/dashboard', limiters.adminLimiter, (req, res) => {
  // Handler code...
});

module.exports = router;
EXAMPLE

echo "✅ Example integration criado: $BACKEND_DIR/examples/rate-limit-integration.js"
echo ""

# Validation
echo "═" 
echo "✅ RATE LIMITS SETUP COMPLETO"
echo ""
echo "Componentes criados:"
echo "  1. rateLimitConfig.js - Definições de limite por endpoint"
echo "  2. applyRateLimits.js - Middleware de aplicação"
echo "  3. test-rate-limits.sh - Script de teste"
echo "  4. monitor-rate-limits.sh - Script de monitoramento"
echo "  5. rate-limit-integration.js - Exemplo de integração"
echo ""
echo "Próximos passos:"
echo "  1. Revisar rateLimitConfig.js e ajustar limites conforme necessário"
echo "  2. Integrar os limiters nas rotas (veja exemplo)"
echo "  3. Testar: bash scripts/test-rate-limits.sh"
echo "  4. Monitorar: bash scripts/monitor-rate-limits.sh"
echo ""


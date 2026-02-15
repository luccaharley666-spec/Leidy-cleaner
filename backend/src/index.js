/**
 * Main Server Entry Point
 * Express app configuration
 */

const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// ✅ Suppress development errors - Redis/PostgreSQL connection errors are expected when services not running
if (process.env.NODE_ENV !== 'production') {
  process.removeAllListeners('uncaughtException');
  process.removeAllListeners('unhandledRejection');
}

// ✅ NEW: Sentry error tracking (centralized logging)
const SentryConfig = require('./config/sentry');
// ✅ NEW: Database pooling (production optimized)
const DatabasePool = require('./config/databasePool');
// ✅ NEW: Redis cache strategy (TTL management)
const cacheStrategy = require('./config/cacheStrategy');

const apiRoutes = require('./routes/api');
// const webhookRoutes = require('./routes/webhooks');
const adminRoutes = require('./routes/admin');
const Scheduler = require('./utils/scheduler');
const ChatService = require('./services/ChatService');
const MonitoringService = require('./services/MonitoringService');
const HealthCheckService = require('./services/HealthCheckService');
const logger = require('./utils/logger');
const requestLogger = require('./middleware/requestLogging');
const path = require('path');
const { initCsrf } = require('./middleware/csrf');
const { queueDashboard } = require('./utils/queueDashboard');
const { ensureSchema } = require('./db/ensureSchema');
const { validateEnv } = require('./config/envValidator');
const { globalErrorHandler, handle404, asyncHandler } = require('./middleware/globalErrorHandler');
const { initializeSwagger } = require('./config/swagger');
// const { metricsMiddleware, metricsEndpoint } = require('./config/prometheus');

// Integração opcional do Next.js (quando INTEGRATE_NEXT=true)
const INTEGRATE_NEXT = process.env.INTEGRATE_NEXT === 'true';
const NEXT_DIR = path.join(__dirname, '..', '..', 'frontend');

// ===== VALIDATE ENVIRONMENT =====
validateEnv();

const app = express();

// ✅ INITIALIZE CACHE STRATEGY (Redis with TTLs)
(async () => {
  const cacheConnected = await cacheStrategy.init();
  if (cacheConnected) {
    app.locals.cache = cacheStrategy;
  }
})();

// ✅ INITIALIZE DATABASE POOL (if using PostgreSQL)
if (process.env.DATABASE_URL?.startsWith('postgresql')) {
  try {
    const pool = DatabasePool.createPool();
    app.locals.db = pool;
    logger.info('✅ Database pool created (production-optimized)');
  } catch (err) {
    logger.warn('Database pool failed - falling back to direct connection', err.message);
  }
}
// ✅ CORRIGIDO: trust proxy configurado apenas se em produção com proxy real
if (process.env.NODE_ENV === 'production' && process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1); // 1 = primeiro proxy
}

const server = http.createServer(app);

// ✅ CORRIGIDO: Socket.io CORS whitelist (não aberto para "*")
const socketCorsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001')
  .split(',')
  .map(origin => origin.trim());

const io = socketIO(server, {
  cors: {
    origin: socketCorsOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// ===== CHAT SERVICE =====
const chatService = new ChatService(io);

// Inicializar CSRF (gera cookie XSRF-TOKEN em GETs e valida POSTs)
initCsrf(app);

// ✅ INITIALIZE SENTRY ERROR HANDLER
try {
  SentryConfig.initializeSentry(app);
  app.locals.sentry = SentryConfig;
} catch (err) {
  logger.warn('Falha ao iniciar Sentry', err.message || err);
}

// Inicializar monitoramento (Sentry / NewRelic)
try {
  const monitoring = new MonitoringService();
  const success = monitoring.init(app);
  if (!success && process.env.NODE_ENV === 'production') {
    logger.error('⚠️  Monitoramento desabilitado (requerido em produção)');
  } else if (!success) {
    logger.debug('ℹ️  Monitoramento offline (development mode)');
  }
  // expor para uso em outros módulos se necessário
  app.locals.monitoring = monitoring;
} catch (err) {
  if (process.env.NODE_ENV === 'production') {
    logger.error('❌ Falha crítica ao iniciar MonitoringService:', err.message);
  }
}

// ===== MIDDLEWARE =====
// Segurança com Helmet (CSP + HSTS explícitos)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://www.googletagmanager.com', 'https://www.google-analytics.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ['https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://www.google-analytics.com'],
      connectSrc: ["'self'", 'https://www.google-analytics.com', 'http://localhost:3001'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"]
    }
  }
}));

// HSTS para forçar HTTPS em produção
if (process.env.NODE_ENV === 'production') {
  app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true }));
}

// ✅ PARAMETRIZADO: Rate limiting - Global + Específicos por rota
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 min
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
const AUTH_LIMIT_MAX = parseInt(process.env.AUTH_LIMIT_MAX_REQUESTS || '5');
const API_LIMIT_WINDOW = parseInt(process.env.API_LIMIT_WINDOW_MS || '60000'); // 1 min
const API_LIMIT_MAX = parseInt(process.env.API_LIMIT_MAX_REQUESTS || '30');

const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW,
  max: RATE_LIMIT_MAX_REQUESTS,
  message: 'Muitas requisições deste IP, tente novamente mais tarde',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health' || req.path === '/health/db' || req.path === '/health/full'
});

// ✅ PARAMETRIZADO: Limites mais rigorosos para rotas sensíveis
const authLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW,
  max: AUTH_LIMIT_MAX,
  message: 'Muitas tentativas de acesso. Tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' // Disable in dev
});

const apiLimiter = rateLimit({
  windowMs: API_LIMIT_WINDOW,
  max: API_LIMIT_MAX,
  message: 'Limite de requisições API excedido',
  skip: (req) => process.env.NODE_ENV === 'development' // Disable in dev
});


// ✅ PARAMETRIZADO: CORS com whitelist explícita
const corsOrigin = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

const corsOptions = {
  origin: corsOrigin,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 horas
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ NOVO: Performance & Security Middleware
const { 
  compressionMiddleware, 
  cacheControl, 
  securityHeaders, 
  responseTime 
} = require('./middleware/performanceMiddleware');

app.use(compressionMiddleware);           // Gzip compression
app.use(cacheControl(3600));              // Cache headers (1 hour TTL for APIs)
app.use(securityHeaders);                 // Security headers
app.use(responseTime);                    // X-Response-Time header

// ✅ NOVO: Middleware de logging (estruturado e automático)
app.use(requestLogger);

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

// ===== ROUTES =====
// Aplicar rate limiters apenas fora do ambiente de teste
// Permitir sobrescrever o comportamento de rate limit via variável de ambiente
// para facilitar execuções locais/CI sem bloquear testes.
if (process.env.NODE_ENV !== 'test' && process.env.SKIP_RATE_LIMIT !== 'true') {
  app.use(limiter);
  app.use('/api/auth', authLimiter);  // Limiter rigoroso para autenticação
  app.use('/api', apiLimiter);        // Limiter padrão para API geral
}

app.use('/api', apiRoutes);
// app.use('/webhooks', webhookRoutes);
app.use('/admin', adminRoutes);
// Também expor rotas administrativas sob /api/admin para compatibilidade com testes
app.use('/api/admin', adminRoutes);

// Servir uploads estáticos
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// ===== DB HEALTH CHECK =====
const { checkDatabase } = require('./utils/health');

app.get('/health/db', async (req, res) => {
  try {
    const dbStatus = await checkDatabase();
    if (dbStatus.ok) {
      res.json({ status: 'OK', db: dbStatus, timestamp: new Date() });
    } else {
      res.status(500).json({ status: 'ERROR', db: dbStatus, timestamp: new Date() });
    }
  } catch (err) {
    logger.error('Health DB route error', err);
    res.status(500).json({ status: 'ERROR', error: err.message });
  }
});

// ===== QUEUE HEALTH =====
app.get('/health/queue', async (req, res) => {
  try {
    const queueHealth = await HealthCheckService.checkEmailQueue();
    if (queueHealth.status === 'healthy') {
      res.json({ status: 'OK', queue: queueHealth, timestamp: new Date() });
    } else if (queueHealth.status === 'degraded') {
      res.status(206).json({ status: 'DEGRADED', queue: queueHealth, timestamp: new Date() });
    } else {
      res.status(500).json({ status: 'ERROR', queue: queueHealth, timestamp: new Date() });
    }
  } catch (err) {
    logger.error('Health queue route error', err);
    res.status(500).json({ status: 'ERROR', error: err.message });
  }
});

// ===== FULL HEALTH =====
app.get('/health/full', async (req, res) => {
  try {
    const full = await HealthCheckService.getFullHealthStatus();
    res.json(full);
  } catch (err) {
    logger.error('Health full route error', err);
    res.status(500).json({ status: 'ERROR', error: err.message });
  }
});

// ===== SERVE SPA =====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'index.html'));
});

// ===== METRICS & MONITORING =====
// app.use(metricsMiddleware);
// app.get('/metrics', metricsEndpoint);

// ===== SWAGGER DOCUMENTATION =====
initializeSwagger(app);

// ===== ERROR HANDLING =====
// 404 Handler
app.use(handle404);

// Global Error Handler (deve ser último)
app.use(globalErrorHandler);

if (app.locals.monitoring && typeof app.locals.monitoring.setupErrorHandler === 'function') {
  app.locals.monitoring.setupErrorHandler(app);
} else {
  app.use((err, req, res, next) => {
    logger.error('Erro no middleware:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  });
}

// ===== QUEUE DASHBOARD (Bull Board) =====
if (process.env.NODE_ENV !== 'production') {
  try {
    queueDashboard(app, '/queues');
  } catch (error) {
    logger.warn('Dashboard de filas não disponível', { error: error.message });
  }
}

// ===== INICIALIZAÇÃO =====
const PORT = process.env.PORT || 3001;

// Iniciar o servidor. Por padrão não iniciamos durante testes, mas suportamos
// sobrescrever esse comportamento com `PLACEHOLDER=true` para permitir
// rodar a aplicação localmente em um processo de teste.
if (process.env.NODE_ENV !== 'test' || process.env.FORCE_RUN === 'true') {
  // Suppress unhandled rejections from optional services in development
  process.on('unhandledRejection', (reason, promise) => {
    if (process.env.NODE_ENV === 'production') {
      logger.error('Unhandled Rejection:', reason);
    }
    // Silently ignore in development - Redis/PostgreSQL failures are okay
  });

  (async () => {
    // Se pedido, preparar Next.js e delegar rotas não-API para o handler do Next
    if (INTEGRATE_NEXT) {
      try {
        const nextApp = require('next')({ dev: process.env.NODE_ENV !== 'production', dir: NEXT_DIR });
        await nextApp.prepare();
        const handleNext = nextApp.getRequestHandler();
        // Registrar rota fallback do Next (deve ficar depois das rotas /api)
        app.get('*', (req, res) => handleNext(req, res));
        logger.info(`Next.js integrado (dir=${NEXT_DIR})`);
      } catch (err) {
        logger.error('Falha ao preparar Next.js para integração:', err && err.message ? err.message : err);
      }
    }
    try {
      await ensureSchema();
      logger.info('Schema do banco verificado/atualizado');
    } catch (err) {
      logger.warn('Falha ao garantir schema do banco:', err.message || err);
    }

    server.listen(PORT, () => {
      logger.info(`🚀 Servidor rodando em http://localhost:${PORT}`);
      // Inicializar scheduler automático
      try {
        Scheduler.init();
        logger.info('Scheduler inicializado com sucesso');
      } catch (err) {
        logger.error('Erro ao inicializar scheduler', err);
      }
      // Inicializar fila de retries (Bull) se configurado
      if (process.env.USE_BULL === 'true') {
        try {
          require('./queues/retryQueue');
          logger.info('Retry queue inicializada (Bull)');
        } catch (err) {
          logger.warn('Falha ao inicializar retry queue:', err && err.message);
          // Fallback to polling runner
          const PollingRetryRunner = require('./services/PollingRetryRunner');
          PollingRetryRunner.start();
          logger.info('PollingRetryRunner iniciado como fallback');
        }
      } else {
        // If Bull not enabled, start polling fallback to ensure retries still happen
        try {
          const PollingRetryRunner = require('./services/PollingRetryRunner');
          PollingRetryRunner.start();
          logger.info('PollingRetryRunner iniciado (USE_BULL != true)');
        } catch (err) {
          logger.warn('Falha ao iniciar PollingRetryRunner:', err && err.message);
        }
      }
    });
  })();
}

module.exports = app;

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

const apiRoutes = require('./routes/api');
const webhookRoutes = require('./routes/webhooks');
const adminRoutes = require('./routes/admin');
const Scheduler = require('./utils/scheduler');
const ChatService = require('./services/ChatService');
const MonitoringService = require('./services/MonitoringService');
const HealthCheckService = require('./services/HealthCheckService');
const logger = require('./utils/logger');
const [REDACTED_TOKEN] = require('./middleware/requestLogging');
const path = require('path');
const { initCsrf } = require('./middleware/csrf');
const { [REDACTED_TOKEN] } = require('./utils/queueDashboard');
const { ensureSchema } = require('./db/ensureSchema');
const { validateEnv } = require('./config/envValidator');
const { globalErrorHandler, handle404, asyncHandler } = require('./middleware/globalErrorHandler');
const { initializeSwagger } = require('./config/swagger');
const { metricsMiddleware, metricsEndpoint } = require('./config/prometheus');

// ===== VALIDATE ENVIRONMENT =====
validateEnv();

const app = express();
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

// Inicializar monitoramento (Sentry / NewRelic)
try {
  const monitoring = new MonitoringService();
  monitoring.init(app);
  // expor para uso em outros módulos se necessário
  app.locals.monitoring = monitoring;
} catch (err) {
  logger.warn('Falha ao iniciar MonitoringService', err.message || err);
}

// ===== MIDDLEWARE =====
// Segurança com Helmet (CSP + HSTS explícitos)
app.use(helmet({
  [REDACTED_TOKEN]: {
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

// ✅ CORRIGIDO: Rate limiting - Global + Específicos por rota
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite 100 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health'
});

// ✅ CORRIGIDO: Limites mais rigorosos para rotas sensíveis
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Máximo 5 tentativas de login/signup em 15 min
  message: 'Muitas tentativas de acesso. Tente novamente em 15 minutos.',
  [REDACTED_TOKEN]: true // Reseta contador se sucesso
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // 30 requisições por minuto
  message: 'Limite de requisições API excedido'
});


// CORS com configuração mais segura
const corsOptions = {
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  [REDACTED_TOKEN]: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ NOVO: Middleware de logging (estruturado e automático)
app.use([REDACTED_TOKEN]);

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
app.use('/webhooks', webhookRoutes);
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
app.use(metricsMiddleware);
app.get('/metrics', metricsEndpoint);

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
    [REDACTED_TOKEN](app, '/queues');
  } catch (error) {
    logger.warn('Dashboard de filas não disponível', { error: error.message });
  }
}

// ===== INICIALIZAÇÃO =====
const PORT = process.env.PORT || 3001;

// Iniciar o servidor. Por padrão não iniciamos durante testes, mas suportamos
// sobrescrever esse comportamento com `[REDACTED_TOKEN]=true` para permitir
// rodar a aplicação localmente em um processo de teste.
if (process.env.NODE_ENV !== 'test' || process.env.[REDACTED_TOKEN] === 'true') {
  (async () => {
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
    });
  })();
}

module.exports = app;

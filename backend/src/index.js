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
const logger = require('./utils/logger');
const path = require('path');

const app = express();
app.set('trust proxy', true);
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// ===== CHAT SERVICE =====
const chatService = new ChatService(io);

// ===== MIDDLEWARE =====
// Segurança com Helmet
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite 100 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde',
  standardHeaders: true, // Retorna informações de rate-limit nos headers
  legacyHeaders: false, // Desabilita X-RateLimit-* headers
  skip: (req) => {
    // Não aplicar rate limit em rotas de health check
    return req.path === '/health';
  }
});

// Aplicar rate limit globalmente
app.use(limiter);

// CORS com configuração mais segura
const corsOptions = {
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

// ===== ROUTES =====
app.use('/api', apiRoutes);
app.use('/webhooks', webhookRoutes);
app.use('/admin', adminRoutes);

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

// ===== SERVE SPA =====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'index.html'));
});

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
  logger.error('Erro no middleware:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// ===== INICIALIZAÇÃO =====
const PORT = process.env.PORT || 3001;

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

module.exports = app;

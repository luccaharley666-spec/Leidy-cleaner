import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import serviceRoutes from './routes/services';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Request logging
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check endpoint (público)
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API v1 routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/services', serviceRoutes);

// Status endpoint
app.get('/api/v1/status', (req: Request, res: Response) => {
  res.json({
    message: 'Vammos API v1',
    status: 'running',
    version: '2.0.0',
    features: {
      auth: 'JWT + Refresh Tokens',
      services: 'CRUD operations',
      database: 'PostgreSQL 15',
      cache: 'Redis 7'
    }
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`✅ Backend running on http://localhost:${PORT}`);
  logger.info(`📚 API: http://localhost:${PORT}/api/v1`);
  logger.info(`💚 Health: http://localhost:${PORT}/health`);
  logger.info(`📊 Status: http://localhost:${PORT}/api/v1/status`);
  logger.info(`🔐 Auth: http://localhost:${PORT}/api/v1/auth`);
  logger.info(`🛍️  Services: http://localhost:${PORT}/api/v1/services`);
});

export default app;

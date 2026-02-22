"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeServer = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const logger_1 = require("./utils/logger");
const sanitize_1 = require("./middleware/sanitize");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = __importDefault(require("./routes/auth"));
const services_1 = __importDefault(require("./routes/services"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const payments_1 = __importDefault(require("./routes/payments"));
const company_1 = __importDefault(require("./routes/company"));
const admin_1 = __importDefault(require("./routes/admin"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const staff_1 = __importDefault(require("./routes/staff"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Trust proxy for rate limiting
app.set('trust proxy', 1);
let server = null;
// Middleware de segurança
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.stripe.com"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Permitir requests sem origin (mobile apps, curl, etc.)
        if (!origin)
            return callback(null, true);
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'https://leidycleaner.com',
            process.env.FRONTEND_URL
        ].filter(Boolean);
        // Accept exact match or allow origins that start with an allowed origin
        if (allowedOrigins.includes(origin) || allowedOrigins.some(o => origin.startsWith(o))) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
// Cookie parser to read HttpOnly cookies (refresh tokens)
app.use((0, cookie_parser_1.default)());
// Request logging
app.use((0, morgan_1.default)('combined', {
    stream: {
        write: (message) => logger_1.logger.info(message.trim())
    }
}));
// Rate limiting
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Mais restritivo para auth
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 200, // Mais permissivo para API
    message: 'API rate limit exceeded.',
    standardHeaders: true,
    legacyHeaders: false,
});
// Aplicar rate limiting
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1', apiLimiter);
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
// Input sanitization
app.use(sanitize_1.sanitizeInput);
// static file serving for uploads
const path_1 = __importDefault(require("path"));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads')));
// Health check endpoint (público)
app.get('/health', async (_req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        checks: {
            database: false,
            memory: true,
            disk: true
        }
    };
    try {
        // Verificar conectividade com banco
        const { query } = require('./utils/database');
        logger_1.logger.info('Testing database connection...');
        // Small delay for SQLite initialization
        await new Promise(resolve => setTimeout(resolve, 100));
        const result = await query('SELECT 1 as test');
        logger_1.logger.info('Database test result:', result);
        health.checks.database = true;
    }
    catch (error) {
        health.status = 'error';
        health.checks.database = false;
        logger_1.logger.error('Health check failed - Database error details:', error.message);
        logger_1.logger.error('DB_TYPE:', process.env.DB_TYPE);
        logger_1.logger.error('DATABASE_LOCAL:', process.env.DATABASE_LOCAL);
    }
    // Verificar uso de memória
    const memUsage = process.memoryUsage();
    const memUsageMB = {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
    };
    // Alerta se heap usado > 80%
    if (memUsage.heapUsed / memUsage.heapTotal > 0.8) {
        health.checks.memory = false;
        health.status = 'warning';
    }
    const statusCode = health.status === 'ok' ? 200 : health.status === 'warning' ? 200 : 503;
    res.status(statusCode).json({
        ...health,
        memory: memUsageMB
    });
});
// API v1 routes
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1/services', services_1.default);
app.use('/api/v1/bookings', bookings_1.default);
app.use('/api/v1/payments', payments_1.default);
app.use('/api/v1/company', company_1.default);
app.use('/api/v1/admin', admin_1.default);
app.use('/api/v1/reviews', reviews_1.default);
app.use('/api/v1/staff', staff_1.default);
// Status endpoint
app.get('/api/v1/status', (_req, res) => {
    res.json({
        message: 'Leidy Cleaner API v1',
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
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        path: req.path,
        method: req.method
    });
});
// Error handler (must be last)
app.use(errorHandler_1.errorHandler);
// Start server only if not being used as middleware
if (!process.env.NEXT_INTEGRATION) {
    server = app.listen(PORT, () => {
        logger_1.logger.info(`✅ Backend running on http://localhost:${PORT}`);
        logger_1.logger.info(`📚 API: http://localhost:${PORT}/api/v1`);
        logger_1.logger.info(`💚 Health: http://localhost:${PORT}/health`);
        logger_1.logger.info(`📊 Status: http://localhost:${PORT}/api/v1/status`);
        logger_1.logger.info(`🔐 Auth: http://localhost:${PORT}/api/v1/auth`);
        logger_1.logger.info(`🛍️  Services: http://localhost:${PORT}/api/v1/services`);
    });
}
// Helper to close the server (used in tests to let Jest exit cleanly)
const closeServer = async () => {
    return new Promise((resolve) => {
        if (server) {
            server.close(() => {
                logger_1.logger.info('✅ HTTP server closed');
                server = null;
                resolve();
            });
        }
        else {
            resolve();
        }
    });
};
exports.closeServer = closeServer;
exports.default = app;
//# sourceMappingURL=main.js.map
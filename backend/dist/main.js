"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = __importDefault(require("./routes/auth"));
const services_1 = __importDefault(require("./routes/services"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const payments_1 = __importDefault(require("./routes/payments"));
const company_1 = __importDefault(require("./routes/company"));
const admin_1 = __importDefault(require("./routes/admin"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const staff_1 = __importDefault(require("./routes/staff"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware de segurança
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
// Request logging
app.use((0, morgan_1.default)('combined', {
    stream: {
        write: (message) => logger_1.logger.info(message.trim())
    }
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
// static file serving for uploads
const path_1 = __importDefault(require("path"));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads')));
// Health check endpoint (público)
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
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
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        path: req.path,
        method: req.method
    });
});
// Error handler (must be last)
app.use(errorHandler_1.errorHandler);
// Start server
app.listen(PORT, () => {
    logger_1.logger.info(`✅ Backend running on http://localhost:${PORT}`);
    logger_1.logger.info(`📚 API: http://localhost:${PORT}/api/v1`);
    logger_1.logger.info(`💚 Health: http://localhost:${PORT}/health`);
    logger_1.logger.info(`📊 Status: http://localhost:${PORT}/api/v1/status`);
    logger_1.logger.info(`🔐 Auth: http://localhost:${PORT}/api/v1/auth`);
    logger_1.logger.info(`🛍️  Services: http://localhost:${PORT}/api/v1/services`);
});
exports.default = app;
//# sourceMappingURL=main.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = exports.query = void 0;
const pg_1 = __importDefault(require("pg"));
const logger_1 = require("./logger");
const { Pool } = pg_1.default;
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'vammos_dev',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
pool.on('connect', () => {
    logger_1.logger.info('✅ PostgreSQL pool conectado');
});
pool.on('error', (error) => {
    logger_1.logger.error('❌ Erro no pool PostgreSQL:', error);
});
const query = async (text, params) => {
    try {
        const result = await pool.query(text, params);
        return result.rows;
    }
    catch (error) {
        logger_1.logger.error('Database query error:', error);
        throw error;
    }
};
exports.query = query;
const getClient = async () => {
    return await pool.connect();
};
exports.getClient = getClient;
exports.default = pool;
// Ensure pool is closed on process exit to avoid open handles in tests
const closePoolGracefully = async () => {
    try {
        await pool.end();
        logger_1.logger.info('✅ PostgreSQL pool closed gracefully');
    }
    catch (err) {
        // ignore
    }
};
process.once('beforeExit', () => {
    void closePoolGracefully();
});
process.once('SIGINT', async () => {
    await closePoolGracefully();
    process.exit(0);
});
//# sourceMappingURL=database.js.map
import pg from 'pg';
import { logger } from './logger';

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'vammos_dev',
  user: process.env.DB_USER || 'vammos',
  password: process.env.DB_PASSWORD || 'vammos_pass',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  logger.info('✅ PostgreSQL pool conectado');
});

pool.on('error', (error) => {
  logger.error('❌ Erro no pool PostgreSQL:', error);
});

export const query = async (text: string, params?: any[]) => {
  try {
    const result = await pool.query(text, params);
    return result.rows;
  } catch (error) {
    logger.error('Database query error:', error);
    throw error;
  }
};

export const getClient = async () => {
  return await pool.connect();
};

export default pool;

/**
 * PostgreSQL Database Connection
 * Supabase PostgreSQL adapter for production
 */

const { Pool } = require('pg');
const logger = require('../utils/logger');

let pool = null;

/**
 * Initialize Supabase PostgreSQL pool
 */
function initializePool() {
  if (pool) return pool;

  const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_URL;
  
  if (!databaseUrl) {
    logger.warn('DATABASE_URL not set; using SQLite fallback');
    return null;
  }

  try {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      logger.error('Unexpected error on idle client', err);
    });

    logger.info('PostgreSQL pool initialized successfully');
    return pool;
  } catch (err) {
    logger.error('Failed to initialize PostgreSQL pool:', err);
    return null;
  }
}

/**
 * Execute query
 */
async function query(text, params = []) {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } catch (err) {
    logger.error('Database query error:', err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Get single row
 */
async function queryOne(text, params = []) {
  const rows = await query(text, params);
  return rows[0] || null;
}

/**
 * Execute insert/update/delete
 */
async function execute(text, params = []) {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return {
      lastID: result.rows[0]?.id,
      changes: result.rowCount,
    };
  } catch (err) {
    logger.error('Database execute error:', err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Get pool instance (lazy initialization)
 */
function getPool() {
  if (!pool) {
    const p = initializePool();
    if (!p) {
      throw new Error('PostgreSQL pool not initialized and DATABASE_URL not set');
    }
    return p;
  }
  return pool;
}

/**
 * Close pool
 */
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('PostgreSQL pool closed');
  }
}

/**
 * Health check
 */
async function healthCheck() {
  try {
    const result = await queryOne('SELECT 1 as ok');
    return { ok: !!result, error: null };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = {
  query,
  queryOne,
  execute,
  getPool,
  closePool,
  healthCheck,
  initializePool,
};

/**
 * Database Factory
 * Automatically selects SQLite (dev) or PostgreSQL/Supabase (production)
 */

const logger = require('../utils/logger');

let dbAdapter = null;

/**
 * Initialize database adapter based on environment
 */
async function initializeDB() {
  const isProduction = process.env.NODE_ENV === 'production';
  const hasDatabaseUrl = !!process.env.DATABASE_URL;

  if (isProduction || (hasDatabaseUrl && process.env.DATABASE_URL.includes('postgresql'))) {
    try {
      const postgres = require('./postgres');
      postgres.initializePool();
      dbAdapter = postgres;
      logger.info('📊 Using PostgreSQL/Supabase adapter');
      return postgres;
    } catch (err) {
      logger.error('Failed to initialize PostgreSQL, falling back to SQLite:', err);
      dbAdapter = require('./sqlite');
      logger.warn('⚠️ Falling back to SQLite adapter');
      return dbAdapter;
    }
  } else {
    dbAdapter = require('./sqlite');
    logger.info('📊 Using SQLite adapter (development)');
    return dbAdapter;
  }
}

/**
 * Get active database adapter
 */
function getDB() {
  if (!dbAdapter) {
    throw new Error('Database not initialized. Call initializeDB() first');
  }
  return dbAdapter;
}

/**
 * Close database connection
 */
async function closeDB() {
  if (dbAdapter?.closePool) {
    await dbAdapter.closePool();
  }
  dbAdapter = null;
}

module.exports = {
  initializeDB,
  getDB,
  closeDB,
};

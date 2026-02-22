import pg from 'pg';
import { logger } from './logger';

const { Pool } = pg;

// Detect database type from environment
const getDBType = () => process.env.DB_TYPE || 'postgres';
const getDatabaseLocal = () => process.env.DATABASE_LOCAL;

logger.info('Database module loaded');

// PostgreSQL configuration
let pool: pg.Pool | null = null;

// SQLite configuration - only import when needed
let sqlite3: any = null;
let sqliteDb: any = null;

// Initialize database connection based on type
const initDatabase = () => {
  const DB_TYPE = getDBType();
  const DATABASE_LOCAL = getDatabaseLocal();
  logger.info('🔄 initDatabase called with DB_TYPE:', DB_TYPE);
  if (DB_TYPE === 'sqlite') {
    logger.info('📱 Setting up SQLite database...');
    // SQLite setup
    if (!sqlite3) {
      try {
        sqlite3 = require('sqlite3');
      } catch (err) {
        logger.error('❌ Failed to require sqlite3:', err);
        throw err;
      }
    }
    if (!sqliteDb) {
      sqliteDb = new sqlite3.Database(DATABASE_LOCAL || './database.sqlite', (err: Error | null) => {
        if (err) {
          logger.error('❌ SQLite connection error:', err);
        } else {
          logger.info('✅ SQLite database connected');
        }
      });
    }
    return sqliteDb;
  } else {
    logger.info('🐘 Setting up PostgreSQL database...');
    // PostgreSQL setup (default)
    if (!pool) {
      // Use DATABASE_URL if available, otherwise construct from individual vars
      const dbConfig = process.env.DATABASE_URL
        ? { connectionString: process.env.DATABASE_URL }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            database: process.env.DB_NAME || (process.env.NODE_ENV === 'test' ? 'leidycleaner_test' : 'leidycleaner_dev'),
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
          };

      pool = new Pool({
        ...dbConfig,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      pool.on('connect', () => {
        logger.info('✅ PostgreSQL pool connected');
      });

      pool.on('error', (error: Error) => {
        logger.error('❌ PostgreSQL pool error:', error);
      });
    }
    return pool;
  }
};

// Initialize immediately - REMOVED for lazy loading
// initDatabase();

// Universal query function
export const query = async (text: string, params?: any[]): Promise<any[]> => {
  // Lazy initialization
  if ((getDBType() === 'sqlite' && !sqliteDb) || (getDBType() !== 'sqlite' && !pool)) {
    initDatabase();
  }
  return new Promise((resolve, reject) => {
    if (getDBType() === 'sqlite' && sqliteDb) {
      // Preprocess SQL for SQLite compatibility
      let sql = text;
      const wantsReturning = /RETURNING\s+/i.test(sql);
      if (wantsReturning) {
        sql = sql.replace(/RETURNING[\s\S]*$/i, '');
      }
      sql = sql.replace(/\bNOW\(\)/ig, 'CURRENT_TIMESTAMP');

      const trimmed = sql.trim().toLowerCase();

      if (trimmed.startsWith('select')) {
        sqliteDb.all(sql, params || [], (err: Error | null, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows);
        });
      } else {
        sqliteDb.run(sql, params || [], function(this: any, err: Error | null) {
          if (err) return reject(err);

          if (wantsReturning) {
            // Try to detect table name for INSERT/UPDATE to fetch the affected row
            const insertMatch = sql.match(/insert\s+into\s+["'`]?([a-zA-Z0-9_]+)["'`]?/i);
            const updateMatch = sql.match(/update\s+["'`]?([a-zA-Z0-9_]+)["'`]?/i);

            if (insertMatch) {
              const table = insertMatch[1];
              const lastID = this && this.lastID;
              sqliteDb.all(`SELECT * FROM ${table} WHERE id = ?`, [lastID], (err2: Error | null, rows: any[]) => {
                if (err2) reject(err2);
                else resolve(rows);
              });
            } else if (updateMatch) {
              const table = updateMatch[1];
              // Assume the id was passed as the last parameter for updates using RETURNING
              const idParam = params && params.length ? params[params.length - 1] : null;
              if (idParam == null) return resolve([]);
              sqliteDb.all(`SELECT * FROM ${table} WHERE id = ?`, [idParam], (err2: Error | null, rows: any[]) => {
                if (err2) reject(err2);
                else resolve(rows);
              });
            } else {
              resolve([]);
            }
          } else {
            resolve([]);
          }
        });
      }
    } else if (pool) {
      pool.query(text, params)
        .then(result => resolve(result.rows))
        .catch(reject);
    } else {
      reject(new Error('Database not initialized'));
    }
  });
};

export const getClient = async () => {
  if (getDBType() === 'sqlite' && sqliteDb) {
    return sqliteDb;
  } else if (pool) {
    return await pool.connect();
  } else {
    throw new Error('Database not initialized');
  }
};

// Initialize on module load - REMOVED to allow dotenv loading first
// const db = initDatabase();

// Export a function to get the database instance instead
export const getDatabase = () => {
  if (getDBType() === 'sqlite') {
    return sqliteDb || initDatabase();
  } else {
    return pool || initDatabase();
  }
};

export default getDatabase;
const closeDatabaseGracefully = async () => {
  try {
    if (sqliteDb) {
      await new Promise<void>((resolve, reject) => {
        try {
          sqliteDb.close((err: Error | null) => {
            if (err) {
              logger.error('Error closing SQLite:', err);
              return reject(err);
            }
            logger.info('✅ SQLite database closed gracefully');
            sqliteDb = null;
            resolve();
          });
        } catch (err) {
          // if close throws synchronously
          logger.error('SQLite close threw error:', err);
          sqliteDb = null;
          return resolve();
        }
      });
    } else if (pool) {
      try {
        await pool.end();
        logger.info('✅ PostgreSQL pool closed gracefully');
      } finally {
        pool = null as any;
      }
    }
  } catch (err) {
    // ignore
  }
};

process.on('SIGINT', closeDatabaseGracefully);
process.on('SIGTERM', closeDatabaseGracefully);

// Exported helper to allow tests to close DB connections gracefully
export const closeDatabase = closeDatabaseGracefully;

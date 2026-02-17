import fs from 'fs';
import path from 'path';
import { query } from '../utils/database';
import { logger } from '../utils/logger';

interface Migration {
  name: string;
  sql: string;
}

async function runMigrations() {
  try {
    logger.info('🔄 Starting database migrations...');

    // Create migrations tracking table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    logger.info('📋 Migrations tracking table ready');

    // Read all migration files
    const migrationsDir = path.join(__dirname, '../../migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    logger.info(`Found ${migrationFiles.length} migration files`);

    for (const file of migrationFiles) {
      const migrationName = file.replace('.sql', '');
      
      // Check if migration already executed
      const result = await query(
        'SELECT * FROM migrations WHERE name = $1',
        [migrationName]
      );

      if (result.rows.length > 0) {
        logger.info(`✅ Migration already executed: ${migrationName}`);
        continue;
      }

      // Read and execute migration
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      logger.info(`🚀 Executing migration: ${migrationName}`);
      
      // Execute all statements in the SQL file
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        try {
          await query(statement);
        } catch (err) {
          // Log but continue if it's a "already exists" error
          if (err instanceof Error && err.message.includes('already exists')) {
            logger.warn(`⚠️  ${err.message}`);
          } else {
            throw err;
          }
        }
      }

      // Record migration as executed
      await query(
        'INSERT INTO migrations (name) VALUES ($1)',
        [migrationName]
      );

      logger.info(`✨ Migration completed: ${migrationName}`);
    }

    logger.info('✅ All migrations completed successfully!');
    process.exit(0);
  } catch (err) {
    logger.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations();
}

export { runMigrations };

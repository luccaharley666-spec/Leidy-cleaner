"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = runMigrations;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = require("../utils/database");
const logger_1 = require("../utils/logger");
async function runMigrations() {
    try {
        logger_1.logger.info('🔄 Starting database migrations...');
        // Create migrations tracking table if it doesn't exist
        await (0, database_1.query)(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        logger_1.logger.info('📋 Migrations tracking table ready');
        // Read all migration files
        const migrationsDir = path_1.default.join(__dirname, '../../migrations');
        const migrationFiles = fs_1.default.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();
        logger_1.logger.info(`Found ${migrationFiles.length} migration files`);
        for (const file of migrationFiles) {
            const migrationName = file.replace('.sql', '');
            // Check if migration already executed
            const result = await (0, database_1.query)('SELECT * FROM migrations WHERE name = $1', [migrationName]);
            if (result.length > 0) {
                logger_1.logger.info(`✅ Migration already executed: ${migrationName}`);
                continue;
            }
            // Read and execute migration
            const filePath = path_1.default.join(migrationsDir, file);
            const sql = fs_1.default.readFileSync(filePath, 'utf-8');
            logger_1.logger.info(`🚀 Executing migration: ${migrationName}`);
            // Execute all statements in the SQL file
            const statements = sql
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
            for (const statement of statements) {
                try {
                    logger_1.logger.info(`Executing SQL statement: ${statement.slice(0, 240).replace(/\n/g, ' ')}`);
                    await (0, database_1.query)(statement);
                }
                catch (err) {
                    logger_1.logger.error('Error executing statement:', statement.slice(0, 240).replace(/\n/g, ' '));
                    // Log but continue if it's a "already exists" error
                    if (err instanceof Error && err.message.includes('already exists')) {
                        logger_1.logger.warn(`⚠️  ${err.message}`);
                    }
                    else {
                        throw err;
                    }
                }
            }
            // Record migration as executed
            await (0, database_1.query)('INSERT INTO migrations (name) VALUES ($1)', [migrationName]);
            logger_1.logger.info(`✨ Migration completed: ${migrationName}`);
        }
        logger_1.logger.info('✅ All migrations completed successfully!');
        process.exit(0);
    }
    catch (err) {
        logger_1.logger.error('❌ Migration failed:', err);
        process.exit(1);
    }
}
// Run if called directly
if (require.main === module) {
    runMigrations();
}
//# sourceMappingURL=runMigrations.js.map
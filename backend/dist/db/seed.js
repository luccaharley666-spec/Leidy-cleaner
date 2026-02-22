"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = seedDatabase;
const database_1 = require("../utils/database");
const logger_1 = require("../utils/logger");
const password_1 = require("../utils/password");
async function seedDatabase() {
    try {
        logger_1.logger.info('🌱 Starting database seeding...');
        // For tests, use direct database connection to avoid module conflicts
        let testQuery = database_1.query;
        if (process.env.NODE_ENV === 'test' && process.env.DB_TYPE !== 'sqlite') {
            const { Pool } = require('pg');
            const testPool = new Pool({
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432'),
                database: process.env.DB_NAME || 'postgres',
                user: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD || 'postgres',
            });
            // Use direct pool query for tests
            testQuery = async (sql, params) => {
                const client = await testPool.connect();
                try {
                    const result = await client.query(sql, params);
                    return result.rows;
                }
                finally {
                    client.release();
                }
            };
            // Clean up test pool after seeding
            process.on('exit', () => testPool.end());
        }
        // Check admin (skip if SKIP_ADMIN_SEED is set)
        if (!process.env.SKIP_ADMIN_SEED) {
            const existingAdmin = await testQuery("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
            const adminCount = parseInt(existingAdmin[0].count || '0', 10);
            if (adminCount === 0) {
                const adminPassword = await (0, password_1.hashPassword)(process.env.ADMIN_PASSWORD || 'admin123456');
                await testQuery(`INSERT INTO users (email, password_hash, full_name, phone, role, is_active)
           VALUES ($1, $2, $3, $4, $5, $6)`, [
                    'admin@leidycleaner.com',
                    adminPassword,
                    'Administrador',
                    '+55 11 98765-4321',
                    'admin',
                    true
                ]);
                logger_1.logger.info('✨ Admin user created: admin@leidycleaner.com');
            }
            else {
                logger_1.logger.info('✅ Admin user already exists');
            }
        }
        else {
            logger_1.logger.info('⏭️ Skipping admin seed (SKIP_ADMIN_SEED=true)');
        }
        // Services
        const existingServices = await testQuery('SELECT COUNT(*) as count FROM services');
        const servicesCount = parseInt(existingServices[0].count || '0', 10);
        if (servicesCount === 0) {
            const services = [
                { name: 'Limpeza Residencial Básica', description: 'Varredura, limpeza de pisos, banheiros e cozinha.', category: 'Residencial', base_price: 180.0, duration_minutes: 90 },
                { name: 'Limpeza Residencial Profunda', description: 'Limpeza completa e detalhada.', category: 'Residencial', base_price: 400.0, duration_minutes: 240 },
                { name: 'Limpeza Pós-Obra', description: 'Remoção de poeira e resíduos.', category: 'Residencial', base_price: 800.0, duration_minutes: 360 },
            ];
            for (const service of services) {
                await testQuery(`INSERT INTO services (name, description, category, base_price, duration_minutes, is_active)
           VALUES ($1, $2, $3, $4, $5, $6)`, [service.name, service.description, service.category, service.base_price, service.duration_minutes, true]);
            }
            logger_1.logger.info(`✨ ${services.length} services created`);
        }
        else {
            logger_1.logger.info('✅ Services already exist');
        }
        // Company
        const existingCompany = await testQuery('SELECT COUNT(*) as count FROM company_info');
        const companyCount = parseInt(existingCompany[0].count || '0', 10);
        if (companyCount === 0) {
            await testQuery(`INSERT INTO company_info (name, legal_name, email, phone, address, city, state, country, postal_code, logo_url, description, terms, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`, [
                process.env.COMPANY_NAME || 'Leidy Cleaner',
                process.env.COMPANY_LEGAL_NAME || 'Leidy Cleaner Serviços de Limpeza Ltda',
                process.env.COMPANY_EMAIL || 'contato@leidycleaner.com.br',
                process.env.COMPANY_PHONE || '(11) 98765-4321',
                process.env.COMPANY_ADDRESS || 'Av. Paulista, 1000',
                process.env.COMPANY_CITY || 'São Paulo',
                process.env.COMPANY_STATE || 'SP',
                process.env.COMPANY_COUNTRY || 'Brasil',
                process.env.COMPANY_POSTAL_CODE || '01311-100',
                process.env.COMPANY_LOGO_URL || 'https://example.com/logo.png',
                process.env.COMPANY_DESCRIPTION || 'Leidy Cleaner é uma empresa especializada em serviços de limpeza profissional de alta qualidade.',
                process.env.COMPANY_TERMS || 'Termos e políticas padrão.'
            ]);
            logger_1.logger.info('✨ Company info seeded');
        }
        else {
            logger_1.logger.info('✅ Company info already exists');
        }
        logger_1.logger.info('✅ Database seeding completed successfully!');
        // Only exit if called directly, not when imported
        if (require.main === module) {
            process.exit(0);
        }
    }
    catch (err) {
        logger_1.logger.error('❌ Seeding failed:', err);
        // Only exit if called directly, not when imported
        if (require.main === module) {
            process.exit(1);
        }
        else {
            throw err; // Re-throw for Jest to catch
        }
    }
}
if (require.main === module)
    seedDatabase();
//# sourceMappingURL=seed.js.map
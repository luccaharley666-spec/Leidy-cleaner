import { query } from '../utils/database';
import { logger } from '../utils/logger';
import { hashPassword } from '../utils/password';

async function seedDatabase() {
  try {
    logger.info('🌱 Starting database seeding...');

    // Check admin
    const existingAdmin = await query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'admin'"
    );
    const adminCount = parseInt(((existingAdmin as any[])[0] as any).count || '0', 10);
    if (adminCount === 0) {
      const adminPassword = await hashPassword(process.env.ADMIN_PASSWORD || 'admin123456');
      await query(
        `INSERT INTO users (email, password_hash, full_name, phone, role, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          'admin@vammos.com',
          adminPassword,
          'Administrador',
          '+55 11 98765-4321',
          'admin',
          true
        ]
      );
      logger.info('✨ Admin user created: admin@vammos.com');
    } else {
      logger.info('✅ Admin user already exists');
    }

    // Services
    const existingServices = await query('SELECT COUNT(*) as count FROM services');
    const servicesCount = parseInt((existingServices[0] as any).count || '0', 10);
    if (servicesCount === 0) {
      const services = [
        { name: 'Limpeza Residencial Básica', description: 'Varredura, limpeza de pisos, banheiros e cozinha.', category: 'Residencial', base_price: 180.0, duration_minutes: 90 },
        { name: 'Limpeza Residencial Profunda', description: 'Limpeza completa e detalhada.', category: 'Residencial', base_price: 400.0, duration_minutes: 240 },
        { name: 'Limpeza Pós-Obra', description: 'Remoção de poeira e resíduos.', category: 'Residencial', base_price: 800.0, duration_minutes: 360 },
      ];

      for (const service of services) {
        await query(
          `INSERT INTO services (name, description, category, base_price, duration_minutes, is_active)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [service.name, service.description, service.category, service.base_price, service.duration_minutes, true]
        );
      }
      logger.info(`✨ ${services.length} services created`);
    } else {
      logger.info('✅ Services already exist');
    }

    // Company
    const existingCompany = await query('SELECT COUNT(*) as count FROM company_info');
    const companyCount = parseInt((existingCompany[0] as any).count || '0', 10);
    if (companyCount === 0) {
      await query(
        `INSERT INTO company_info (name, legal_name, email, phone, address, city, state, country, postal_code, logo_url, description, terms, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),NOW())`,
        [
          process.env.COMPANY_NAME || 'Limpar Plus',
          process.env.COMPANY_LEGAL_NAME || 'Limpar Plus Serviços de Limpeza Ltda',
          process.env.COMPANY_EMAIL || 'contato@limparplus.com.br',
          process.env.COMPANY_PHONE || '(11) 98765-4321',
          process.env.COMPANY_ADDRESS || 'Av. Paulista, 1000',
          process.env.COMPANY_CITY || 'São Paulo',
          process.env.COMPANY_STATE || 'SP',
          process.env.COMPANY_COUNTRY || 'Brasil',
          process.env.COMPANY_POSTAL_CODE || '01311-100',
          process.env.COMPANY_LOGO_URL || 'https://example.com/logo.png',
          process.env.COMPANY_DESCRIPTION || 'Limpar Plus é uma empresa especializada em serviços de limpeza profissional de alta qualidade.',
          process.env.COMPANY_TERMS || 'Termos e políticas padrão.'
        ]
      );
      logger.info('✨ Company info seeded');
    } else {
      logger.info('✅ Company info already exists');
    }

    logger.info('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    logger.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

if (require.main === module) seedDatabase();

export { seedDatabase };

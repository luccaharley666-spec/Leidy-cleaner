import { query } from '../utils/database';
import { logger } from '../utils/logger';
import { hashPassword } from '../utils/password';

async function seedDatabase() {
  try {
    logger.info('🌱 Starting database seeding...');

    // Create admin user unless tests request skipping admin seed
    if (!process.env.SKIP_ADMIN_SEED) {
      const existingAdmin = await query(
        "SELECT COUNT(*) as count FROM users WHERE role = 'admin'"
      );

      if (((existingAdmin as any[])[0] as any).count === 0) {
        // Create admin user
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
    } else {
      logger.info('⏭ Skipping admin seed (SKIP_ADMIN_SEED=true)');
    }

    // Check if services already exist
    const existingServices = await query(
      'SELECT COUNT(*) as count FROM services'
    );

    if ((existingServices[0] as any).count === 0) {
      // Default service categories and services - Professional Cleaning
      const services = [
        {
          name: 'Limpeza Residencial Básica',
          description: 'Varredura, limpeza de pisos, banheiros e cozinha. Ideal para casas pequenas e manutenção periódica.',
          category: 'Residencial',
          base_price: 180.00,
          duration_minutes: 90
        },
        {
          name: 'Limpeza Residencial Profunda',
          description: 'Limpeza completa e detalhada: móveis, cortinas, vidros, base, rodapés. Recomendado mensalmente.',
          category: 'Residencial',
          base_price: 400.00,
          duration_minutes: 240
        },
        {
          name: 'Limpeza Pós-Obra',
          description: 'Remoção de poeira, tinta, cimento e debris. Deixa a obra pronta para mobiliário.',
          category: 'Residencial',
          base_price: 800.00,
          duration_minutes: 360
        },
        {
          name: 'Limpeza de Escritório',
          description: 'Limpeza diária de mesas, pisos, banheiros e áreas comuns. Contrato mensal com desconto.',
          category: 'Comercial',
          base_price: 250.00,
          duration_minutes: 120
        },
        {
          name: 'Limpeza de Lojas e Comércios',
          description: 'Limpeza de vitrines, balcões e áreas externas. Adaptamos ao seu horário comercial.',
          category: 'Comercial',
          base_price: 350.00,
          duration_minutes: 150
        },
        {
          name: 'Limpeza Pós-Evento',
          description: 'Limpeza após festas, casamentos ou confraternizações. Remoção completa de resíduos.',
          category: 'Eventos',
          base_price: 600.00,
          duration_minutes: 180
        },
        {
          name: 'Higienização com Ozônio',
          description: 'Desinfecção profissional com ozônio. Elimina 99% de bactérias e vírus.',
          category: 'Especializado',
          base_price: 500.00,
          duration_minutes: 120
        },
        {
          name: 'Limpeza de Tapetes e Sofás',
          description: 'Limpeza profissional com extratora de vapor. Ideal para tapetes e estofados.',
          category: 'Especializado',
          base_price: 300.00,
          duration_minutes: 90
        },
        {
          name: 'Limpeza de Vidros e Fachadas',
          description: 'Limpeza especializada de janelas, vidros e fachadas de prédios.',
          category: 'Especializado',
          base_price: 400.00,
          duration_minutes: 120
        },
        {
          name: 'Serviço de Organização',
          description: 'Organização completa de ambientes + limpeza profunda.',
          category: 'Organização',
          base_price: 350.00,
          duration_minutes: 150
        }
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

    // Seed company info if not exists
    const existingCompany = await query('SELECT COUNT(*) as count FROM company_info');
    if ((existingCompany[0] as any).count === 0) {
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
          process.env.COMPANY_DESCRIPTION || 'Limpar Plus é uma empresa especializada em serviços de limpeza profissional de alta qualidade. Atendemos residências, escritórios e eventos em São Paulo e região metropolitana. Garantia de satisfação em 100% dos serviços.',
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

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };

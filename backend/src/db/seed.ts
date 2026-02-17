import { query } from '../utils/database';
import { logger } from '../utils/logger';
import { hashPassword } from '../utils/password';

async function seedDatabase() {
  try {
    logger.info('🌱 Starting database seeding...');

    // Check if admin user exists
    const existingAdmin = await query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'admin'"
    );

    if (existingAdmin.rows[0].count === 0) {
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

    // Check if services already exist
    const existingServices = await query(
      'SELECT COUNT(*) as count FROM services'
    );

    if (existingServices.rows[0].count === 0) {
      // Default service categories and services
      const services = [
        {
          name: 'Limpeza Residencial Simples',
          description: 'Limpeza completa de residências, incluindo aspiração, varrição e limpeza de pisos',
          category: 'Residencial',
          base_price: 150.00,
          duration_minutes: 120
        },
        {
          name: 'Limpeza Residencial Premium',
          description: 'Limpeza profunda incluindo móveis, vidros e desinfecção',
          category: 'Residencial',
          base_price: 300.00,
          duration_minutes: 180
        },
        {
          name: 'Limpeza Comercial',
          description: 'Limpeza de escritórios, consultórios e pequenos comerciais',
          category: 'Comercial',
          base_price: 250.00,
          duration_minutes: 150
        },
        {
          name: 'Limpeza Pós-Obra',
          description: 'Limpeza completa após reforma ou construção',
          category: 'Pós-Obra',
          base_price: 500.00,
          duration_minutes: 240
        },
        {
          name: 'Limpeza de Vidros',
          description: 'Limpeza especializada de janelas, vidros e fachadas',
          category: 'Especializada',
          base_price: 200.00,
          duration_minutes: 90
        },
        {
          name: 'Limpeza de Tapetes',
          description: 'Limpeza profissional com equipamento especializado',
          category: 'Especializada',
          base_price: 180.00,
          duration_minutes: 120
        },
        {
          name: 'Organização de Ambiente',
          description: 'Serviço de organização e limpeza conjunta',
          category: 'Organização',
          base_price: 200.00,
          duration_minutes: 120
        },
        {
          name: 'Limpeza de Cozinha',
          description: 'Limpeza profunda de cozinha',
          category: 'Especializada',
          base_price: 180.00,
          duration_minutes: 90
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

// Jest setup after environment is ready.
// Place global mocks or test utilities here.
jest.setTimeout(60000); // Increased timeout to 60 seconds

// Ensure test environment variables are loaded
require('dotenv').config({ path: '.env.test' });
process.env.NODE_ENV = 'test';

const path = require('path');

const DB_TYPE = process.env.DB_TYPE || 'postgres';
let pool = null;

if (DB_TYPE !== 'sqlite') {
  const { Pool } = require('pg');
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });
}

beforeAll(async () => {
  try {
    console.log('🧹 Setting up test database...');

    let usedSqliteFallback = false;
    if (DB_TYPE === 'sqlite') {
      const sqlite3 = require('sqlite3');
      const dbPath = process.env.DATABASE_LOCAL || path.join(__dirname, 'test.sqlite');
      const db = new sqlite3.Database(dbPath);
      // Delete data from tables
      const tables = ['bookings', 'reviews', 'services', 'users', 'company_info', 'staff_availability'];
      for (const t of tables) {
        await new Promise((resolve, reject) => db.run(`DELETE FROM ${t}`, (err) => err ? reject(err) : resolve(null)));
      }
      db.close();
      console.log('✅ SQLite test database cleaned');
    } else {
      // Try Postgres truncate; if it fails, fallback to SQLite cleanup
      try {
        await pool.query('TRUNCATE TABLE bookings, reviews, services, users RESTART IDENTITY CASCADE');
        console.log('✅ Database truncated successfully');
      } catch (pgErr) {
        console.warn('⚠️  Postgres truncate failed, attempting SQLite cleanup fallback:', pgErr && pgErr.message);
        usedSqliteFallback = true;
      }

      if (usedSqliteFallback) {
        const sqlite3 = require('sqlite3');
        const dbPath = process.env.DATABASE_LOCAL || path.join(__dirname, 'test.sqlite');
        const db = new sqlite3.Database(dbPath);
        const tables = ['bookings', 'reviews', 'services', 'users', 'company_info', 'staff_availability'];
        for (const t of tables) {
          try {
            await new Promise((resolve, reject) => db.run(`DELETE FROM ${t}`, (err) => err ? reject(err) : resolve(null)));
          } catch (e) {
            // ignore missing tables
          }
        }
        db.close();
        console.log('✅ SQLite test database cleaned (fallback)');
      }
    }

    // Reseed default data
    console.log('🌱 Seeding test data...');
    // Ensure test env variables are set
    process.env.NODE_ENV = 'test';

    // Clear require cache to ensure fresh load
    delete require.cache[require.resolve('./src/db/seed')];
    delete require.cache[require.resolve('./src/utils/database')];
    delete require.cache[require.resolve('./src/utils/logger')];

    const { seedDatabase } = require('./src/db/seed');
    await seedDatabase();
    console.log('✅ Test data seeded successfully');
  } catch (err) {
    console.error('❌ Error in beforeAll:', err.message);
    console.error('Stack:', err.stack);
    throw err;
  }
});

afterAll(async () => {
  try {
    // Stop background tasks that keep Node running
    try {
      const { cache } = require('./src/utils/cache');
      if (cache && typeof cache.stopCleanup === 'function') cache.stopCleanup();
    } catch (e) {}

    // Close DB connections (Postgres pool or SQLite)
    try {
      const { closeDatabase } = require('./src/utils/database');
      if (typeof closeDatabase === 'function') await closeDatabase();
    } catch (e) {}

    // Close HTTP server if running
    try {
      const { closeServer } = require('./src/main');
      if (typeof closeServer === 'function') await closeServer();
    } catch (e) {}

    // Try to close other common long-lived clients (redis, bull queues, socket.io, cron)
    try {
      // Redis client helper
      try {
        const redisClient = require('./src/utils/redis');
        if (redisClient && typeof redisClient.quit === 'function') await redisClient.quit();
        if (redisClient && typeof redisClient.disconnect === 'function') redisClient.disconnect();
      } catch (e) {}

      // Bull / Queue services
      try {
        const emailQueue = require('./src/services/EmailQueueService');
        if (emailQueue && typeof emailQueue.close === 'function') await emailQueue.close();
      } catch (e) {}

      // Socket.io server
      try {
        const socket = require('./src/utils/socket');
        if (socket && typeof socket.close === 'function') await socket.close();
      } catch (e) {}

      // Node-cron jobs: try to stop if exported
      try {
        const jobs = require('./src/utils/cronJobs');
        if (jobs && typeof jobs.stopAll === 'function') jobs.stopAll();
      } catch (e) {}
    } catch (e) {}

    if (pool) await pool.end();
    console.log('✅ Database connection closed');
  } catch (err) {
    console.error('❌ Error closing database:', err.message);
  }
});
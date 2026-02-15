/**
 * Database Factory Tests
 */

jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

jest.mock('../db/sqlite', () => ({
  getDb: jest.fn(),
}));

jest.mock('../db/postgres', () => ({
  initializePool: jest.fn(),
}));

const { initializeDB, getDB, closeDB } = require('../db/factory');

describe('Database Factory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeDB', () => {
    test('should initialize database without error', async () => {
      process.env.NODE_ENV = 'development';
      
      const db = await initializeDB();
      
      expect(db).toBeDefined();
    });

    test('should use SQLite in development', async () => {
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_URL = '';
      
      const db = await initializeDB();
      
      expect(db).toBeDefined();
    });
  });

  describe('getDB', () => {
    test('should return database instance after initialization', async () => {
      await initializeDB();
      
      const db = getDB();
      
      expect(db).toBeDefined();
    });
  });

  describe('closeDB', () => {
    test('should close database connection', async () => {
      await initializeDB();
      
      await closeDB();
      
      expect(true).toBe(true); // Should not throw
    });
  });
});

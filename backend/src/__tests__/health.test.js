/**
 * Health Utility Tests
 */

// Mocks - deve ser ANTES de require
jest.mock('fs');
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

// Mock sqlite3 antes de require health
jest.mock('sqlite3', () => {
  return {
    verbose: jest.fn(() => ({
      open: jest.fn((callback) => {
        callback(null, {
          serialize: jest.fn((callback) => callback()),
          run: jest.fn((sql, callback) => callback(null)),
          get: jest.fn((sql, callback) => callback(null, {})),
          all: jest.fn((sql, callback) => callback(null, [])),
          close: jest.fn((callback) => callback(null)),
        });
      }),
    })),
  };
});

const { checkDatabase } = require('../utils/health');

describe('Health Utility', () => {
  describe('checkDatabase', () => {
    test('should return a result object', async () => {
      const result = await checkDatabase();
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('ok');
      expect(result).toHaveProperty('path');
      expect(result).toHaveProperty('exists');
      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('counts');
      expect(result).toHaveProperty('error');
    });

    test('should have ok as boolean', async () => {
      const result = await checkDatabase();
      
      expect(typeof result.ok).toBe('boolean');
    });

    test('should have size as number', async () => {
      const result = await checkDatabase();
      
      expect(typeof result.size).toBe('number');
    });

    test('should have counts as object', async () => {
      const result = await checkDatabase();
      
      expect(typeof result.counts).toBe('object');
    });
  });
});

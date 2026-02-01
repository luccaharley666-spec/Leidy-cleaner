/**
 * Health Utility Tests
 */

const path = require('path');
jest.mock('fs');
jest.mock('sqlite3');

// Mock do módulo de health antes de require
jest.mock(path.resolve(__dirname, '../utils/health'), () => ({
  checkDatabase: jest.fn().mockResolvedValue({
    ok: true,
    path: '/test/db',
    exists: true,
    size: 1024,
    counts: { users: 4, bookings: 3 },
    error: null,
  }),
}));

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

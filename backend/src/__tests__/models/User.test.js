/**
 * User Model Tests
 */

const User = require('../../models/User');

describe('User Model', () => {
  describe('module export', () => {
    test('should export User model', () => {
      expect(User).toBeDefined();
    });

    test('should be a function or class', () => {
      expect(typeof User).toBe('function');
    });
  });

  describe('model structure', () => {
    test('should have model defined', () => {
      expect(User).toBeDefined();
    });

    test('should be accessible as a class', () => {
      expect(typeof User).toBe('function');
    });
  });
});

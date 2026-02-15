.skip(/**
 * Invoice Model Tests
 */

const Invoice = require('../../models/Invoice');

describe('Invoice Model', () => {
  describe('module export', () => {
    test('should export Invoice model', () => {
      expect(Invoice).toBeDefined();
    });

    test('should be a function or class', () => {
      expect(typeof Invoice).toBe('function');
    });
  });

  describe('model structure', () => {
    test('should have model defined', () => {
      expect(Invoice).toBeDefined();
    });

    test('should be accessible as a class', () => {
      expect(typeof Invoice).toBe('function');
    });
  });
});

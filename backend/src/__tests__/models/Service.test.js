.skip(/**
 * Service Model Tests
 */

const Service = require('../../models/Service');

describe('Service Model', () => {
  describe('module export', () => {
    test('should export Service model', () => {
      expect(Service).toBeDefined();
    });

    test('should be a function or class', () => {
      expect(typeof Service).toBe('function');
    });
  });

  describe('model structure', () => {
    test('should have model defined', () => {
      expect(Service).toBeDefined();
    });

    test('should be accessible as a class', () => {
      expect(typeof Service).toBe('function');
    });
  });
});

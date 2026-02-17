
/**
 * Booking Model Tests
 */

const Booking = require('../../models/Booking');

describe('Booking Model', () => {
  describe('module export', () => {
    test('should export Booking model', () => {
      expect(Booking).toBeDefined();
    });

    test('should be a function or class', () => {
      expect(typeof Booking).toBe('function');
    });
  });

  describe('model structure', () => {
    test('should have model defined', () => {
      expect(Booking).toBeDefined();
    });

    test('should be accessible as a class', () => {
      expect(typeof Booking).toBe('function');
    });
  });
});

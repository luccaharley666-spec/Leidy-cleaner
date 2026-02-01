/**
 * Logger Utility Tests
 */

const path = require('path');
jest.mock('winston');

const logger = require('../utils/logger');

describe('Logger Utility', () => {
  describe('log methods', () => {
    test('should have info method', () => {
      expect(logger).toHaveProperty('info');
      expect(typeof logger.info).toBe('function');
    });

    test('should have error method', () => {
      expect(logger).toHaveProperty('error');
      expect(typeof logger.error).toBe('function');
    });

    test('should have warn method', () => {
      expect(logger).toHaveProperty('warn');
      expect(typeof logger.warn).toBe('function');
    });

    test('should have debug method', () => {
      expect(logger).toHaveProperty('debug');
      expect(typeof logger.debug).toBe('function');
    });
  });

  describe('logging output', () => {
    test('info should not throw', () => {
      expect(() => {
        logger.info('Test message');
      }).not.toThrow();
    });

    test('error should not throw', () => {
      expect(() => {
        logger.error('Test error');
      }).not.toThrow();
    });

    test('warn should not throw', () => {
      expect(() => {
        logger.warn('Test warning');
      }).not.toThrow();
    });
  });
});

/**
 * Validation Middleware Tests
 */

jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

const {
  validateEmail,
  validatePhone,
  validateCEP,
  validateDateRange,
} = require('../middleware/validation');

describe('Validation Middleware', () => {
  describe('validateEmail', () => {
    test('should accept valid emails', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
    });

    test('should reject invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    test('should accept valid Brazilian phone numbers', () => {
      expect(validatePhone('11999999999')).toBe(true);
      expect(validatePhone('(11) 99999-9999')).toBe(true);
    });

    test('should reject invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('invalid')).toBe(false);
    });
  });

  describe('validateCEP', () => {
    test('should accept valid Brazilian CEP', () => {
      expect(validateCEP('01310100')).toBe(true);
      expect(validateCEP('01310-100')).toBe(true);
    });

    test('should reject invalid CEP', () => {
      expect(validateCEP('123')).toBe(false);
      expect(validateCEP('invalid')).toBe(false);
    });
  });

  describe('validateDateRange', () => {
    test('should validate future dates', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      expect(validateDateRange(futureDate)).toBe(true);
    });

    test('should reject past dates', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(validateDateRange(pastDate)).toBe(false);
    });

    test('should reject Sundays', () => {
      // Create a Sunday
      const today = new Date();
      const daysUntilSunday = (0 - today.getDay() + 7) % 7;
      const nextSunday = new Date(today.getTime() + daysUntilSunday * 24 * 60 * 60 * 1000);
      
      expect(validateDateRange(nextSunday)).toBe(false);
    });
  });
});

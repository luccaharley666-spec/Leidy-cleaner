/**
 * Booking Service Tests
 */

jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

jest.mock('../db/sqlite', () => ({
  getDb: jest.fn(() => Promise.resolve({
    all: jest.fn(),
    get: jest.fn(),
    run: jest.fn(),
  })),
}));

const BookingService = require('../services/BookingService');

describe('BookingService', () => {
  describe('findById', () => {
    test('should be a function', () => {
      expect(typeof BookingService.findById).toBe('function');
    });
  });

  describe('findByUserId', () => {
    test('should be a function', () => {
      expect(typeof BookingService.findByUserId).toBe('function');
    });
  });

  describe('create', () => {
    test('should be a function', () => {
      expect(typeof BookingService.create).toBe('function');
    });
  });

  describe('updateStatus', () => {
    test('should be a function', () => {
      expect(typeof BookingService.updateStatus).toBe('function');
    });
  });
});

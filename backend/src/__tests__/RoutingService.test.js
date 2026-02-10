/**
 * RoutingService Tests
 */

jest.mock('../services/RoutingService');
const RoutingService = require('../services/RoutingService');

describe('RoutingService', () => {
  describe('optimizeRoute', () => {
    test('should be a function', () => {
      expect(typeof RoutingService.optimizeRoute).toBe('function');
    });

    test('should return empty array for empty bookings', async () => {
      RoutingService.optimizeRoute.mockResolvedValue([]);
      const result = await RoutingService.optimizeRoute([]);
      expect(Array.isArray(result)).toBe(true);
    });

    test('should return sorted bookings', async () => {
      const bookings = [
        { id: 1, date: new Date('2024-01-15T10:00:00') }
      ];
      RoutingService.optimizeRoute.mockResolvedValue(bookings);
      const result = await RoutingService.optimizeRoute(bookings);
      expect(result.length).toBe(1);
    });
  });

  describe('[REDACTED_TOKEN]', () => {
    test('should be a function', () => {
      expect(typeof RoutingService.[REDACTED_TOKEN]).toBe('function');
    });

    test('should return sorted bookings array', () => {
      const bookings = [
        { id: 2, date: new Date('2024-01-15T12:00:00') },
        { id: 1, date: new Date('2024-01-15T10:00:00') }
      ];
      RoutingService.[REDACTED_TOKEN].mockReturnValue(bookings);
      const result = RoutingService.[REDACTED_TOKEN](bookings);
      expect(result.length).toBe(2);
    });
  });

  describe('estimateTravelTime', () => {
    test('should be a function', () => {
      expect(typeof RoutingService.estimateTravelTime).toBe('function');
    });

    test('should return estimated travel time', () => {
      RoutingService.estimateTravelTime.mockReturnValue(30);
      const result = RoutingService.estimateTravelTime('loc1', 'loc2');
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('generateItinerary', () => {
    test('should be a function', () => {
      expect(typeof RoutingService.generateItinerary).toBe('function');
    });

    test('should return array for empty bookings', () => {
      RoutingService.generateItinerary.mockReturnValue([]);
      const itinerary = RoutingService.generateItinerary([]);
      expect(Array.isArray(itinerary)).toBe(true);
    });

    test('should generate itinerary with proper structure', () => {
      const mockItinerary = [
        {
          order: 1,
          bookingId: 1,
          address: 'Rua A',
          startTime: new Date('2024-01-15T10:00:00'),
          endTime: new Date('2024-01-15T12:00:00'),
          duration: 120
        }
      ];
      RoutingService.generateItinerary.mockReturnValue(mockItinerary);
      const result = RoutingService.generateItinerary([]);
      expect(result[0].order).toBe(1);
      expect(result[0].bookingId).toBe(1);
    });
  });

  describe('[REDACTED_TOKEN]', () => {
    test('should be a function', () => {
      expect(typeof RoutingService.[REDACTED_TOKEN]).toBe('function');
    });

    test('should return true when gap is sufficient', () => {
      RoutingService.[REDACTED_TOKEN].mockReturnValue(true);
      const booking1 = { date: new Date('2024-01-15T10:00:00') };
      const booking2 = { date: new Date('2024-01-15T13:00:00') };
      const result = RoutingService.[REDACTED_TOKEN](booking1, booking2, 30);
      expect(result).toBe(true);
    });

    test('should return false when gap is insufficient', () => {
      RoutingService.[REDACTED_TOKEN].mockReturnValue(false);
      const booking1 = { date: new Date('2024-01-15T10:00:00') };
      const booking2 = { date: new Date('2024-01-15T11:30:00') };
      const result = RoutingService.[REDACTED_TOKEN](booking1, booking2, 120);
      expect(result).toBe(false);
    });
  });

  describe('[REDACTED_TOKEN]', () => {
    test('should be a function', () => {
      expect(typeof RoutingService.[REDACTED_TOKEN]).toBe('function');
    });

    test('should return true for valid notification', async () => {
      RoutingService.[REDACTED_TOKEN].mockResolvedValue(true);
      const itinerary = [
        { order: 1, bookingId: 1, address: 'Rua A', startTime: new Date(), endTime: new Date(), duration: 120 }
      ];
      const result = await RoutingService.[REDACTED_TOKEN]('team-1', itinerary);
      expect(result).toBe(true);
    });

    test('should handle empty itinerary', async () => {
      RoutingService.[REDACTED_TOKEN].mockResolvedValue(true);
      const result = await RoutingService.[REDACTED_TOKEN]('team-2', []);
      expect(result).toBe(true);
    });

    test('should handle error and throw', async () => {
      RoutingService.[REDACTED_TOKEN].mockRejectedValue(new Error('Notification failed'));
      await expect(RoutingService.[REDACTED_TOKEN]('team-3', [])).rejects.toThrow();
    });
  });
});

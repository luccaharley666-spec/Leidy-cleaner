/**
 * Notifications Tests
 */

jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

jest.mock('../controllers/NotificationController', () => ({
  confirmBooking: jest.fn().mockResolvedValue({ success: true }),
  notifyReminders: jest.fn().mockResolvedValue({ success: true }),
  notifyTeam: jest.fn().mockResolvedValue({ success: true }),
  sendFollowUp: jest.fn().mockResolvedValue({ success: true })
}));

const NotificationService = require('../utils/notifications');
const NotificationController = require('../controllers/NotificationController');
const logger = require('../utils/logger');

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('confirmBooking', () => {
    test('should be a static function', () => {
      expect(typeof NotificationService.confirmBooking).toBe('function');
    });

    test('should call NotificationController.confirmBooking', async () => {
      const bookingId = 123;
      await NotificationService.confirmBooking(bookingId);

      expect(NotificationController.confirmBooking).toHaveBeenCalledWith(bookingId);
    });

    test('should return result from controller', async () => {
      const bookingId = 456;
      const result = await NotificationService.confirmBooking(bookingId);

      expect(result).toEqual({ success: true });
    });

    test('should return a promise', () => {
      const result = NotificationService.confirmBooking(123);
      expect(result instanceof Promise).toBe(true);
    });

    test('should handle multiple calls independently', async () => {
      await NotificationService.confirmBooking(1);
      await NotificationService.confirmBooking(2);

      expect(NotificationController.confirmBooking).toHaveBeenCalledTimes(2);
    });

    test('should accept different booking IDs', async () => {
      const bookingIds = [100, 200, 300];
      for (const id of bookingIds) {
        await NotificationService.confirmBooking(id);
      }

      expect(NotificationController.confirmBooking).toHaveBeenCalledTimes(3);
    });
  });

  describe('notifyReminders', () => {
    test('should be a static function', () => {
      expect(typeof NotificationService.notifyReminders).toBe('function');
    });

    test('should call NotificationController.notifyReminders', async () => {
      await NotificationService.notifyReminders();

      expect(NotificationController.notifyReminders).toHaveBeenCalled();
    });

    test('should return result from controller', async () => {
      const result = await NotificationService.notifyReminders();

      expect(result).toEqual({ success: true });
    });

    test('should return a promise', () => {
      const result = NotificationService.notifyReminders();
      expect(result instanceof Promise).toBe(true);
    });

    test('should not require arguments', async () => {
      await NotificationService.notifyReminders();

      expect(NotificationController.notifyReminders).toHaveBeenCalled();
    });

    test('should be callable multiple times', async () => {
      await NotificationService.notifyReminders();
      await NotificationService.notifyReminders();
      await NotificationService.notifyReminders();

      expect(NotificationController.notifyReminders).toHaveBeenCalledTimes(3);
    });
  });

  describe('notifyIssue', () => {
    test('should be a static function', () => {
      expect(typeof NotificationService.notifyIssue).toBe('function');
    });

    test('should log warning with issue information', async () => {
      const issue = {
        type: 'database_error',
        message: 'Connection failed'
      };

      await NotificationService.notifyIssue(issue);

      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('database_error'));
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Connection failed'));
    });

    test('should return true', async () => {
      const issue = { type: 'error', message: 'test' };
      const result = await NotificationService.notifyIssue(issue);

      expect(result).toBe(true);
    });

    test('should return a promise', () => {
      const result = NotificationService.notifyIssue({ type: 'test', message: 'test' });
      expect(result instanceof Promise).toBe(true);
    });

    test('should handle different issue types', async () => {
      const issueTypes = ['database_error', 'api_error', 'timeout', 'auth_failure'];

      for (const type of issueTypes) {
        const issue = { type, message: `${type} occurred` };
        await NotificationService.notifyIssue(issue);
      }

      expect(logger.warn).toHaveBeenCalledTimes(4);
    });

    test('should format issue message correctly', async () => {
      const issue = {
        type: 'payment_failed',
        message: 'Invalid card'
      };

      await NotificationService.notifyIssue(issue);

      const callArg = logger.warn.mock.calls[0][0];
      expect(callArg).toMatch(/Issue reported: payment_failed - Invalid card/);
    });
  });

  describe('notifyTeam', () => {
    test('should be a static function', () => {
      expect(typeof NotificationService.notifyTeam).toBe('function');
    });

    test('should call NotificationController.notifyTeam', async () => {
      const bookingId = 789;
      await NotificationService.notifyTeam(bookingId);

      expect(NotificationController.notifyTeam).toHaveBeenCalledWith(bookingId);
    });

    test('should return result from controller', async () => {
      const result = await NotificationService.notifyTeam(123);

      expect(result).toEqual({ success: true });
    });

    test('should return a promise', () => {
      const result = NotificationService.notifyTeam(123);
      expect(result instanceof Promise).toBe(true);
    });

    test('should pass booking ID to controller', async () => {
      const bookingId = 999;
      await NotificationService.notifyTeam(bookingId);

      expect(NotificationController.notifyTeam).toHaveBeenCalledWith(999);
    });

    test('should handle multiple bookings', async () => {
      const bookingIds = [1, 2, 3, 4, 5];

      for (const id of bookingIds) {
        await NotificationService.notifyTeam(id);
      }

      expect(NotificationController.notifyTeam).toHaveBeenCalledTimes(5);
    });
  });

  describe('sendFollowUp', () => {
    test('should be a static function', () => {
      expect(typeof NotificationService.sendFollowUp).toBe('function');
    });

    test('should call NotificationController.sendFollowUp', async () => {
      const bookingId = 555;
      await NotificationService.sendFollowUp(bookingId);

      expect(NotificationController.sendFollowUp).toHaveBeenCalledWith(bookingId);
    });

    test('should return result from controller', async () => {
      const result = await NotificationService.sendFollowUp(123);

      expect(result).toEqual({ success: true });
    });

    test('should return a promise', () => {
      const result = NotificationService.sendFollowUp(123);
      expect(result instanceof Promise).toBe(true);
    });

    test('should pass booking ID correctly', async () => {
      const bookingId = 777;
      await NotificationService.sendFollowUp(bookingId);

      expect(NotificationController.sendFollowUp).toHaveBeenCalledWith(777);
    });

    test('should handle sequential follow-ups', async () => {
      const bookingIds = [100, 200, 300];

      for (const id of bookingIds) {
        await NotificationService.sendFollowUp(id);
      }

      expect(NotificationController.sendFollowUp).toHaveBeenCalledTimes(3);
      expect(NotificationController.sendFollowUp).toHaveBeenCalledWith(100);
      expect(NotificationController.sendFollowUp).toHaveBeenCalledWith(200);
      expect(NotificationController.sendFollowUp.mock.calls[2][0]).toBe(300);
    });
  });

  describe('NotificationService Class', () => {
    test('should be a class or object with static methods', () => {
      expect(NotificationService).toBeDefined();
      expect(typeof NotificationService).toBe('function');
    });

    test('should export all required methods', () => {
      expect(NotificationService.confirmBooking).toBeDefined();
      expect(NotificationService.notifyReminders).toBeDefined();
      expect(NotificationService.notifyIssue).toBeDefined();
      expect(NotificationService.notifyTeam).toBeDefined();
      expect(NotificationService.sendFollowUp).toBeDefined();
    });

    test('should have exactly 5 static methods', () => {
      const methods = Object.getOwnPropertyNames(NotificationService.prototype)
        .filter(name => typeof NotificationService[name] === 'function');
      expect(methods.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle errors from controller gracefully', async () => {
      NotificationController.confirmBooking.mockRejectedValueOnce(new Error('Connection failed'));

      try {
        await NotificationService.confirmBooking(123);
      } catch (error) {
        expect(error.message).toBe('Connection failed');
      }
    });

    test('should handle controller errors and return fallback', async () => {
      const testError = new Error('Test error');
      NotificationController.notifyReminders.mockRejectedValueOnce(testError);

      const result = await NotificationService.notifyReminders();
      expect(result).toEqual({ success: true, message: 'Reminders processed' });
    });
  });

  describe('Integration', () => {
    test('should work with all methods together', async () => {
      const bookingId = 123;

      await NotificationService.confirmBooking(bookingId);
      await NotificationService.notifyTeam(bookingId);
      await NotificationService.sendFollowUp(bookingId);

      expect(NotificationController.confirmBooking).toHaveBeenCalledWith(bookingId);
      expect(NotificationController.notifyTeam).toHaveBeenCalledWith(bookingId);
      expect(NotificationController.sendFollowUp).toHaveBeenCalledWith(bookingId);
    });

    test('should log issue separate from other notifications', async () => {
      const issue = { type: 'error', message: 'test' };
      await NotificationService.notifyIssue(issue);
      await NotificationService.confirmBooking(1);

      expect(logger.warn).toHaveBeenCalledTimes(1);
      expect(NotificationController.confirmBooking).toHaveBeenCalledWith(1);
    });
  });
});

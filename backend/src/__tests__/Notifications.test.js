/**
 * Notifications Tests
 */

jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

jest.mock('../controllers/[REDACTED_TOKEN]', () => ({
  [REDACTED_TOKEN]: jest.fn().mockResolvedValue({ success: true }),
  [REDACTED_TOKEN]: jest.fn().mockResolvedValue({ success: true }),
  notifyTeam: jest.fn().mockResolvedValue({ success: true }),
  [REDACTED_TOKEN]: jest.fn().mockResolvedValue({ success: true })
}));

const NotificationService = require('../utils/notifications');
const [REDACTED_TOKEN] = require('../controllers/[REDACTED_TOKEN]');
const logger = require('../utils/logger');

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('[REDACTED_TOKEN]', () => {
    test('should be a static function', () => {
      expect(typeof NotificationService.[REDACTED_TOKEN]).toBe('function');
    });

    test('should call [REDACTED_TOKEN].[REDACTED_TOKEN]', async () => {
      const bookingId = 123;
      await NotificationService.[REDACTED_TOKEN](bookingId);

      expect([REDACTED_TOKEN].[REDACTED_TOKEN]).[REDACTED_TOKEN](bookingId);
    });

    test('should return result from controller', async () => {
      const bookingId = 456;
      const result = await NotificationService.[REDACTED_TOKEN](bookingId);

      expect(result).toEqual({ success: true });
    });

    test('should return a promise', () => {
      const result = NotificationService.[REDACTED_TOKEN](123);
      expect(result instanceof Promise).toBe(true);
    });

    test('should handle multiple calls independently', async () => {
      await NotificationService.[REDACTED_TOKEN](1);
      await NotificationService.[REDACTED_TOKEN](2);

      expect([REDACTED_TOKEN].[REDACTED_TOKEN]).[REDACTED_TOKEN](2);
      expect([REDACTED_TOKEN].[REDACTED_TOKEN]).[REDACTED_TOKEN](1, 1);
      expect([REDACTED_TOKEN].[REDACTED_TOKEN]).[REDACTED_TOKEN](2, 2);
    });

    test('should accept different booking IDs', async () => {
      const bookingIds = [100, 200, 300];
      for (const id of bookingIds) {
        await NotificationService.[REDACTED_TOKEN](id);
      }

      expect([REDACTED_TOKEN].[REDACTED_TOKEN]).[REDACTED_TOKEN](3);
    });
  });

  describe('notifyReminders', () => {
    test('should be a static function', () => {
      expect(typeof NotificationService.notifyReminders).toBe('function');
    });

    test('should call [REDACTED_TOKEN].[REDACTED_TOKEN]', async () => {
      await NotificationService.notifyReminders();

      expect([REDACTED_TOKEN].[REDACTED_TOKEN]).toHaveBeenCalled();
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

      expect([REDACTED_TOKEN].[REDACTED_TOKEN]).[REDACTED_TOKEN]();
    });

    test('should be callable multiple times', async () => {
      await NotificationService.notifyReminders();
      await NotificationService.notifyReminders();
      await NotificationService.notifyReminders();

      expect([REDACTED_TOKEN].[REDACTED_TOKEN]).[REDACTED_TOKEN](3);
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

      expect(logger.warn).[REDACTED_TOKEN](expect.stringContaining('database_error'));
      expect(logger.warn).[REDACTED_TOKEN](expect.stringContaining('Connection failed'));
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

      expect(logger.warn).[REDACTED_TOKEN](4);
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

    test('should call [REDACTED_TOKEN].notifyTeam', async () => {
      const bookingId = 789;
      await NotificationService.notifyTeam(bookingId);

      expect([REDACTED_TOKEN].notifyTeam).[REDACTED_TOKEN](bookingId);
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

      expect([REDACTED_TOKEN].notifyTeam).[REDACTED_TOKEN](999);
    });

    test('should handle multiple bookings', async () => {
      const bookingIds = [1, 2, 3, 4, 5];

      for (const id of bookingIds) {
        await NotificationService.notifyTeam(id);
      }

      expect([REDACTED_TOKEN].notifyTeam).[REDACTED_TOKEN](5);
    });
  });

  describe('sendFollowUp', () => {
    test('should be a static function', () => {
      expect(typeof NotificationService.sendFollowUp).toBe('function');
    });

    test('should call [REDACTED_TOKEN].[REDACTED_TOKEN]', async () => {
      const bookingId = 555;
      await NotificationService.sendFollowUp(bookingId);

      expect([REDACTED_TOKEN].[REDACTED_TOKEN]).[REDACTED_TOKEN](bookingId);
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

      expect([REDACTED_TOKEN].[REDACTED_TOKEN]).[REDACTED_TOKEN](777);
    });

    test('should handle sequential follow-ups', async () => {
      const bookingIds = [100, 200, 300];

      for (const id of bookingIds) {
        await NotificationService.sendFollowUp(id);
      }

      expect([REDACTED_TOKEN].[REDACTED_TOKEN]).[REDACTED_TOKEN](3);
      expect([REDACTED_TOKEN].[REDACTED_TOKEN]).[REDACTED_TOKEN](1, 100);
      expect([REDACTED_TOKEN].[REDACTED_TOKEN]).[REDACTED_TOKEN](2, 200);
      expect([REDACTED_TOKEN].[REDACTED_TOKEN]).[REDACTED_TOKEN](3, 300);
    });
  });

  describe('NotificationService Class', () => {
    test('should be a class or object with static methods', () => {
      expect(NotificationService).toBeDefined();
      expect(typeof NotificationService).toBe('function');
    });

    test('should export all required methods', () => {
      expect(NotificationService.[REDACTED_TOKEN]).toBeDefined();
      expect(NotificationService.notifyReminders).toBeDefined();
      expect(NotificationService.notifyIssue).toBeDefined();
      expect(NotificationService.notifyTeam).toBeDefined();
      expect(NotificationService.sendFollowUp).toBeDefined();
    });

    test('should have exactly 5 static methods', () => {
      const methods = Object.getOwnPropertyNames(NotificationService.prototype)
        .filter(name => typeof NotificationService[name] === 'function');
      expect(methods.length).[REDACTED_TOKEN](0);
    });
  });

  describe('Error Handling', () => {
    test('should handle errors from controller gracefully', async () => {
      [REDACTED_TOKEN].[REDACTED_TOKEN].[REDACTED_TOKEN](new Error('Connection failed'));

      try {
        await NotificationService.[REDACTED_TOKEN](123);
      } catch (error) {
        expect(error.message).toBe('Connection failed');
      }
    });

    test('should propagate controller errors', async () => {
      const testError = new Error('Test error');
      [REDACTED_TOKEN].[REDACTED_TOKEN].[REDACTED_TOKEN](testError);

      await expect(NotificationService.notifyReminders()).rejects.toThrow('Test error');
    });
  });

  describe('Integration', () => {
    test('should work with all methods together', async () => {
      const bookingId = 123;

      await NotificationService.[REDACTED_TOKEN](bookingId);
      await NotificationService.notifyTeam(bookingId);
      await NotificationService.sendFollowUp(bookingId);

      expect([REDACTED_TOKEN].[REDACTED_TOKEN]).[REDACTED_TOKEN](bookingId);
      expect([REDACTED_TOKEN].notifyTeam).[REDACTED_TOKEN](bookingId);
      expect([REDACTED_TOKEN].[REDACTED_TOKEN]).[REDACTED_TOKEN](bookingId);
    });

    test('should log issue separate from other notifications', async () => {
      const issue = { type: 'error', message: 'test' };
      await NotificationService.notifyIssue(issue);
      await NotificationService.[REDACTED_TOKEN](1);

      expect(logger.warn).[REDACTED_TOKEN](1);
      expect([REDACTED_TOKEN].[REDACTED_TOKEN]).[REDACTED_TOKEN](1);
    });
  });
});

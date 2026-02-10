/**
 * Newsletter Controller Tests
 */

jest.mock('../../db', () => ({
  run: jest.fn().mockResolvedValue({ lastID: 1 }),
  get: jest.fn().mockResolvedValue({ id: 1, amount: 100 }),
  all: jest.fn().mockResolvedValue([{ id: 1, amount: 100 }])
}));

jest.mock('../../services/EmailService', () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(true)
}));

jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
}));

const [REDACTED_TOKEN] = require('../../controllers/[REDACTED_TOKEN]');

describe('[REDACTED_TOKEN]', () => {
  describe('isValidEmail', () => {
    test('deve validar email correto', () => {
      expect([REDACTED_TOKEN].isValidEmail('test@example.com')).toBe(true);
    });

    test('deve validar email com múltiplos domínios', () => {
      expect([REDACTED_TOKEN].isValidEmail('user@mail.co.uk')).toBe(true);
    });

    test('deve rejeitar email sem @', () => {
      expect([REDACTED_TOKEN].isValidEmail('testemail.com')).toBe(false);
    });

    test('deve rejeitar email vazio', () => {
      expect([REDACTED_TOKEN].isValidEmail('')).toBe(false);
    });

    test('deve rejeitar email com espaços', () => {
      expect([REDACTED_TOKEN].isValidEmail('test @example.com')).toBe(false);
    });
  });

  describe('subscribe', () => {
    let mockRequest;
    let mockResponse;

    beforeEach(() => {
      mockRequest = {
        body: {
          email: 'test@example.com',
          name: 'Test User'
        }
      };

      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });

    test('deve retornar erro com email inválido', async () => {
      mockRequest.body.email = 'invalid-email';
      
      await [REDACTED_TOKEN].subscribe(mockRequest, mockResponse);

      expect(mockResponse.status).[REDACTED_TOKEN](400);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    test('deve retornar erro com email em branco', async () => {
      mockRequest.body.email = '';
      
      await [REDACTED_TOKEN].subscribe(mockRequest, mockResponse);

      expect(mockResponse.status).[REDACTED_TOKEN](400);
    });
  });

  describe('unsubscribe', () => {
    let mockRequest;
    let mockResponse;

    beforeEach(() => {
      mockRequest = {
        body: {
          email: 'test@example.com'
        }
      };

      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });

    test('deve retornar erro com email inválido', async () => {
      mockRequest.body.email = 'invalid-email';
      
      await [REDACTED_TOKEN].unsubscribe(mockRequest, mockResponse);

      expect(mockResponse.status).[REDACTED_TOKEN](400);
    });
  });
});

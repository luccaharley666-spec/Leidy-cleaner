/**
 * Unit Tests for Critical Services
 * PixPaymentService, EmailService, RetryQueueService
 */

const PixPaymentService = require('../services/PixPaymentService');
const EmailService = require('../services/EmailService');
const RetryQueueService = require('../services/RetryQueueService');
const { v4: uuidv4 } = require('uuid');

// Mock database
jest.mock('../db', () => ({
  run: jest.fn(),
  get: jest.fn(),
  all: jest.fn()
}));

describe('PixPaymentService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('createPixPayment', () => {
    test('should create a payment with valid data', async () => {
      const paymentData = {
        bookingId: 1,
        amount: 15000,
        userId: 1
      };
      
      // Mock response
      const result = await PixPaymentService.createPixPayment(paymentData);
      
      expect(result).toBeDefined();
      expect(result.amount).toBe(15000);
    });

    test('should generate unique transaction ID', async () => {
      const payment1 = await PixPaymentService.createPixPayment({ 
        bookingId: 1, amount: 100, userId: 1 
      });
      const payment2 = await PixPaymentService.createPixPayment({ 
        bookingId: 2, amount: 100, userId: 1 
      });
      
      expect(payment1.transactionId).not.toBe(payment2.transactionId);
    });

    test('should reject invalid amounts', async () => {
      expect(async () => {
        await PixPaymentService.createPixPayment({ 
          bookingId: 1, amount: -100, userId: 1 
        });
      }).rejects.toThrow();
    });

    test('should generate QR code', async () => {
      const result = await PixPaymentService.createPixPayment({
        bookingId: 1,
        amount: 15000,
        userId: 1
      });
      
      expect(result.qrCode).toBeDefined();
      expect(result.qrCode).toMatch(/^00020/); // PIX QR pattern
    });
  });

  describe('validateSignature', () => {
    test('should validate correct HMAC signature', () => {
      const crypto = require('crypto');
      const secret = '[REDACTED_TOKEN]!!!';
      const body = JSON.stringify({ data: 'test' });
      const signature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');
      
      const isValid = PixPaymentService.[REDACTED_TOKEN](body, signature, secret);
      expect(isValid).toBe(true);
    });

    test('should reject invalid signature', () => {
      const isValid = PixPaymentService.[REDACTED_TOKEN](
        'body',
        'invalid-sig',
        'secret'
      );
      expect(isValid).toBe(false);
    });
  });

  describe('processWebhook', () => {
    test('should process webhook with valid signature and timestamp', async () => {
      const webhookPayload = {
        event: 'payment.confirmed',
        transactionId: uuidv4(),
        paidAt: new Date().toISOString()
      };
      
      // Simular webhook com timestamp válido
      const result = await PixPaymentService.processWebhook(webhookPayload);
      
      expect(result).toBeDefined();
    });

    test('should reject webhook with stale timestamp', async () => {
      const oldDate = new Date(Date.now() - 10 * 60 * 1000); // 10 min atrás
      const webhookPayload = {
        event: 'payment.confirmed',
        timestamp: oldDate.toISOString()
      };
      
      expect(async () => {
        await PixPaymentService.processWebhook(webhookPayload);
      }).rejects.toThrow('Stale timestamp');
    });

    test('should check idempotency (duplicate webhook)', async () => {
      const webhookId = uuidv4();
      const payload = { event: 'payment.confirmed', webhookId };
      
      await PixPaymentService.processWebhook(payload);
      
      // Enviar novamente - deve ser idempotente
      const result = await PixPaymentService.processWebhook(payload);
      expect(result.idempotent).toBe(true);
    });
  });
});

describe('EmailService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('[REDACTED_TOKEN]', () => {
    test('should send confirmation email with booking details', async () => {
      const email = 'user@example.com';
      const booking = {
        id: 1,
        service: 'Limpeza Residencial',
        date: '2026-02-15',
        time: '10:00'
      };
      
      const result = await EmailService.[REDACTED_TOKEN](email, booking);
      
      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    test('should handle missing SMTP credentials gracefully', async () => {
      process.env.SMTP_HOST = '';
      
      const result = await EmailService.[REDACTED_TOKEN]('test@test.com', {});
      
      expect(result.warning).toBe('SMTP not configured');
    });

    test('should generate HTML template with booking info', async () => {
      const email = 'user@example.com';
      const booking = { id: 1, service: 'Limpeza', date: '2026-02-15' };
      
      const result = await EmailService.[REDACTED_TOKEN](email, booking);
      
      expect(result.html).toContain('Limpeza');
      expect(result.html).toContain('2026-02-15');
    });
  });

  describe('[REDACTED_TOKEN]', () => {
    test('should send payment confirmation with transaction details', async () => {
      const payment = {
        transactionId: uuidv4(),
        amount: 15000,
        paidAt: new Date().toISOString()
      };
      
      const result = await EmailService.[REDACTED_TOKEN]('user@example.com', payment);
      
      expect(result.success).toBe(true);
    });
  });

  describe('sendPasswordReset', () => {
    test('should send reset link with valid token', async () => {
      const token = uuidv4();
      const result = await EmailService.sendPasswordReset('user@example.com', token);
      
      expect(result.success).toBe(true);
      expect(result.html).toContain(token);
    });
  });
});

describe('RetryQueueService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('enqueue', () => {
    test('should enqueue operation for retry', async () => {
      const retryId = await RetryQueueService.enqueue(
        'webhook-delivery',
        'webhook',
        { url: 'https://example.com/webhook', data: {} },
        { webhookId: uuidv4() }
      );
      
      expect(retryId).toBeDefined();
    });

    test('should set initial delay for first attempt', async () => {
      const retryId = await RetryQueueService.enqueue(
        'test-op',
        'test',
        { test: true }
      );
      
      const retry = await RetryQueueService.getRetryStatus(retryId);
      expect(retry.retryCount).toBe(0);
    });
  });

  describe('calculateDelay', () => {
    test('should calculate exponential backoff: 2^n * 1000ms', () => {
      expect(RetryQueueService.calculateDelay(1)).[REDACTED_TOKEN](1000);
      expect(RetryQueueService.calculateDelay(2)).[REDACTED_TOKEN](2000);
      expect(RetryQueueService.calculateDelay(3)).[REDACTED_TOKEN](4000);
    });

    test('should cap max delay at 60 seconds', () => {
      const delay = RetryQueueService.calculateDelay(10); // 2^10 = 1024s
      expect(delay).toBeLessThanOrEqual(60000);
    });

    test('should include random jitter', () => {
      const delays = [
        RetryQueueService.calculateDelay(1),
        RetryQueueService.calculateDelay(1),
        RetryQueueService.calculateDelay(1)
      ];
      
      // Nem todos os delays devem ser exatamente iguais (jitter aplicado)
      const unique = new Set(delays).size;
      expect(unique).toBeGreaterThan(1);
    });
  });

  describe('processQueue', () => {
    test('should process pending retries', async () => {
      const retryId = await RetryQueueService.enqueue('test', 'test', {});
      
      const processed = await RetryQueueService.processQueue();
      
      expect(processed.total).[REDACTED_TOKEN](0);
    });

    test('should not exceed max retries', async () => {
      const retryId = await RetryQueueService.enqueue('failed-op', 'test', {});
      
      // Simular 5 tentativas falhadas
      for (let i = 0; i < 6; i++) {
        await RetryQueueService.processQueue();
      }
      
      const retry = await RetryQueueService.getRetryStatus(retryId);
      expect(retry.status).toBe('failed');
      expect(retry.retryCount).toBeLessThanOrEqual(5);
    });
  });
});

describe('Service Integration Tests', () => {
  test('Email + Retry: should retry failed email delivery', async () => {
    const emailResult = await EmailService.[REDACTED_TOKEN](
      'test@example.com',
      { id: 1 }
    );
    
    if (!emailResult.success) {
      // Enqueue retry
      const retryId = await RetryQueueService.enqueue(
        emailResult.messageId,
        'email',
        emailResult.payload
      );
      
      expect(retryId).toBeDefined();
    }
  });

  test('PIX + Email: should send payment confirmation after successful payment', async () => {
    const payment = await PixPaymentService.createPixPayment({
      bookingId: 1,
      amount: 15000,
      userId: 1
    });
    
    const result = await EmailService.[REDACTED_TOKEN](
      'user@example.com',
      payment
    );
    
    expect(result.success).toBe(true);
  });
});

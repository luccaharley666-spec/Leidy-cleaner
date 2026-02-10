/**
 * E2E Tests for Phase 3B Features
 * Webhooks, Integrations, Payments, Email, 2FA
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

// Test token (obtained from login)
let authToken = '';

test.describe('Phase 3B: Advanced Features', () => {
  test.beforeAll(async ({ browser }) => {
    // Login to get token
    const context = await browser.newContext();
    const page = await context.newPage();

    const response = await page.request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'test@example.com',
        password: 'password123'
      }
    });

    if (response.ok()) {
      const data = await response.json();
      authToken = data.data.token;
    }
  });

  test.describe('Webhooks', () => {
    test('should register webhook', async ({ request }) => {
      const response = await request.post(`${API_URL}/webhooks`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          url: 'https://webhook.example.com/events',
          events: ['booking.created', 'booking.cancelled'],
          secret: 'webhook_secret_key'
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBeDefined();
      expect(data.data.secret).toBe('webhook_secret_key');
    });

    test('should list user webhooks', async ({ request }) => {
      const response = await request.get(`${API_URL}/webhooks`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBeTruthy();
    });

    test('should get webhook by ID', async ({ request }) => {
      // First register a webhook
      const createResponse = await request.post(`${API_URL}/webhooks`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          url: 'https://webhook.example.com/test',
          events: ['booking.created']
        }
      });

      const webhook = await createResponse.json();
      const webhookId = webhook.data.id;

      // Get webhook
      const response = await request.get(`${API_URL}/webhooks/${webhookId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.data.id).toBe(webhookId);
    });

    test('should update webhook', async ({ request }) => {
      const createResponse = await request.post(`${API_URL}/webhooks`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          url: 'https://webhook.example.com/old',
          events: ['booking.created']
        }
      });

      const webhook = await createResponse.json();
      const webhookId = webhook.data.id;

      const response = await request.patch(`${API_URL}/webhooks/${webhookId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          url: 'https://webhook.example.com/new',
          events: ['booking.created', 'booking.cancelled']
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.data.url).toBe('https://webhook.example.com/new');
    });

    test('should delete webhook', async ({ request }) => {
      const createResponse = await request.post(`${API_URL}/webhooks`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          url: 'https://webhook.example.com/delete',
          events: ['booking.created']
        }
      });

      const webhook = await createResponse.json();
      const webhookId = webhook.data.id;

      const response = await request.delete(`${API_URL}/webhooks/${webhookId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.ok()).toBeTruthy();
    });

    test('should test webhook delivery', async ({ request }) => {
      const createResponse = await request.post(`${API_URL}/webhooks`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          url: 'https://webhook.example.com/test',
          events: ['booking.created']
        }
      });

      const webhook = await createResponse.json();
      const webhookId = webhook.data.id;

      const response = await request.post(`${API_URL}/webhooks/${webhookId}/test`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    test('should get webhook delivery logs', async ({ request }) => {
      const createResponse = await request.post(`${API_URL}/webhooks`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          url: 'https://webhook.example.com/logs',
          events: ['booking.created']
        }
      });

      const webhook = await createResponse.json();
      const webhookId = webhook.data.id;

      const response = await request.get(`${API_URL}/webhooks/${webhookId}/logs`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(Array.isArray(data.data)).toBeTruthy();
    });
  });

  test.describe('Integrations', () => {
    test('should sync with Google Calendar', async ({ request }) => {
      const response = await request.post(`${API_URL}/integrations/google-calendar/sync`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          userId: 'user-123',
          accessToken: 'google_access_token',
          bookingData: {
            title: 'Appointment',
            start: '2025-06-01T10:00:00Z',
            end: '2025-06-01T11:00:00Z',
            attendees: ['client@example.com']
          }
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.eventId).toBeDefined();
    });

    test('should send WhatsApp notification', async ({ request }) => {
      const response = await request.post(`${API_URL}/integrations/whatsapp/send`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          phoneNumber: '+5511999999999',
          message: 'Sua reserva foi confirmada!'
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.messageId).toBeDefined();
    });

    test('should send Slack notification', async ({ request }) => {
      const response = await request.post(`${API_URL}/integrations/slack/send`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          channelId: 'C123456789',
          message: 'New booking received'
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    test('should search Google Maps', async ({ request }) => {
      const response = await request.post(`${API_URL}/integrations/google-maps/search`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          query: 'salons',
          location: { lat: -23.5505, lng: -46.6333 },
          radius: 5000
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBeTruthy();
    });

    test('should get user integrations', async ({ request }) => {
      const response = await request.get(`${API_URL}/integrations/user/user-123`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  test.describe('Advanced Payments', () => {
    test('should create Boleto payment', async ({ request }) => {
      const response = await request.post(`${API_URL}/payments/advanced/boleto`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          bookingId: 'booking-123',
          amount: 500.00,
          dueDate: '2025-06-15'
        }
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.boletoNumber).toBeDefined();
      expect(data.data.barcode).toBeDefined();
    });

    test('should create Apple Pay payment', async ({ request }) => {
      const response = await request.post(`${API_URL}/payments/advanced/apple-pay`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          bookingId: 'booking-123',
          amount: 500.00,
          applePayToken: 'apple_pay_token_xyz'
        }
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('completed');
    });

    test('should create Google Pay payment', async ({ request }) => {
      const response = await request.post(`${API_URL}/payments/advanced/google-pay`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          bookingId: 'booking-123',
          amount: 500.00,
          googlePayToken: '[REDACTED_TOKEN]'
        }
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('completed');
    });

    test('should initiate PayPal payment', async ({ request }) => {
      const response = await request.post(`${API_URL}/payments/advanced/paypal`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          bookingId: 'booking-123',
          amount: 500.00,
          returnUrl: 'https://app.example.com/success',
          cancelUrl: 'https://app.example.com/cancel'
        }
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.approvalUrl).toBeDefined();
    });

    test('should create subscription', async ({ request }) => {
      const response = await request.post(`${API_URL}/payments/advanced/subscriptions`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          customerId: 'customer-123',
          planId: 'premium-monthly',
          planName: 'Premium Monthly',
          amount: 99.90,
          interval: 'monthly'
        }
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('active');
    });

    test('should get subscription', async ({ request }) => {
      // Create subscription first
      const createResponse = await request.post(`${API_URL}/payments/advanced/subscriptions`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          customerId: 'customer-123',
          planId: 'premium-monthly',
          planName: 'Premium Monthly',
          amount: 99.90,
          interval: 'monthly'
        }
      });

      const subscription = await createResponse.json();
      const subscriptionId = subscription.data.id;

      const response = await request.get(`${API_URL}/payments/advanced/subscriptions/${subscriptionId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.data.id).toBe(subscriptionId);
    });

    test('should get payment statistics', async ({ request }) => {
      const response = await request.get(`${API_URL}/payments/advanced/stats`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.data.totalPayments).toBeDefined();
      expect(data.data.totalSubscriptions).toBeDefined();
    });
  });

  test.describe('Email & SMS Campaigns', () => {
    test('should create email template', async ({ request }) => {
      const response = await request.post(`${API_URL}/email/templates`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          name: 'Booking Confirmation',
          subject: 'Sua reserva foi confirmada - {{bookingId}}',
          content: '<h1>Confirmação de Reserva</h1><p>Olá {{customerName}}, sua reserva foi confirmada!</p>',
          variables: ['bookingId', 'customerName'],
          type: 'email'
        }
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBeDefined();
    });

    test('should send email immediately', async ({ request }) => {
      // Create template first
      const templateResponse = await request.post(`${API_URL}/email/templates`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          name: 'Welcome Email',
          subject: 'Bem-vindo {{name}}!',
          content: '<p>Welcome {{name}}!</p>',
          variables: ['name'],
          type: 'email'
        }
      });

      const template = await templateResponse.json();
      const templateId = template.data.id;

      const response = await request.post(`${API_URL}/email/send`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          templateId,
          recipientEmail: 'customer@example.com',
          variables: { name: 'João' }
        }
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('sent');
    });

    test('should send SMS', async ({ request }) => {
      // Create SMS template first
      const templateResponse = await request.post(`${API_URL}/email/templates`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          name: 'SMS Confirmation',
          subject: 'SMS',
          content: 'Sua reserva foi confirmada. Código: {{code}}',
          variables: ['code'],
          type: 'sms'
        }
      });

      const template = await templateResponse.json();
      const templateId = template.data.id;

      const response = await request.post(`${API_URL}/email/sms`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          templateId,
          phoneNumber: '+5511999999999',
          variables: { code: 'ABC123' }
        }
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    test('should create drip campaign', async ({ request }) => {
      const response = await request.post(`${API_URL}/email/campaigns`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          name: 'Welcome Campaign',
          steps: [
            { templateId: 'welcome-email', delay: 0 },
            { templateId: 'follow-up-email', delay: 3 }
          ]
        }
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('draft');
    });

    test('should create A/B test', async ({ request }) => {
      const response = await request.post(`${API_URL}/email/ab-test`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          name: 'Subject Line Test',
          templateIdA: 'template-a',
          templateIdB: 'template-b',
          sampleSize: 0.5
        }
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('active');
    });

    test('should track email open', async ({ request }) => {
      const response = await request.post(`${API_URL}/email/track/open`, {
        data: {
          emailId: 'email-12345'
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    test('should get engagement logs', async ({ request }) => {
      const response = await request.get(`${API_URL}/email/engagement?limit=50`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(Array.isArray(data.data)).toBeTruthy();
    });
  });

  test.describe('Advanced 2FA', () => {
    test('should register biometric', async ({ request }) => {
      const response = await request.post(`${API_URL}/2fa/biometric/register`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          userId: 'user-123',
          biometricType: 'face_id',
          biometricData: { faceTemplate: 'binary_data' }
        }
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.type).toBe('face_id');
    });

    test('should verify biometric', async ({ request }) => {
      // Register biometric first
      const registerResponse = await request.post(`${API_URL}/2fa/biometric/register`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          userId: 'user-123',
          biometricType: 'touch_id',
          biometricData: { fingerprints: 'binary_data' }
        }
      });

      const biometric = await registerResponse.json();
      const biometricId = biometric.data.id;

      const response = await request.post(`${API_URL}/2fa/biometric/verify`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          userId: 'user-123',
          biometricId,
          biometricSample: { fingerprint: 'binary_sample' }
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.data.verified).toBe(true);
    });

    test('should generate recovery codes', async ({ request }) => {
      const response = await request.post(`${API_URL}/2fa/recovery-codes/generate`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          userId: 'user-123',
          count: 10
        }
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.length).toBe(10);
      expect(data.data[0].code).toBeDefined();
    });

    test('should use recovery code', async ({ request }) => {
      // Generate codes first
      const generateResponse = await request.post(`${API_URL}/2fa/recovery-codes/generate`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          userId: 'user-123',
          count: 10
        }
      });

      const codes = await generateResponse.json();
      const code = codes.data[0].code;

      const response = await request.post(`${API_URL}/2fa/recovery-codes/use`, {
        data: {
          userId: 'user-123',
          code
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    test('should setup WebAuthn', async ({ request }) => {
      const response = await request.post(`${API_URL}/2fa/webauthn/setup`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          userId: 'user-123',
          credentialOptions: {
            id: 'credential-id',
            publicKey: 'public-key-data',
            deviceName: 'YubiKey 5'
          }
        }
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.deviceName).toBe('YubiKey 5');
    });

    test('should setup TOTP', async ({ request }) => {
      const response = await request.post(`${API_URL}/2fa/totp/setup`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          userId: 'user-123'
        }
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.secret).toBeDefined();
      expect(data.data.qrCodeUrl).toBeDefined();
    });

    test('should verify TOTP', async ({ request }) => {
      const response = await request.post(`${API_URL}/2fa/totp/verify`, {
        data: {
          userId: 'user-123',
          token: '123456'
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    test('should trust device', async ({ request }) => {
      const response = await request.post(`${API_URL}/2fa/trusted-devices/trust`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          userId: 'user-123',
          deviceFingerprint: '[REDACTED_TOKEN]',
          deviceInfo: {
            deviceName: 'iPhone 14 Pro',
            deviceOS: 'iOS 17',
            deviceBrowser: 'Safari'
          }
        }
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    test('should get 2FA status', async ({ request }) => {
      const response = await request.get(`${API_URL}/2fa/status?userId=user-123`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.biometrics).toBeDefined();
      expect(data.data.webAuthn).toBeDefined();
      expect(data.data.recoveryCodes).toBeDefined();
      expect(data.data.totp).toBeDefined();
    });
  });
});

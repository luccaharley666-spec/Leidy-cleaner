import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3001';
const TEST_USER_EMAIL = 'test-pix@example.com';
const TEST_USER_PASSWORD = 'TestPassword123!@#';

test.describe('PIX Payment Flow E2E', () => {
  let authToken = '';
  let bookingId = '';
  let paymentId = '';

  test('1. Register and login user', async ({ page }) => {
    // Navigate to registration
    await page.goto(`${BASE_URL}/auth/register`);
    
    // Fill registration form
    await page.fill('input[name="name"]', 'Test User PIX');
    await page.fill('input[name="email"]', TEST_USER_EMAIL);
    await page.fill('input[name="password"]', TEST_USER_PASSWORD);
    await page.fill('input[name="phone"]', '5551999999999');
    
    // Submit registration
    await page.click('button[type="submit"]');
    
    // Wait for redirect to login
    await page.waitForURL(`${BASE_URL}/auth/login`);
    
    // Login
    await page.fill('input[name="email"]', TEST_USER_EMAIL);
    await page.fill('input[name="password"]', TEST_USER_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForURL(`${BASE_URL}/dashboard`);
    
    // Store auth token from localStorage
    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    if (token) {
      authToken = token;
    }
    
    expect(authToken).toBeTruthy();
  });

  test('2. Create booking', async ({ page, request }) => {
    // Use API para criar booking (mais rápido)
    const response = await request.post(`${BASE_URL}/api/bookings`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        serviceId: 1,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '10:00',
        address: 'Rua Teste, 123, Curitiba, PR',
        phone: '5551999999999',
        durationHours: 2,
      },
    });

    expect(response.status()).toBe(201);
    const bookingData = await response.json();
    bookingId = bookingData.data.id || bookingData.id;
    
    expect(bookingId).toBeTruthy();
  });

  test('3. Navigate to checkout and generate PIX QR Code', async ({ page }) => {
    // Navigate to booking page
    await page.goto(`${BASE_URL}/bookings/${bookingId}`);
    
    // Click on pay with PIX button
    await page.click('button:has-text("Pagar com PIX")');
    
    // Wait for checkout modal/page
    await page.waitForSelector('[role="dialog"], .checkout-pix, .pix-qrcode', { timeout: 5000 });
    
    // Check if QR code is displayed
    const qrCodeElement = await page.$('[data-testid="pix-qrcode"]');
    expect(qrCodeElement).toBeTruthy();
    
    // Check if timer is displayed
    const timerElement = await page.$('[data-testid="qrcode-timer"]');
    expect(timerElement).toBeTruthy();
    
    // Get BR code for testing
    const brCodeText = await page.textContent('[data-testid="pix-brcode"]');
    expect(brCodeText).toBeTruthy();
  });

  test('4. Create PIX payment via API', async ({ request }) => {
    // Create PIX payment
    const response = await request.post(`${BASE_URL}/api/pix/create`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        bookingId: parseInt(bookingId),
        amount: 100.00,
      },
    });

    expect(response.status()).toBe(201);
    const pixData = await response.json();
    
    expect(pixData.data).toHaveProperty('transactionId');
    expect(pixData.data).toHaveProperty('qrCode');
    expect(pixData.data).toHaveProperty('brCode');
    
    paymentId = pixData.data.transactionId;
    expect(paymentId).toBeTruthy();
  });

  test('5. Check payment status before webhook', async ({ request }) => {
    // Get payment status
    const response = await request.get(`${BASE_URL}/api/pix/status/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status()).toBe(200);
    const status = await response.json();
    
    expect(status.data.status).toBe('pending');
    expect(status.data.transactionId).toBe(paymentId);
  });

  test('6. Simulate webhook callback (payment confirmed)', async ({ request }) => {
    // Simulate receiving a webhook from the bank
    const crypto = require('crypto');
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const secret = process.env.[REDACTED_TOKEN] || 'test-secret';
    
    const payload = {
      transaction_id: paymentId,
      status: 'confirmed',
      amount: 100.00,
      timestamp,
    };

    const rawBody = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const response = await request.post(`${BASE_URL}/api/pix/webhooks`, {
      headers: {
        'x-signature': signature,
        'x-timestamp': timestamp,
        'Content-Type': 'application/json',
      },
      data: payload,
    });

    expect(response.status()).toBe(200);
  });

  test('7. Check payment status after webhook', async ({ request }) => {
    // Add small delay to ensure DB update
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get payment status
    const response = await request.get(`${BASE_URL}/api/pix/status/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status()).toBe(200);
    const status = await response.json();
    
    expect(status.data.status).toBe('confirmed');
    expect(status.data.confirmedAt).toBeTruthy();
  });

  test('8. Verify booking status is updated to completed', async ({ request }) => {
    // Get booking details
    const response = await request.get(`${BASE_URL}/api/bookings/${bookingId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status()).toBe(200);
    const booking = await response.json();
    
    expect(booking.data.status).toBe('completed');
    expect(booking.data.paymentStatus).toBe('confirmed');
  });

  test('9. Verify payment appears in user history', async ({ request }) => {
    // Get user payment history
    const response = await request.get(`${BASE_URL}/api/pix/user/payments`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status()).toBe(200);
    const payments = await response.json();
    
    expect(Array.isArray(payments.data)).toBeTruthy();
    const payment = payments.data.find(p => p.transactionId === paymentId);
    expect(payment).toBeTruthy();
    expect(payment.status).toBe('confirmed');
  });

  test('10. Test webhook idempotency (resend same webhook)', async ({ request }) => {
    // Resend the same webhook
    const crypto = require('crypto');
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const secret = process.env.[REDACTED_TOKEN] || 'test-secret';
    
    const payload = {
      transaction_id: paymentId,
      status: 'confirmed',
      amount: 100.00,
      timestamp,
    };

    const rawBody = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const response = await request.post(`${BASE_URL}/api/pix/webhooks`, {
      headers: {
        'x-signature': signature,
        'x-timestamp': timestamp,
        'Content-Type': 'application/json',
      },
      data: payload,
    });

    // Should be idempotent
    expect(response.status()).toBe(200);
    
    // Status should still be confirmed
    const statusResponse = await request.get(`${BASE_URL}/api/pix/status/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const status = await statusResponse.json();
    expect(status.data.status).toBe('confirmed');
  });

  test('11. Test webhook signature validation (invalid signature)', async ({ request }) => {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    const payload = {
      transaction_id: 'invalid-txn',
      status: 'confirmed',
      amount: 100.00,
      timestamp,
    };

    const response = await request.post(`${BASE_URL}/api/pix/webhooks`, {
      headers: {
        'x-signature': '[REDACTED_TOKEN]',
        'x-timestamp': timestamp,
        'Content-Type': 'application/json',
      },
      data: payload,
    });

    // Should reject invalid signature
    expect(response.status()).toBe(401);
  });

  test('12. Test webhook timestamp validation (stale timestamp)', async ({ request }) => {
    const crypto = require('crypto');
    const staleTimestamp = (Math.floor(Date.now() / 1000) - 600).toString(); // 10 min ago
    const secret = process.env.[REDACTED_TOKEN] || 'test-secret';
    
    const payload = {
      transaction_id: 'test-txn',
      status: 'confirmed',
      amount: 100.00,
      timestamp: staleTimestamp,
    };

    const rawBody = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const response = await request.post(`${BASE_URL}/api/pix/webhooks`, {
      headers: {
        'x-signature': signature,
        'x-timestamp': staleTimestamp,
        'Content-Type': 'application/json',
      },
      data: payload,
    });

    // Should reject stale timestamps
    expect(response.status()).toBe(408);
  });
});

const StripeService = require('../src/services/StripeService');

describe('StripeService (mock mode)', () => {
  test('processPayment should return success in mock mode when STRIPE_SECRET_KEY not set', async () => {
    const res = await StripeService.processPayment('pm_test_123', 100, 'booking123');
    expect(res).toHaveProperty('success');
    expect(res.success).toBe(true);
    expect(res).toHaveProperty('id');
  });
});

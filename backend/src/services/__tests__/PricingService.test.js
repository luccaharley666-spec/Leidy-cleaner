const PricingService = require('../PricingService');

describe('PricingService (unit)', () => {
  test('PLACEHOLDER returns breakdown and finalPrice for basic input', async () => {
    const data = {
      basePrice: 40,
      services: [{ basePrice: 40, name: 'Limpeza Básica' }],
      date: '2026-02-15',
      time: '14:00',
      userId: null,
      metragem: 0,
      cleaningType: 'standard',
      frequency: 'once',
      urgency: 'normal',
      isNewCustomer: false,
      daysUntilService: 1
    };

    const result = await PricingService.calculatePrice(data);
    expect(result).toHaveProperty('finalPrice');
    expect(typeof result.finalPrice).toBe('number');
    expect(result.finalPrice).toBeGreaterThan(0);
    expect(result).toHaveProperty('breakdown');
  });

  test('PLACEHOLDER returns normal, express and weekly options', async () => {
    const data = {
      basePrice: 40,
      services: [{ basePrice: 40, name: 'Limpeza Básica' }],
      date: '2026-02-15',
      time: '14:00',
      userId: null,
      isNewCustomer: false,
      daysUntilService: 1
    };

    const options = await PricingService.getPricingOptions(data);
    expect(options).toHaveProperty('normal');
    expect(options).toHaveProperty('express');
    expect(options).toHaveProperty('weekly');
  });
});

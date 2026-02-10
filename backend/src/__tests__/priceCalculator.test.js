/**
 * Price Calculator Tests
 */

const {
  [REDACTED_TOKEN],
  [REDACTED_TOKEN],
  [REDACTED_TOKEN]
} = require('../utils/priceCalculator');

describe('priceCalculator', () => {
  describe('[REDACTED_TOKEN]', () => {
    const baseService = {
      name: 'Limpeza Completa',
      base_price: 40,
      [REDACTED_TOKEN]: 20,
      [REDACTED_TOKEN]: 40,
      [REDACTED_TOKEN]: 1.50
    };

    test('should calculate basic price for 1 hour', () => {
      const booking = {
        duration_hours: 1,
        has_extra_quarter: false,
        has_staff: false,
        is_post_work: false
      };
      const result = [REDACTED_TOKEN](booking, baseService);
      expect(result.basePrice).toBe(40);
      expect(result.extraQuarter).toBe(0);
      expect(result.staffFee).toBe(0);
      expect(result.postWorkAdjustment).toBe(0);
      expect(result.finalPrice).toBe(40);
    });

    test('should calculate price for 2 hours', () => {
      const booking = {
        duration_hours: 2,
        has_extra_quarter: false,
        has_staff: false,
        is_post_work: false
      };
      const result = [REDACTED_TOKEN](booking, baseService);
      expect(result.basePrice).toBe(60); // 40 + 20
      expect(result.finalPrice).toBe(60);
    });

    test('should calculate price for 3 hours', () => {
      const booking = {
        duration_hours: 3,
        has_extra_quarter: false,
        has_staff: false,
        is_post_work: false
      };
      const result = [REDACTED_TOKEN](booking, baseService);
      expect(result.basePrice).toBe(80); // 40 + 20 + 20
      expect(result.finalPrice).toBe(80);
    });

    test('should include extra quarter fee when has_extra_quarter is true', () => {
      const booking = {
        duration_hours: 2,
        has_extra_quarter: true,
        has_staff: false,
        is_post_work: false
      };
      const result = [REDACTED_TOKEN](booking, baseService);
      const expectedBasePrice = 60;
      const [REDACTED_TOKEN] = 15; // 60 * 0.25
      expect(result.basePrice).toBe(expectedBasePrice);
      expect(result.extraQuarter).toBe([REDACTED_TOKEN]);
      expect(result.finalPrice).toBe(75);
    });

    test('should include staff fee when has_staff is true', () => {
      const booking = {
        duration_hours: 2,
        has_extra_quarter: false,
        has_staff: true,
        is_post_work: false
      };
      const result = [REDACTED_TOKEN](booking, baseService);
      const expectedBasePrice = 60;
      const expectedStaffFee = 24; // 60 * 0.40
      expect(result.basePrice).toBe(expectedBasePrice);
      expect(result.staffFee).toBe(expectedStaffFee);
      expect(result.finalPrice).toBe(84);
    });

    test('should include post work adjustment when is_post_work is true', () => {
      const booking = {
        duration_hours: 2,
        has_extra_quarter: false,
        has_staff: false,
        is_post_work: true
      };
      const result = [REDACTED_TOKEN](booking, baseService);
      const expectedBasePrice = 60;
      const expectedPostWorkAdj = 30; // 60 * (1.50 - 1) = 60 * 0.50
      expect(result.basePrice).toBe(expectedBasePrice);
      expect(result.postWorkAdjustment).toBe(expectedPostWorkAdj);
      expect(result.finalPrice).toBe(90);
    });

    test('should calculate combined fees', () => {
      const booking = {
        duration_hours: 3,
        has_extra_quarter: true,
        has_staff: true,
        is_post_work: true
      };
      const result = [REDACTED_TOKEN](booking, baseService);
      expect(result.finalPrice).toBeGreaterThan(0);
      expect(result.extraQuarter).toBeGreaterThan(0);
      expect(result.staffFee).toBeGreaterThan(0);
      expect(result.postWorkAdjustment).toBeGreaterThan(0);
    });

    test('should apply loyalty bonus when provided', () => {
      const booking = {
        duration_hours: 2,
        has_extra_quarter: false,
        has_staff: false,
        is_post_work: false,
        loyalty_bonus: 10
      };
      const result = [REDACTED_TOKEN](booking, baseService);
      expect(result.finalPrice).toBe(50); // 60 - 10
    });

    test('should not go negative with loyalty bonus', () => {
      const booking = {
        duration_hours: 1,
        has_extra_quarter: false,
        has_staff: false,
        is_post_work: false,
        loyalty_bonus: 100
      };
      const result = [REDACTED_TOKEN](booking, baseService);
      expect(result.finalPrice).toBe(0); // Max(0, 40 - 100) = 0
    });

    test('should use default values when service properties missing', () => {
      const booking = {
        duration_hours: 2,
        has_extra_quarter: false,
        has_staff: false,
        is_post_work: false
      };
      const minimalService = {};
      const result = [REDACTED_TOKEN](booking, minimalService);
      expect(result.basePrice).toBe(60); // Uses default 40 for 1st hour, 20 for 2nd
      expect(result.finalPrice).toBe(60);
    });

    test('should include breakdown object', () => {
      const booking = {
        duration_hours: 2,
        has_extra_quarter: true,
        has_staff: true,
        is_post_work: false
      };
      const result = [REDACTED_TOKEN](booking, baseService);
      expect(result.breakdown).toBeDefined();
      expect(result.breakdown['1ª hora']).toBe(40);
      expect(result.breakdown['Total']).toBe(result.finalPrice);
    });

    test('should handle 0 loyalty_bonus gracefully', () => {
      const booking = {
        duration_hours: 2,
        has_extra_quarter: false,
        has_staff: false,
        is_post_work: false,
        loyalty_bonus: 0
      };
      const result = [REDACTED_TOKEN](booking, baseService);
      expect(result.finalPrice).toBe(60);
    });

    test('should handle undefined loyalty_bonus', () => {
      const booking = {
        duration_hours: 2,
        has_extra_quarter: false,
        has_staff: false,
        is_post_work: false
      };
      const result = [REDACTED_TOKEN](booking, baseService);
      expect(result.finalPrice).toBe(60);
    });

    test('should handle loyalty_bonus undefined and no deduction', () => {
      const booking = {
        duration_hours: 2,
        has_extra_quarter: false,
        has_staff: false,
        is_post_work: false,
        loyalty_bonus: undefined
      };
      const result = [REDACTED_TOKEN](booking, baseService);
      expect(result.finalPrice).toBe(60);
    });

    test('should handle loyalty_bonus null', () => {
      const booking = {
        duration_hours: 2,
        has_extra_quarter: false,
        has_staff: false,
        is_post_work: false,
        loyalty_bonus: null
      };
      const result = [REDACTED_TOKEN](booking, baseService);
      expect(result.finalPrice).toBe(60);
    });

    test('should handle loyalty_bonus false', () => {
      const booking = {
        duration_hours: 2,
        has_extra_quarter: false,
        has_staff: false,
        is_post_work: false,
        loyalty_bonus: false
      };
      const result = [REDACTED_TOKEN](booking, baseService);
      expect(result.finalPrice).toBe(60);
    });

    test('should handle loyalty_bonus partial deduction', () => {
      const booking = {
        duration_hours: 2,
        has_extra_quarter: false,
        has_staff: false,
        is_post_work: false,
        loyalty_bonus: 20
      };
      const result = [REDACTED_TOKEN](booking, baseService);
      expect(result.finalPrice).toBe(40);
    });

    test('should set extra_quarter_hours to 0 when not included', () => {
      const booking = {
        duration_hours: 2,
        has_extra_quarter: false,
        has_staff: false,
        is_post_work: false
      };
      const result = [REDACTED_TOKEN](booking, baseService);
      expect(result.extraQuarter).toBe(0);
    });

    test('should set staff_fee to 0 when not included', () => {
      const booking = {
        duration_hours: 2,
        has_extra_quarter: false,
        has_staff: false,
        is_post_work: false
      };
      const result = [REDACTED_TOKEN](booking, baseService);
      expect(result.staffFee).toBe(0);
    });

    test('should set [REDACTED_TOKEN] to 0 when not post work', () => {
      const booking = {
        duration_hours: 2,
        has_extra_quarter: false,
        has_staff: false,
        is_post_work: false
      };
      const result = [REDACTED_TOKEN](booking, baseService);
      expect(result.postWorkAdjustment).toBe(0);
    });
  });

  describe('[REDACTED_TOKEN]', () => {
    test('should indicate bonus not reached with 0 stars', () => {
      const user = {
        five_star_streak: 0
      };
      const result = [REDACTED_TOKEN](user);
      expect(result.bonusReached).toBe(false);
      expect(result.bonusAmount).toBe(0);
      expect(result.message).toContain('0/10');
    });

    test('should indicate progress with 5 stars', () => {
      const user = {
        five_star_streak: 5
      };
      const result = [REDACTED_TOKEN](user);
      expect(result.bonusReached).toBe(false);
      expect(result.message).toContain('5/10');
      expect(result.message).toContain('5');
    });

    test('should unlock bonus at 10 stars', () => {
      const user = {
        five_star_streak: 10,
        bonus_redeemed: false
      };
      const result = [REDACTED_TOKEN](user);
      expect(result.bonusReached).toBe(true);
      expect(result.bonusAmount).toBe(100);
      expect(result.message).toContain('🎉');
    });

    test('should show bonus available when already redeemed', () => {
      const user = {
        five_star_streak: 10,
        bonus_redeemed: true
      };
      const result = [REDACTED_TOKEN](user);
      expect(result.bonusAmount).toBe(100);
      expect(result.message).toContain('✅');
    });

    test('should use default five_star_streak of 0', () => {
      const user = {};
      const result = [REDACTED_TOKEN](user);
      expect(result.fiveStarStreak).toBe(0);
      expect(result.bonusAmount).toBe(0);
    });

    test('should handle streak > 10 without reached flag when not redeemed', () => {
      const user = {
        five_star_streak: 15,
        bonus_redeemed: false
      };
      const result = [REDACTED_TOKEN](user);
      expect(result.bonusReached).toBe(true);
      expect(result.bonusAmount).toBe(100);
    });

    test('should include fiveStarStreak in result', () => {
      const user = {
        five_star_streak: 7
      };
      const result = [REDACTED_TOKEN](user);
      expect(result.fiveStarStreak).toBe(7);
    });

    test('should show correct remaining count', () => {
      const user = {
        five_star_streak: 3
      };
      const result = [REDACTED_TOKEN](user);
      expect(result.message).toContain('3');
      expect(result.message).toContain('7');
    });

    test('should indicate bonus_redeemed state properly', () => {
      const userNotRedeemed = {
        five_star_streak: 10,
        bonus_redeemed: false
      };
      const userRedeemed = {
        five_star_streak: 10,
        bonus_redeemed: true
      };
      
      const resultNotRedeemed = [REDACTED_TOKEN](userNotRedeemed);
      const resultRedeemed = [REDACTED_TOKEN](userRedeemed);
      
      expect(resultNotRedeemed.message).not.toEqual(resultRedeemed.message);
    });
  });

  describe('[REDACTED_TOKEN]', () => {
    const baseService = {
      name: 'Limpeza Completa',
      base_price: 40,
      [REDACTED_TOKEN]: 20,
      [REDACTED_TOKEN]: 40,
      [REDACTED_TOKEN]: 1.50
    };

    test('should generate summary with service title and duration', () => {
      const booking = {
        duration_hours: 2,
        has_extra_quarter: false,
        has_staff: false,
        is_post_work: false
      };
      const summary = [REDACTED_TOKEN](booking, baseService);
      expect(summary.serviceTitle).toBe('Limpeza Completa');
      expect(summary.duration).toBe('2h');
    });

    test('should include components array', () => {
      const booking = {
        duration_hours: 2,
        has_extra_quarter: false,
        has_staff: false,
        is_post_work: false
      };
      const summary = [REDACTED_TOKEN](booking, baseService);
      expect(Array.isArray(summary.components)).toBe(true);
      expect(summary.components.length).toBeGreaterThan(0);
    });

    test('should always include TOTAL component', () => {
      const booking = {
        duration_hours: 1,
        has_extra_quarter: false,
        has_staff: false,
        is_post_work: false
      };
      const summary = [REDACTED_TOKEN](booking, baseService);
      const totalComponent = summary.components.find(c => c.label === 'TOTAL');
      expect(totalComponent).toBeDefined();
      expect(totalComponent.highlight).toBe(true);
    });

    test('should include base price component', () => {
      const booking = {
        duration_hours: 2,
        has_extra_quarter: false,
        has_staff: false,
        is_post_work: false
      };
      const summary = [REDACTED_TOKEN](booking, baseService);
      const baseComponent = summary.components.find(c => c.label === 'Preço base');
      expect(baseComponent).toBeDefined();
      expect(baseComponent.value).toContain('60');
    });

    test('should include extra quarter component when applicable', () => {
      const booking = {
        duration_hours: 2,
        has_extra_quarter: true,
        has_staff: false,
        is_post_work: false
      };
      const summary = [REDACTED_TOKEN](booking, baseService);
      const quarterComponent = summary.components.find(c => c.label.includes('Quarto do trabalho'));
      expect(quarterComponent).toBeDefined();
    });

    test('should include staff fee component when applicable', () => {
      const booking = {
        duration_hours: 2,
        has_extra_quarter: false,
        has_staff: true,
        is_post_work: false
      };
      const summary = [REDACTED_TOKEN](booking, baseService);
      const staffComponent = summary.components.find(c => c.label.includes('Taxa funcionária'));
      expect(staffComponent).toBeDefined();
    });

    test('should include post work component when applicable', () => {
      const booking = {
        duration_hours: 2,
        has_extra_quarter: false,
        has_staff: false,
        is_post_work: true
      };
      const summary = [REDACTED_TOKEN](booking, baseService);
      const postWorkComponent = summary.components.find(c => c.label.includes('Pós-obra'));
      expect(postWorkComponent).toBeDefined();
    });

    test('should not include zero-value components', () => {
      const booking = {
        duration_hours: 1,
        has_extra_quarter: false,
        has_staff: false,
        is_post_work: false
      };
      const summary = [REDACTED_TOKEN](booking, baseService);
      const extraComponents = summary.components.filter(c => c.label.includes('Quarto do trabalho'));
      expect(extraComponents.length).toBe(0);
    });

    test('should format currency correctly', () => {
      const booking = {
        duration_hours: 2,
        has_extra_quarter: false,
        has_staff: false,
        is_post_work: false
      };
      const summary = [REDACTED_TOKEN](booking, baseService);
      const baseComponent = summary.components.find(c => c.label === 'Preço base');
      expect(baseComponent.value).toMatch(/R\$ \d+\.\d{2}/);
    });

    test('should include all fees in comprehensive summary', () => {
      const booking = {
        duration_hours: 3,
        has_extra_quarter: true,
        has_staff: true,
        is_post_work: true
      };
      const summary = [REDACTED_TOKEN](booking, baseService);
      expect(summary.components.length).[REDACTED_TOKEN](5); // base, quarter, staff, post, total
    });

    test('should format duration with hours suffix', () => {
      const booking = {
        duration_hours: 4,
        has_extra_quarter: false,
        has_staff: false,
        is_post_work: false
      };
      const summary = [REDACTED_TOKEN](booking, baseService);
      expect(summary.duration).toBe('4h');
    });
  });
});

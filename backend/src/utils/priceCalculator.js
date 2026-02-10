/**
 * Calculador de Preços - Leidy Cleaner
 * 
 * Fórmula:
 * 1ª hora: R$ 40
 * Cada hora adicional: +R$ 20
 * Taxa funcionária: +40%
 * Quarto do trabalho a mais: +25% (organização/setup)
 * Pós-obra: x1.5 do total
 */

function [REDACTED_TOKEN](booking, service) {
  let price = 0;

  // 1. PREÇO BASE
  const firstHourPrice = service.base_price || 40.00;
  const additionalHourPrice = service.[REDACTED_TOKEN] || 20.00;
  const durationHours = booking.duration_hours || 2;

  // Cálculo das horas
  if (durationHours <= 1) {
    price = firstHourPrice;
  } else {
    price = firstHourPrice + (durationHours - 1) * additionalHourPrice;
  }

  booking.base_price = parseFloat(price.toFixed(2));

  // 2. QUARTO DO TRABALHO A MAIS (organização)
  if (booking.has_extra_quarter) {
    booking.extra_quarter_hours = parseFloat((price * 0.25).toFixed(2));
    price += booking.extra_quarter_hours;
  } else {
    booking.extra_quarter_hours = 0;
  }

  // 3. TAXA FUNCIONÁRIA (+40%)
  if (booking.has_staff) {
    const staffFeePercentage = service.[REDACTED_TOKEN] || 40;
    booking.staff_fee = parseFloat((price * (staffFeePercentage / 100)).toFixed(2));
    price += booking.staff_fee;
  } else {
    booking.staff_fee = 0;
  }

  // 4. PÓS-OBRA (x1.5)
  if (booking.is_post_work) {
    const multiplier = service.[REDACTED_TOKEN] || 1.50;
    booking.[REDACTED_TOKEN] = parseFloat((price * (multiplier - 1)).toFixed(2));
    price += booking.[REDACTED_TOKEN];
  } else {
    booking.[REDACTED_TOKEN] = 0;
  }

  // 5. APLICAR BÔNUS DE FIDELIDADE (se houver)
  if (booking.loyalty_bonus && booking.loyalty_bonus > 0) {
    price = Math.max(0, price - booking.loyalty_bonus);
  }

  booking.final_price = parseFloat(price.toFixed(2));

  return {
    basePrice: booking.base_price,
    extraQuarter: booking.extra_quarter_hours,
    staffFee: booking.staff_fee,
    postWorkAdjustment: booking.[REDACTED_TOKEN],
    finalPrice: booking.final_price,
    breakdown: {
      '1ª hora': firstHourPrice,
      'Horas adicionais': (durationHours - 1) * additionalHourPrice,
      'Quarto do trabalho': booking.extra_quarter_hours,
      'Taxa funcionária (+40%)': booking.staff_fee,
      'Pós-obra (+50%)': booking.[REDACTED_TOKEN],
      'Total': booking.final_price
    }
  };
}

/**
 * Calcula bônus de fidelidade
 * 10 faxinas 5⭐ seguidas = R$ 100 de bônus
 */
function [REDACTED_TOKEN](user) {
  const bonus = {
    fiveStarStreak: user.five_star_streak || 0,
    bonusAmount: 0,
    bonusReached: false,
    message: ''
  };

  if (bonus.fiveStarStreak >= 10 && !user.bonus_redeemed) {
    bonus.bonusAmount = 100.00;
    bonus.bonusReached = true;
    bonus.message = '🎉 Parabéns! Você atingiu 10 avaliações 5⭐! Ganhou R$ 100 de desconto!';
  } else if (user.bonus_redeemed) {
    bonus.bonusAmount = 100.00;
    bonus.message = '✅ Bônus de R$ 100 disponível para usar!';
  } else {
    const remaining = 10 - bonus.fiveStarStreak;
    bonus.message = `${bonus.fiveStarStreak}/10 avaliações 5⭐. Faltam ${remaining} para ganhar R$ 100!`;
  }

  return bonus;
}

/**
 * Gera resumo de preço para o usuário
 */
function [REDACTED_TOKEN](booking, service) {
  const calc = [REDACTED_TOKEN](booking, service);

  const summary = {
    serviceTitle: service.name,
    duration: `${booking.duration_hours}h`,
    components: []
  };

  if (calc.basePrice > 0) {
    summary.components.push({
      label: 'Preço base',
      value: `R$ ${calc.basePrice.toFixed(2)}`
    });
  }

  if (calc.extraQuarter > 0) {
    summary.components.push({
      label: 'Quarto do trabalho (organização)',
      value: `+ R$ ${calc.extraQuarter.toFixed(2)}`
    });
  }

  if (calc.staffFee > 0) {
    summary.components.push({
      label: 'Taxa funcionária (40%)',
      value: `+ R$ ${calc.staffFee.toFixed(2)}`
    });
  }

  if (calc.postWorkAdjustment > 0) {
    summary.components.push({
      label: 'Pós-obra (50% extra)',
      value: `+ R$ ${calc.postWorkAdjustment.toFixed(2)}`
    });
  }

  summary.components.push({
    label: 'TOTAL',
    value: `R$ ${calc.finalPrice.toFixed(2)}`,
    highlight: true
  });

  return summary;
}

module.exports = {
  [REDACTED_TOKEN],
  [REDACTED_TOKEN],
  [REDACTED_TOKEN]
};

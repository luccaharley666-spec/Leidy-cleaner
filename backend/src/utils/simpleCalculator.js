/**
 * Calculadora de Preço Simples - Leidy Cleaner
 * 
 * Base:
 * - R$40 primeira hora
 * - R$20 cada hora adicional (até 8h)
 * 
 * Acréscimos:
 * - +10% Organização
 * - +20% Pós-Obra
 * - +R$3 fixo por produtos
 * 
 * Taxa empresa: 40% do valor pago ao profissional
 */

const SERVICE_TYPES = {
  LIMPEZA_COMUM: 'limpeza_comum',
  ORGANIZACAO: 'organizacao',
  POS_OBRA: 'pos_obra'
}

const PRICE_CONFIG = {
  firstHour: 40,        // R$40 primeira hora
  additionalHour: 20,   // R$20 por hora adicional
  maxHours: 8,          // Máximo 8 horas
  productFee: 3,        // R$3 se levar produtos
  organizationBonus: 0.10,  // +10% para organização
  posObraBonus: 0.20,       // +20% para obra
  companyPercentage: 0.40   // 40% para empresa / 60% profissional
}

/**
 * Calcula o preço base (sem acréscimos)
 * @param {number} hours - Horas de serviço (1-8)
 * @returns {number} Preço em reais
 */
function calculateBasePrice(hours) {
  if (hours < 1 || hours > PRICE_CONFIG.maxHours) {
    throw new Error(`Horas deve estar entre 1 e ${PRICE_CONFIG.maxHours}`)
  }

  let price = PRICE_CONFIG.firstHour // primeira hora

  if (hours > 1) {
    price += (hours - 1) * PRICE_CONFIG.additionalHour // horas adicionais
  }

  return price
}

/**
 * Calcula preço total com acréscimos
 * @param {object} params - { hours, serviceType, hasProducts }
 * @returns {object} { basePrice, bonus, productFee, finalPrice, company40, profesional60 }
 */
function calculatePrice(params) {
  const { hours = 1, serviceType = SERVICE_TYPES.LIMPEZA_COMUM, hasProducts = false } = params

  // Validar horas
  if (!Number.isInteger(hours) || hours < 1 || hours > PRICE_CONFIG.maxHours) {
    throw new Error(`Horas inválida. Use 1 a ${PRICE_CONFIG.maxHours}`)
  }

  // Calcular preço base
  const basePrice = calculateBasePrice(hours)

  // Calcular bonificação por tipo
  let bonus = 0
  switch (serviceType) {
    case SERVICE_TYPES.ORGANIZACAO:
      bonus = basePrice * PRICE_CONFIG.organizationBonus
      break
    case SERVICE_TYPES.POS_OBRA:
      bonus = basePrice * PRICE_CONFIG.posObraBonus
      break
    default:
      bonus = 0
  }

  // Taxa de produtos
  const productFee = hasProducts ? PRICE_CONFIG.productFee : 0

  // Preço final ao cliente
  const finalPrice = basePrice + bonus + productFee

  // Divisão: 40% empresa, 60% profissional
  const company40 = finalPrice * PRICE_CONFIG.companyPercentage
  const profesional60 = finalPrice * (1 - PRICE_CONFIG.companyPercentage)

  return {
    hours,
    basePrice: parseFloat(basePrice.toFixed(2)),
    bonus: parseFloat(bonus.toFixed(2)),
    bonusType: serviceType === SERVICE_TYPES.ORGANIZACAO ? '+10%' : serviceType === SERVICE_TYPES.POS_OBRA ? '+20%' : 'nenhum',
    productFee: parseFloat(productFee.toFixed(2)),
    finalPrice: parseFloat(finalPrice.toFixed(2)),
    company40: parseFloat(company40.toFixed(2)),
    profesional60: parseFloat(profesional60.toFixed(2))
  }
}

/**
 * Calcula múltiplas horas (acumulativo)
 * @param {array} bookings - [ { hours, serviceType, hasProducts }, ... ]
 * @returns {object} Totais acumulados
 */
function calculateAccumulative(bookings) {
  if (!Array.isArray(bookings) || bookings.length === 0) {
    throw new Error('Provide array com pelo menos 1 booking')
  }

  const results = bookings.map((b, idx) => ({
    ...calculatePrice(b),
    index: idx + 1
  }))

  const totals = results.reduce(
    (acc, result) => ({
      totalHours: acc.totalHours + result.hours,
      totalBase: acc.totalBase + result.basePrice,
      totalBonus: acc.totalBonus + result.bonus,
      totalProducts: acc.totalProducts + result.productFee,
      totalFinal: acc.totalFinal + result.finalPrice,
      totalCompany: acc.totalCompany + result.company40,
      totalProfessional: acc.totalProfessional + result.profesional60
    }),
    {
      totalHours: 0,
      totalBase: 0,
      totalBonus: 0,
      totalProducts: 0,
      totalFinal: 0,
      totalCompany: 0,
      totalProfessional: 0
    }
  )

  // Fixar 2 casas decimais
  Object.keys(totals).forEach(key => {
    if (typeof totals[key] === 'number') {
      totals[key] = parseFloat(totals[key].toFixed(2))
    }
  })

  return {
    details: results,
    totals
  }
}

/**
 * Exemplo: Gera resumo legível
 */
function formatPriceBreakdown(priceData) {
  return `
  ╔════════════════════════════════════════╗
  ║     CÁLCULO DE PREÇO - LEIDY CLEANER   ║
  ╚════════════════════════════════════════╝
  
  📋 DETALHES:
  • Horas: ${priceData.hours}h
  • Tipo: ${priceData.bonusType}
  • Produtos: ${priceData.productFee > 0 ? 'Sim (+R$' + priceData.productFee + ')' : 'Não'}
  
  💰 CÁLCULO:
  • Preço base: R$${priceData.basePrice.toFixed(2)}
  • Acréscimo ${priceData.bonusType}: R$${priceData.bonus.toFixed(2)}
  • Taxa produtos: R$${priceData.productFee.toFixed(2)}
  ─────────────────────────────
  • TOTAL ao cliente: R$${priceData.finalPrice.toFixed(2)}
  
  📊 DIVISÃO:
  • Empresa (40%): R$${priceData.company40.toFixed(2)}
  • Profissional (60%): R$${priceData.profesional60.toFixed(2)}
  `
}

module.exports = {
  SERVICE_TYPES,
  PRICE_CONFIG,
  calculateBasePrice,
  calculatePrice,
  calculateAccumulative,
  formatPriceBreakdown
}

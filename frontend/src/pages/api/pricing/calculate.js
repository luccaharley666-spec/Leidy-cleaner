/**
 * POST /api/pricing/calculate
 * Calcula preço simples para um serviço
 * 
 * Body: { hours: 2, serviceType: 'limpeza_comum', hasProducts: false }
 */

const PRICE_CONFIG = {
  firstHour: 40,
  additionalHour: 20,
  maxHours: 8,
  productFee: 3,
  organizationBonus: 0.10,
  posObraBonus: 0.20,
  companyPercentage: 0.40
}

function calculateBasePrice(hours) {
  if (hours < 1 || hours > PRICE_CONFIG.maxHours) {
    throw new Error(`Horas deve estar entre 1 e ${PRICE_CONFIG.maxHours}`)
  }

  let price = PRICE_CONFIG.firstHour
  if (hours > 1) {
    price += (hours - 1) * PRICE_CONFIG.additionalHour
  }
  return price
}

function calculatePrice({ hours = 1, serviceType = 'limpeza_comum', hasProducts = false }) {
  if (!Number.isInteger(hours) || hours < 1 || hours > PRICE_CONFIG.maxHours) {
    throw new Error(`Horas inválida. Use 1 a ${PRICE_CONFIG.maxHours}`)
  }

  const basePrice = calculateBasePrice(hours)

  let bonus = 0
  switch (serviceType) {
    case 'organizacao':
      bonus = basePrice * PRICE_CONFIG.organizationBonus
      break
    case 'pos_obra':
      bonus = basePrice * PRICE_CONFIG.posObraBonus
      break
    default:
      bonus = 0
  }

  const productFee = hasProducts ? PRICE_CONFIG.productFee : 0
  const finalPrice = basePrice + bonus + productFee

  return {
    hours,
    basePrice: parseFloat(basePrice.toFixed(2)),
    bonus: parseFloat(bonus.toFixed(2)),
    bonusType: serviceType === 'organizacao' ? '+10%' : serviceType === 'pos_obra' ? '+20%' : 'nenhum',
    productFee: parseFloat(productFee.toFixed(2)),
    finalPrice: parseFloat(finalPrice.toFixed(2)),
    company40: parseFloat((finalPrice * PRICE_CONFIG.companyPercentage).toFixed(2)),
    profesional60: parseFloat((finalPrice * (1 - PRICE_CONFIG.companyPercentage)).toFixed(2))
  }
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { hours = 1, serviceType = 'limpeza_comum', hasProducts = false } = req.body

    if (!Number.isInteger(hours) || hours < 1 || hours > 8) {
      return res.status(400).json({ error: 'Horas deve estar entre 1 e 8' })
    }

    const validTypes = ['limpeza_comum', 'organizacao', 'pos_obra']
    if (!validTypes.includes(serviceType)) {
      return res.status(400).json({ error: 'serviceType inválido' })
    }

    const result = calculatePrice({ hours, serviceType, hasProducts })

    return res.status(200).json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Pricing error:', error.message)
    return res.status(400).json({ 
      error: error.message || 'Erro ao calcular preço' 
    })
  }
}

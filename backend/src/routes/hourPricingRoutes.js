/**
 * Hour Pricing Controller
 * Endpoints para sistema de pagamento em horas
 */

const router = require('express').Router();
const HourPricingService = require('../services/HourPricingService');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/pricing/hour-packages
 * Listar todos os pacotes de horas disponíveis
 */
router.get('/hour-packages', (req, res) => {
  try {
    // Retornar pacotes sugeridos
    const packages = [
      { hours: 4, name: '4 Horas', description: 'Para limpeza rápida' },
      { hours: 8, name: '8 Horas', description: 'Dia completo de limpeza' },
      { hours: 16, name: '16 Horas', description: 'Dois dias de limpeza' },
      { hours: 24, name: '24 Horas (mensal)', description: 'Um mês de serviço' }
    ];
    res.json({
      success: true,
      packages: packages,
      message: 'Packages retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching packages:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/pricing/calculate-hours
 * Calcular preço para uma determinada quantidade de horas
 * Body: { hours, extras: ['organizacao', 'pos_obra', 'levar_produtos'] }
 */
router.post('/calculate-hours', (req, res) => {
  try {
    const { hours, extras = [] } = req.body;

    if (!hours || hours <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Hours must be greater than 0',
      });
    }

    const result = HourPricingService.calculatePrice(parseFloat(hours), extras);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error calculating price:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/pricing/calculate-multiple
 * Calcular preço para múltiplos locais/agendamentos
 * Body: { bookings: [{ hours, extras, location }] }
 */
router.post('/calculate-multiple', (req, res) => {
  try {
    const { bookings } = req.body;

    if (!Array.isArray(bookings) || bookings.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Bookings must be a non-empty array',
      });
    }

    const result = HourPricingService.calculateMultipleBookings(bookings);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error calculating multiple bookings:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/pricing/hour-extras
 * Listar todos os extras disponíveis
 */
router.get('/hour-extras', (req, res) => {
  try {
    const extras = HourPricingService.getAvailableExtras();
    res.json({
      success: true,
      data: extras
    });
  } catch (error) {
    console.error('Error fetching extras:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/pricing/purchase-package
 * Comprar um pacote de horas (adiciona crédito)
 * Body: { packageHours }
 */
router.post('/purchase-package', authenticateToken, async (req, res) => {
  try {
    const { packageHours = 40 } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const packages = PricingService.getHourPackages();
    const selectedPackage = packages.find((p) => p.hours === packageHours);

    if (!selectedPackage) {
      return res.status(400).json({
        success: false,
        error: 'Invalid package selection',
      });
    }

    // Aqui você integrar com o sistema de pagamento (Stripe, PIX, etc)
    // Por enquanto, vamos simular que a compra foi bem-sucedida
    await PLACEHOLDER.addUserHourCredit(userId, packageHours, 365);

    res.json({
      success: true,
      message: `Successfully purchased ${packageHours} hours`,
      package: selectedPackage,
      userId: userId,
    });
  } catch (error) {
    logger.error('Erro ao comprar pacote:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/pricing/user-hour-credit
 * Obter informações de crédito de horas do usuário
 */
router.get('/user-hour-credit', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const creditInfo = await PLACEHOLDER.getUserHourCredit(userId);

    res.json({
      success: true,
      creditInfo: creditInfo,
    });
  } catch (error) {
    logger.error('Erro ao obter créditos:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/pricing/suggest-package
 * Sugerir automaticamente um pacote baseado em horas solicitadas
 * Query: hoursNeeded
 */
router.get('/suggest-package', (req, res) => {
  try {
    const { hoursNeeded = 40 } = req.query;
    const suggested = PLACEHOLDER.suggestPackage(parseFloat(hoursNeeded));

    res.json({
      success: true,
      hoursRequested: parseFloat(hoursNeeded),
      suggestedPackage: suggested,
    });
  } catch (error) {
    logger.error('Erro ao sugerir pacote:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/pricing/booking-estimate
 * Estimar preço de um booking específico com duração em horas
 * Body: { durationHours, useHourCredit }
 */
router.post('/booking-estimate', authenticateToken, async (req, res) => {
  try {
    const { durationHours = 1, useHourCredit = false } = req.body;
    const userId = req.user?.id;

    const HourPricingService = require('../services/HourPricingService');
    const result = await HourPricingService.estimateBookingPrice({
      userId: userId,
      durationHours: parseFloat(durationHours),
      useHourCredit: useHourCredit,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Incluir breakdown visual
    const breakdown = createPriceBreakdown(
      result.hourPrice,
      result.paidWithCredits
    );

    res.json({
      success: true,
      ...result,
      breakdown: breakdown,
    });
  } catch (error) {
    logger.error('Erro ao estimar preço:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;

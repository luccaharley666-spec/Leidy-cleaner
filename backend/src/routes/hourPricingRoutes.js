/**
 * Hour Pricing Controller
 * Endpoints para sistema de pagamento em horas
 */

const router = require('express').Router();
const [REDACTED_TOKEN] = require('../services/[REDACTED_TOKEN]');
const PricingService = require('../services/PricingService');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/pricing/hour-packages
 * Listar todos os pacotes de horas disponíveis
 */
router.get('/hour-packages', (req, res) => {
  try {
    const packages = [REDACTED_TOKEN].[REDACTED_TOKEN]();
    res.json({
      success: true,
      packages: packages,
      message: 'Packages retrieved successfully',
    });
  } catch (error) {
    console.error('[[REDACTED_TOKEN]] Error fetching packages:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/pricing/calculate-hours
 * Calcular preço para uma determinada quantidade de horas
 * Body: { hours, characteristics }
 */
router.post('/calculate-hours', async (req, res) => {
  try {
    const { hours, characteristics = {} } = req.body;

    if (!hours || hours <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Hours must be greater than 0',
      });
    }

    const userId = req.user?.id;
    const result = await [REDACTED_TOKEN].calculateHourPrice({
      hours: parseFloat(hours),
      characteristics: characteristics,
      userId: userId,
    });

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    res.json(result);
  } catch (error) {
    console.error('[[REDACTED_TOKEN]] Error calculating price:', error.message);
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

    const packages = [REDACTED_TOKEN].[REDACTED_TOKEN]();
    const selectedPackage = packages.find((p) => p.hours === packageHours);

    if (!selectedPackage) {
      return res.status(400).json({
        success: false,
        error: 'Invalid package selection',
      });
    }

    // Aqui você integrar com o sistema de pagamento (Stripe, PIX, etc)
    // Por enquanto, vamos simular que a compra foi bem-sucedida
    await [REDACTED_TOKEN].addUserHourCredit(userId, packageHours, 365);

    res.json({
      success: true,
      message: `Successfully purchased ${packageHours} hours`,
      package: selectedPackage,
      userId: userId,
    });
  } catch (error) {
    console.error('[[REDACTED_TOKEN]] Error purchasing package:', error.message);
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

    const creditInfo = await [REDACTED_TOKEN].getUserHourCredit(userId);

    res.json({
      success: true,
      creditInfo: creditInfo,
    });
  } catch (error) {
    console.error('[[REDACTED_TOKEN]] Error fetching credit info:', error.message);
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
    const suggested = [REDACTED_TOKEN].suggestPackage(parseFloat(hoursNeeded));

    res.json({
      success: true,
      hoursRequested: parseFloat(hoursNeeded),
      suggestedPackage: suggested,
    });
  } catch (error) {
    console.error('[[REDACTED_TOKEN]] Error suggesting package:', error.message);
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

    const [REDACTED_TOKEN] = require('../services/[REDACTED_TOKEN]');
    const result = await [REDACTED_TOKEN].[REDACTED_TOKEN]({
      userId: userId,
      durationHours: parseFloat(durationHours),
      useHourCredit: useHourCredit,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Incluir breakdown visual
    const breakdown = [REDACTED_TOKEN].[REDACTED_TOKEN](
      result.hourPrice,
      result.paidWithCredits
    );

    res.json({
      success: true,
      ...result,
      breakdown: breakdown,
    });
  } catch (error) {
    console.error('[[REDACTED_TOKEN]] Error estimating booking price:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;

/**
 * Smart Features Routes
 * Integra todas as 5 features em um único conjunto de rotas
 * Padrão: /api/smart/*
 */

const express = require('express');
const router = express.Router();
const SmartFeaturesController = require('../controllers/SmartFeaturesController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// ============================================
// PUBLIC ENDPOINTS (sem autenticação)
// ============================================

/**
 * Feature #1: Smart Availability
 * GET /api/smart/staff/available?date=2026-02-14&time=10:00&serviceId=1
 */
router.get('/staff/available', async (req, res) => {
  await SmartFeaturesController.getAvailableStaffWithScores(req, res);
});

/**
 * GET /api/smart/staff/:staffId/realtime-status
 */
router.get('/staff/:staffId/realtime-status', async (req, res) => {
  await SmartFeaturesController.getStaffRealTimeStatus(req, res);
});

/**
 * Feature #5: Auto-Allocate
 * GET /api/smart/auto-allocate?serviceId=1&date=2026-02-14&time=10:00
 */
router.get('/auto-allocate', async (req, res) => {
  await SmartFeaturesController.autoAllocateStaff(req, res);
});

/**
 * Feature #2: Dynamic Pricing
 * POST /api/smart/pricing/calculate
 * Body: {serviceId, date, time, duration, userId}
 */
router.post('/pricing/calculate', async (req, res) => {
  await SmartFeaturesController.calculateDynamicPrice(req, res);
});

/**
 * GET /api/smart/pricing/forecast?serviceId=1&days=7
 */
router.get('/pricing/forecast', async (req, res) => {
  await SmartFeaturesController.getPriceForecast(req, res);
});

/**
 * Feature #3: Cross-Selling
 * GET /api/smart/recommendations?userId=1&currentServiceId=1
 */
router.get('/recommendations', async (req, res) => {
  await SmartFeaturesController.getRecommendations(req, res);
});

/**
 * GET /api/smart/bundles?userId=1
 */
router.get('/bundles', async (req, res) => {
  await SmartFeaturesController.getRecommendedBundles(req, res);
});

// ============================================
// ADMIN ENDPOINTS (requer autenticação admin)
// ============================================

/**
 * Feature #4: Advanced Analytics
 * GET /api/smart/analytics/dashboard?daysBack=30
 */
router.get(
  '/analytics/dashboard',
  authenticateToken,
  authorizeRole(['admin']),
  async (req, res) => {
    await SmartFeaturesController.getAnalyticsDashboard(req, res);
  }
);

/**
 * GET /api/smart/analytics/churn
 */
router.get(
  '/analytics/churn',
  authenticateToken,
  authorizeRole(['admin']),
  async (req, res) => {
    await SmartFeaturesController.getChurnAnalysis(req, res);
  }
);

/**
 * GET /api/smart/analytics/demand-forecast
 */
router.get(
  '/analytics/demand-forecast',
  authenticateToken,
  authorizeRole(['admin']),
  async (req, res) => {
    await SmartFeaturesController.getDemandForecast(req, res);
  }
);

/**
 * GET /api/smart/staff-optimization/cancellation-report
 */
router.get(
  '/staff-optimization/cancellation-report',
  authenticateToken,
  authorizeRole(['admin', 'staff']),
  async (req, res) => {
    await SmartFeaturesController.getCancellationReport(req, res);
  }
);

/**
 * Health check
 * GET /api/smart/status
 */
router.get('/status', async (req, res) => {
  await SmartFeaturesController.getFeaturesStatus(req, res);
});

module.exports = router;

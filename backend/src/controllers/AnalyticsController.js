/**
 * Analytics Controller
 * Endpoints para dashboard de analytics: receita, conversão, churn, CLV
 */

const express = require('express');
const router = express.Router();
const AnalyticsService = require('../services/AnalyticsService');

// GET /api/analytics/dashboard
router.get('/dashboard', (req, res) => {
  try {
    const dashboard = AnalyticsService.getDashboard();
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/bookings
router.get('/bookings', (req, res) => {
  const { period = 'month' } = req.query;
  const stats = AnalyticsService.getBookingStats(period);
  res.json(stats);
});

// GET /api/analytics/revenue
router.get('/revenue', (req, res) => {
  const { period = 'month' } = req.query;
  const stats = AnalyticsService.getRevenueStats(period);
  res.json(stats);
});

// GET /api/analytics/conversion
router.get('/conversion', (req, res) => {
  const stats = AnalyticsService.getConversionStats();
  res.json(stats);
});

// GET /api/analytics/clv
router.get('/clv', (req, res) => {
  const clvData = AnalyticsService.[REDACTED_TOKEN]();
  res.json(clvData);
});

// GET /api/analytics/churn
router.get('/churn', (req, res) => {
  const churnData = AnalyticsService.getChurnRate();
  res.json(churnData);
});

// GET /api/analytics/at-risk-customers
router.get('/at-risk-customers', (req, res) => {
  const atRisk = AnalyticsService.[REDACTED_TOKEN]();
  res.json(atRisk);
});

// POST /api/analytics/track-booking
router.post('/track-booking', (req, res) => {
  const bookingData = req.body;
  AnalyticsService.trackBooking('user123', bookingData);
  res.json({ tracked: true });
});

module.exports = router;

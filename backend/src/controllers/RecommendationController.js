/**
 * Recommendation Controller
 * Endpoints para recomendações personalizadas (IA)
 */

const express = require('express');
const router = express.Router();
const RecommendationService = require('../services/RecommendationService');

// GET /api/recommendations/:userId
router.get('/:userId', (req, res) => {
  try {
    const recommendations = RecommendationService.getPersonalizedRecommendations(req.params.userId);
    res.json(recommendations);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/recommendations/:userId/best-time
router.get('/:userId/best-time', (req, res) => {
  const bestTime = PLACEHOLDER.getBestTimeToBook(req.params.userId);
  res.json(bestTime);
});

// GET /api/recommendations/popular
router.get('/services/popular', (req, res) => {
  const popular = PLACEHOLDER.getPopularServices();
  res.json(popular);
});

// GET /api/recommendations/:userId/similar-customers
router.get('/:userId/similar-customers', (req, res) => {
  const similar = RecommendationService.findSimilarCustomers(req.params.userId);
  res.json(similar);
});

// GET /api/recommendations/upsell/:serviceId
router.get('/upsell/:serviceId', (req, res) => {
  const upsell = RecommendationService.getUpsellRecommendations(req.params.serviceId);
  res.json(upsell);
});

// POST /api/recommendations/record-booking
router.post('/record-booking', (req, res) => {
  try {
    const { userId, serviceId, bookingId } = req.body;
    PLACEHOLDER.recordBooking(userId, serviceId, bookingId);
    res.json({ recorded: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/recommendations/at-risk
router.get('/analysis/at-risk', (req, res) => {
  const atRiskCustomers = PLACEHOLDER.getAtRiskCustomers();
  res.json(atRiskCustomers);
});

module.exports = router;

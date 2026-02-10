/**
 * reviewRoutes.js - Endpoints de reviews e avaliações
 */

const express = require('express');
const router = express.Router();
const ReviewService = require('../services/ReviewService');
const { authenticateToken } = require('../middleware/auth');

/**
 * POST /api/reviews
 * Criar nova avaliação
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { bookingId, rating, comment, photos } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({
        success: false,
        error: 'bookingId e rating são obrigatórios'
      });
    }

    const result = await ReviewService.createReview(
      bookingId,
      req.user.id,
      rating,
      comment,
      photos || []
    );

    res.json(result);
  } catch (error) {
    console.error('Erro ao criar review:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/reviews?professionalId=1&minRating=4&limit=10&offset=0
 * Obter avaliações
 */
router.get('/', async (req, res) => {
  try {
    const { professionalId, minRating, limit = 10, offset = 0 } = req.query;

    const filter = {};
    if (professionalId) filter.professionalId = parseInt(professionalId);
    if (minRating) filter.minRating = parseInt(minRating);

    const data = await ReviewService.getReviews(filter, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      ...data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/reviews/stats/:professionalId
 * Obter estatísticas de avaliações
 */
router.get('/stats/:professionalId', async (req, res) => {
  try {
    const avgRating = await ReviewService.getAverageRating(
      parseInt(req.params.professionalId)
    );
    const distribution = await ReviewService.[REDACTED_TOKEN](
      parseInt(req.params.professionalId)
    );

    res.json({
      success: true,
      stats: {
        ...avgRating,
        distribution
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/reviews/:id/approve
 * Aprovar review (admin)
 */
router.patch('/:id/approve', authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Apenas admin pode aprovar reviews'
      });
    }

    const result = await ReviewService.approveReview(parseInt(req.params.id));
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

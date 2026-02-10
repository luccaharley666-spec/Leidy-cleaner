/**
 * Search Controller
 * Endpoints para busca avançada com filtros, trendlines, geolocalização
 */

const express = require('express');
const router = express.Router();
const SearchService = require('../services/SearchService');

// GET /api/search/services
router.get('/services', (req, res) => {
  try {
    const { query, city, minPrice, maxPrice, minRating, sortBy } = req.query;
    const result = SearchService.searchServices(
      query,
      { city, minPrice, maxPrice, minRating, sortBy }
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/search/autocomplete
router.get('/autocomplete', (req, res) => {
  const { query } = req.query;
  const suggestions = SearchService.[REDACTED_TOKEN](query || '');
  res.json({ suggestions });
});

// GET /api/search/category/:category
router.get('/category/:category', (req, res) => {
  const results = SearchService.searchByCategory(req.params.category);
  res.json({ results });
});

// GET /api/search/trends
router.get('/trends', (req, res) => {
  const trends = SearchService.getTrends();
  res.json({ trends });
});

// GET /api/search/location
router.get('/location', (req, res) => {
  const { latitude, longitude, radius } = req.query;
  const results = SearchService.searchByLocation(latitude, longitude, parseFloat(radius) || 10);
  res.json({ results });
});

// GET /api/search/popular
router.get('/popular', (req, res) => {
  const popular = SearchService.getPopularSearches();
  res.json({ popular });
});

// POST /api/search/compare
router.post('/compare', (req, res) => {
  const { serviceIds } = req.body;
  const comparison = SearchService.compareServices(serviceIds);
  res.json({ comparison });
});

module.exports = router;

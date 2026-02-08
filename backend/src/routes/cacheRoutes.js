const express = require('express');
const router = express.Router();
const CachedController = require('../controllers/CachedController');
const { authenticateToken } = require('../middleware/auth');

// Rota pública de exemplo cacheada
router.get('/sample', CachedController.getCachedSample);

// Estatísticas do cache (admin only)
router.get('/stats', authenticateToken, (req, res) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Permissão negada' });
  return CachedController.getCacheStats(req, res);
});

module.exports = router;

const CacheService = require('../services/CacheService');
const logger = require('../utils/logger');

const getCachedSample = async (req, res) => {
  try {
    const data = await CacheService.remember('sample:services:list', CacheService.TTL.SHORT, async () => {
      // Simular consulta cara ao DB — aqui apenas exemplo
      const result = [
        { id: 1, name: 'Corte de Cabelo', duration: 30 },
        { id: 2, name: 'Coloração', duration: 90 },
        { id: 3, name: 'Manicure', duration: 45 }
      ];
      return { services: result, fetchedAt: new Date() };
    });

    res.json({ success: true, cached: true, data });
  } catch (err) {
    logger.error('CachedController.getCachedSample error', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
};

const getCacheStats = (req, res) => {
  try {
    const stats = CacheService.getStats();
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  getCachedSample,
  getCacheStats
};

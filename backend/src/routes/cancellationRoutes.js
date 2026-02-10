const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const CancellationService = require('../services/CancellationService');

const router = express.Router();

// Cancelar agendamento
router.post('/cancel', authenticateToken, async (req, res) => {
  try {
    const { bookingId, reason, refundAmount } = req.body;
    const userId = req.user.id;

    const result = await CancellationService.cancelBooking(
      bookingId,
      userId,
      reason,
      refundAmount
    );

    res.json({ success: true, result });
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obter estatísticas de cancelamento
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await CancellationService.[REDACTED_TOKEN]();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

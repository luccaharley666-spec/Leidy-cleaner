const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const LoyaltyService = require('../services/LoyaltyService');

const router = express.Router();

// Obter saldo de pontos do usuário
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const points = await LoyaltyService.getUserPoints(userId);
    res.json({ success: true, points });
  } catch (error) {
    console.error('Erro ao obter saldo de pontos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obter recompensas disponíveis
router.get('/rewards', async (req, res) => {
  try {
    const rewards = await LoyaltyService.getRewards();
    res.json({ success: true, rewards });
  } catch (error) {
    console.error('Erro ao obter recompensas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Resgatar pontos por uma recompensa
router.post('/redeem', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { pointsToRedeem, rewardId } = req.body;

    const result = await LoyaltyService.redeemPoints(userId, pointsToRedeem, rewardId);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Erro ao resgatar pontos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Adicionar pontos (interna - chamada após booking bem-sucedido)
router.post('/add-points', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { points, reason, bookingId } = req.body;

    const result = await LoyaltyService.addPoints(userId, points, reason, bookingId);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Erro ao adicionar pontos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

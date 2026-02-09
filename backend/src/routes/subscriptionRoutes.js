const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const SubscriptionService = require('../services/SubscriptionService');

const router = express.Router();

// Obter planos disponíveis
router.get('/plans', async (req, res) => {
  try {
    const plans = await SubscriptionService.getPlans();
    res.json({ success: true, plans });
  } catch (error) {
    console.error('Erro ao obter planos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Criar subscrição
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { planId, stripePaymentMethod } = req.body;
    const userId = req.user.id;

    const result = await SubscriptionService.createSubscription(userId, planId, stripePaymentMethod);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Erro ao criar subscrição:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obter subscrição ativa do usuário
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const subscription = await SubscriptionService.getUserSubscription(userId);
    res.json({ success: true, subscription });
  } catch (error) {
    console.error('Erro ao obter subscrição:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cancelar subscrição
router.post('/cancel', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscriptionId } = req.body;

    const result = await SubscriptionService.cancelSubscription(subscriptionId);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Erro ao cancelar subscrição:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

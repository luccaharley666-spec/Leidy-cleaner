const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const ReferralService = require('../services/ReferralService');

const router = express.Router();

// Obter link de referência
router.get('/my-link', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const link = await ReferralService.getReferralLink(userId);
    res.json({ success: true, link });
  } catch (error) {
    console.error('Erro ao obter link:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Registrar novo referido
router.post('/register', async (req, res) => {
  try {
    const { referralCode, email, name, phone } = req.body;

    if (!referralCode || !email) {
      return res.status(400).json({ success: false, error: 'Código e email são obrigatórios' });
    }

    const result = await ReferralService.registerReferral(referralCode, email, name, phone);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Erro ao registrar referido:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obter estatísticas de referência
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await ReferralService.getReferralStats(userId);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Listar referidos
router.get('/referrals', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const referrals = await ReferralService.getReferralsList(userId);
    res.json({ success: true, referrals });
  } catch (error) {
    console.error('Erro ao listar referidos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sacar ganhos de referência
router.post('/withdraw', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Valor inválido' });
    }

    const result = await ReferralService.[REDACTED_TOKEN](userId, amount);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Erro ao sacar ganhos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obter saldo de ganhos
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const balance = await ReferralService.getReferralBalance(userId);
    res.json({ success: true, balance });
  } catch (error) {
    console.error('Erro ao obter saldo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

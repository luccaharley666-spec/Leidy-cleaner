/**
 * Referral Program Controller
 * Endpoints para programa de referências
 */

const express = require('express');
const router = express.Router();
const ReferralService = require('../services/ReferralService');

// POST /api/referrals/generate-code
router.post('/generate-code', async (req, res) => {
  try {
    const { userId } = req.body;
    const code = await ReferralService.generateReferralCode(userId);
    res.status(201).json(code);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/referrals/apply-code
router.post('/apply-code', async (req, res) => {
  try {
    const { referralCode, newUserId } = req.body;
    const referral = await ReferralService.applyReferralCode(referralCode, newUserId);
    res.status(201).json(referral);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/referrals/:referralId/confirm
router.post('/:referralId/confirm', async (req, res) => {
  try {
    const reward = await ReferralService.confirmReferralReward(req.params.referralId);
    res.json(reward);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/referrals/stats/:userId
router.get('/stats/:userId', async (req, res) => {
  try {
    const stats = await ReferralService.getReferralStats(req.params.userId);
    res.json(stats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/referrals/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const leaderboard = await ReferralService.getReferralLeaderboard(parseInt(limit));
    res.json(leaderboard);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/referrals/validate-code
router.post('/validate-code', async (req, res) => {
  try {
    const { code } = req.body;
    const validation = await ReferralService.validateReferralCode(code);
    res.json(validation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

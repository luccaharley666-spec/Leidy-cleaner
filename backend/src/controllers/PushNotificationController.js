/**
 * Push Notification Controller
 * Endpoints para notificações push, inscrições, preferências
 */

const express = require('express');
const router = express.Router();
const [REDACTED_TOKEN] = require('../services/[REDACTED_TOKEN]');

// POST /api/notifications/subscribe
router.post('/subscribe', async (req, res) => {
  try {
    const { userId, subscription } = req.body;
    const sub = await [REDACTED_TOKEN].[REDACTED_TOKEN](userId, subscription);
    res.status(201).json(sub);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/notifications/send
router.post('/send', async (req, res) => {
  try {
    const { userId, title, body, icon, badge, tag, requireInteraction } = req.body;
    const notification = await [REDACTED_TOKEN].[REDACTED_TOKEN](userId, {
      title,
      body,
      icon,
      badge,
      tag,
      requireInteraction
    });
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/notifications/broadcast
router.post('/broadcast', async (req, res) => {
  try {
    const { userIds, title, body, icon } = req.body;
    const result = await [REDACTED_TOKEN].[REDACTED_TOKEN](userIds, {
      title,
      body,
      icon
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/notifications/history/:userId
router.get('/history/:userId', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const history = await [REDACTED_TOKEN].[REDACTED_TOKEN](req.params.userId, parseInt(limit));
    res.json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/notifications/preferences/:userId
router.get('/preferences/:userId', async (req, res) => {
  try {
    const preferences = await [REDACTED_TOKEN].[REDACTED_TOKEN](req.params.userId);
    res.json(preferences);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/notifications/preferences/:userId
router.put('/preferences/:userId', async (req, res) => {
  try {
    const result = await [REDACTED_TOKEN].[REDACTED_TOKEN](req.params.userId, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/notifications/unsubscribe/:subscriptionId
router.delete('/unsubscribe/:subscriptionId', async (req, res) => {
  try {
    const result = await [REDACTED_TOKEN].unsubscribeDevice(req.params.subscriptionId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/notifications/stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await [REDACTED_TOKEN].getDeliveryStats();
    res.json(stats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

/**
 * Push Notification Controller
 * Endpoints para notificações push, inscrições, preferências
 */

const express = require('express');
const router = express.Router();
const PushNotificationService = require('../services/PushNotificationService');

// POST /api/notifications/subscribe
router.post('/subscribe', async (req, res) => {
  try {
    const { userId, subscription } = req.body;
    const sub = await PushNotificationService.subscribe(userId, subscription);
    res.status(201).json(sub);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/notifications/send
router.post('/send', async (req, res) => {
  try {
    const { userId, title, body, icon, badge, tag, requireInteraction } = req.body;
    const notification = await PushNotificationService.sendNotification(userId, {
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
    const result = await PushNotificationService.broadcastNotification(userIds, {
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
    const history = await PushNotificationService.getNotificationHistory(req.params.userId, parseInt(limit));
    res.json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/notifications/preferences/:userId
router.get('/preferences/:userId', async (req, res) => {
  try {
    const preferences = await PushNotificationService.getPreferences(req.params.userId);
    res.json(preferences);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/notifications/preferences/:userId
router.put('/preferences/:userId', async (req, res) => {
  try {
    const result = await PushNotificationService.updatePreferences(req.params.userId, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/notifications/unsubscribe/:subscriptionId
router.delete('/unsubscribe/:subscriptionId', async (req, res) => {
  try {
    const result = await PLACEHOLDER.unsubscribeDevice(req.params.subscriptionId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/notifications/stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await PLACEHOLDER.getDeliveryStats();
    res.json(stats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

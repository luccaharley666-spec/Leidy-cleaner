/**
 * Smart Notification Controller
 * Endpoints para notificações inteligentes multi-canal
 */

const express = require('express');
const router = express.Router();
const NotificationService = require('../services/NotificationService');

// POST /api/smart-notifications/send
router.post('/send', async (req, res) => {
  try {
    const { userId, message } = req.body;
    const notification = await NotificationService.sendNotification(userId, message);
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/smart-notifications/preferences/:userId
router.post('/preferences/:userId', async (req, res) => {
  try {
    const preferences = req.body;
    const result = await NotificationService.setUserPreferences(req.params.userId, preferences);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/smart-notifications/preferences/:userId
router.get('/preferences/:userId', (req, res) => {
  try {
    const preferences = NotificationService.getUserPreferences(req.params.userId);
    res.json(preferences);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/smart-notifications/ab-tests
router.post('/ab-tests', async (req, res) => {
  try {
    const { name, messageA, messageB } = req.body;
    const test = await NotificationService.createABTest({
      name,
      messageA,
      messageB
    });
    res.status(201).json(test);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/smart-notifications/:notificationId/interact
router.post('/:notificationId/interact', async (req, res) => {
  try {
    const { action = 'opened' } = req.body;
    const interaction = await NotificationService.trackNotificationInteraction(
      req.params.notificationId,
      action
    );
    res.json(interaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/smart-notifications/metrics/engagement
router.get('/metrics/engagement', async (req, res) => {
  try {
    const { timeWindow = 7 } = req.query;
    const metrics = await NotificationService.getEngagementMetrics(parseInt(timeWindow));
    res.json(metrics);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/smart-notifications/:userId/optimal-time
router.get('/:userId/optimal-time', async (req, res) => {
  try {
    const optimization = await NotificationService.optimizeSendTime(req.params.userId);
    res.json(optimization);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/smart-notifications/ab-tests/:testId/results
router.get('/ab-tests/:testId/results', async (req, res) => {
  try {
    const results = await NotificationService.getABTestResults(req.params.testId);
    res.json(results);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

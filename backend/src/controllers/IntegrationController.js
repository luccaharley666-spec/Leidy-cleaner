/**
 * Integration Controller
 * Manages integrations with external services (Google Calendar, WhatsApp, Slack, Telegram, etc)
 */

const express = require('express');
const integrationService = require('../services/IntegrationService');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * POST /integrations/google-calendar/sync
 * Sync booking with Google Calendar
 * @swagger
 * /integrations/google-calendar/sync:
 *   post:
 *     summary: Sync booking to Google Calendar
 *     tags: [Integrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *               accessToken: { type: string }
 *               bookingData: { type: object }
 *     responses:
 *       201:
 *         description: Event synced to Google Calendar
 */
router.post('/google-calendar/sync', async (req, res) => {
  try {
    const { userId, accessToken, bookingData } = req.body;

    if (!userId || !accessToken || !bookingData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await integrationService.syncGoogleCalendar(userId, accessToken, bookingData);

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    logger.error(`Google Calendar sync error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /integrations/outlook-calendar/sync
 * Sync booking with Outlook Calendar
 * @swagger
 * /integrations/outlook-calendar/sync:
 *   post:
 *     summary: Sync booking to Outlook Calendar
 *     tags: [Integrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *               accessToken: { type: string }
 *               bookingData: { type: object }
 *     responses:
 *       201:
 *         description: Event synced to Outlook Calendar
 */
router.post('/outlook-calendar/sync', async (req, res) => {
  try {
    const { userId, accessToken, bookingData } = req.body;

    if (!userId || !accessToken || !bookingData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await integrationService.syncOutlookCalendar(userId, accessToken, bookingData);

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    logger.error(`Outlook Calendar sync error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /integrations/whatsapp/send
 * Send WhatsApp notification
 * @swagger
 * /integrations/whatsapp/send:
 *   post:
 *     summary: Send WhatsApp notification
 *     tags: [Integrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber: { type: string }
 *               message: { type: string }
 *               templateId: { type: string }
 *     responses:
 *       201:
 *         description: WhatsApp message sent
 */
router.post('/whatsapp/send', async (req, res) => {
  try {
    const { phoneNumber, message, templateId } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await integrationService.[REDACTED_TOKEN](phoneNumber, message, templateId);

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    logger.error(`WhatsApp error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /integrations/slack/send
 * Send Slack notification
 * @swagger
 * /integrations/slack/send:
 *   post:
 *     summary: Send Slack notification
 *     tags: [Integrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               channelId: { type: string }
 *               message: { type: string }
 *               blocks: { type: array }
 *     responses:
 *       201:
 *         description: Slack message sent
 */
router.post('/slack/send', async (req, res) => {
  try {
    const { channelId, message, blocks } = req.body;

    if (!channelId || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await integrationService.[REDACTED_TOKEN](channelId, message, blocks);

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    logger.error(`Slack error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /integrations/telegram/send
 * Send Telegram notification
 * @swagger
 * /integrations/telegram/send:
 *   post:
 *     summary: Send Telegram notification
 *     tags: [Integrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatId: { type: string }
 *               message: { type: string }
 *               parseMode: { type: string }
 *     responses:
 *       201:
 *         description: Telegram message sent
 */
router.post('/telegram/send', async (req, res) => {
  try {
    const { chatId, message, parseMode = 'HTML' } = req.body;

    if (!chatId || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await integrationService.[REDACTED_TOKEN](chatId, message, parseMode);

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    logger.error(`Telegram error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /integrations/google-maps/search
 * Search locations on Google Maps
 * @swagger
 * /integrations/google-maps/search:
 *   post:
 *     summary: Search locations on Google Maps
 *     tags: [Integrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query: { type: string }
 *               location: { type: object, properties: { lat: { type: number }, lng: { type: number } } }
 *               radius: { type: number, default: 5000 }
 *     responses:
 *       200:
 *         description: Search results from Google Maps
 */
router.post('/google-maps/search', async (req, res) => {
  try {
    const { query, location, radius = 5000 } = req.body;

    if (!query || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const results = await integrationService.searchGoogleMaps(query, location, radius);

    res.json({ success: true, data: results });
  } catch (error) {
    logger.error(`Google Maps error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /integrations/zapier/webhook
 * Send event to Zapier
 * @swagger
 * /integrations/zapier/webhook:
 *   post:
 *     summary: Send event to Zapier webhook
 *     tags: [Integrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               webhookUrl: { type: string }
 *               data: { type: object }
 *     responses:
 *       201:
 *         description: Event sent to Zapier
 */
router.post('/zapier/webhook', async (req, res) => {
  try {
    const { webhookUrl, data } = req.body;

    if (!webhookUrl || !data) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await integrationService.sendToZapier(webhookUrl, data);

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    logger.error(`Zapier error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /integrations/user/:userId
 * Get user's active integrations
 * @swagger
 * /integrations/user/{userId}:
 *   get:
 *     summary: Get user's active integrations
 *     tags: [Integrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User's integrations
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const integrations = await integrationService.getUserIntegrations(userId);

    res.json({ success: true, data: integrations });
  } catch (error) {
    logger.error(`Get user integrations error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /integrations/logs/:userId
 * Get sync logs
 * @swagger
 * /integrations/logs/{userId}:
 *   get:
 *     summary: Get integration sync logs
 *     tags: [Integrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200:
 *         description: Sync logs
 */
router.get('/logs/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const logs = await integrationService.getSyncLogs(userId, parseInt(limit));

    res.json({ success: true, data: logs });
  } catch (error) {
    logger.error(`Get sync logs error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /integrations/stats/:userId
 * Get integration statistics
 * @swagger
 * /integrations/stats/{userId}:
 *   get:
 *     summary: Get integration statistics
 *     tags: [Integrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Integration statistics
 */
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await integrationService.getIntegrationStats(userId);

    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error(`Get integration stats error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

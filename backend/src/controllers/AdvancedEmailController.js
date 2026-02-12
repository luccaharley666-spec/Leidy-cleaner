/**
 * Advanced Email & SMS Controller
 * Template management, campaigns, A/B testing, engagement tracking
 */

const express = require('express');
const emailService = require('../services/AdvancedEmailService');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * POST /email/templates
 * Create email template
 * @swagger
 * /email/templates:
 *   post:
 *     summary: Create email template
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               subject: { type: string }
 *               content: { type: string }
 *               variables: { type: array, items: { type: string } }
 *               type: { type: string, enum: ['email', 'sms'] }
 *     responses:
 *       201:
 *         description: Template created
 */
router.post('/templates', async (req, res) => {
  try {
    const { name, subject, content, variables = [], type = 'email' } = req.body;

    if (!name || !subject || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const template = await emailService.createTemplate(name, subject, content, variables, type);

    res.status(201).json({ success: true, data: template });
  } catch (error) {
    logger.error(`Create template error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /email/templates
 * Get all templates
 * @swagger
 * /email/templates:
 *   get:
 *     summary: Get all email templates
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of templates
 */
router.get('/templates', async (req, res) => {
  try {
    const templates = await emailService.getTemplates();
    res.json({ success: true, data: templates });
  } catch (error) {
    logger.error(`Get templates error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /email/templates/:templateId
 * Update template
 * @swagger
 * /email/templates/{templateId}:
 *   patch:
 *     summary: Update email template
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200:
 *         description: Template updated
 */
router.patch('/templates/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    const template = await emailService.updateTemplate(templateId, req.body);

    res.json({ success: true, data: template });
  } catch (error) {
    logger.error(`Update template error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /email/send
 * Send email immediately
 * @swagger
 * /email/send:
 *   post:
 *     summary: Send email immediately
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templateId: { type: string }
 *               recipientEmail: { type: string }
 *               variables: { type: object }
 *     responses:
 *       201:
 *         description: Email sent
 */
router.post('/send', async (req, res) => {
  try {
    const { templateId, recipientEmail, variables = {} } = req.body;

    if (!templateId || !recipientEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const email = await emailService.sendEmail(templateId, recipientEmail, variables);

    res.status(201).json({ success: true, data: email });
  } catch (error) {
    logger.error(`Send email error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /email/schedule
 * Schedule email for later
 * @swagger
 * /email/schedule:
 *   post:
 *     summary: Schedule email
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templateId: { type: string }
 *               recipientEmail: { type: string }
 *               scheduledTime: { type: string, format: date-time }
 *               variables: { type: object }
 *     responses:
 *       201:
 *         description: Email scheduled
 */
router.post('/schedule', async (req, res) => {
  try {
    const { templateId, recipientEmail, scheduledTime, variables = {} } = req.body;

    if (!templateId || !recipientEmail || !scheduledTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const schedule = await emailService.scheduleEmail(
      templateId,
      recipientEmail,
      scheduledTime,
      variables
    );

    res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    logger.error(`Schedule email error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /email/sms
 * Send SMS
 * @swagger
 * /email/sms:
 *   post:
 *     summary: Send SMS
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templateId: { type: string }
 *               phoneNumber: { type: string }
 *               variables: { type: object }
 *     responses:
 *       201:
 *         description: SMS sent
 */
router.post('/sms', async (req, res) => {
  try {
    const { templateId, phoneNumber, variables = {} } = req.body;

    if (!templateId || !phoneNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sms = await emailService.sendSMS(templateId, phoneNumber, variables);

    res.status(201).json({ success: true, data: sms });
  } catch (error) {
    logger.error(`Send SMS error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /email/campaigns
 * Create drip campaign
 * @swagger
 * /email/campaigns:
 *   post:
 *     summary: Create drip campaign
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               steps: { type: array }
 *     responses:
 *       201:
 *         description: Campaign created
 */
router.post('/campaigns', async (req, res) => {
  try {
    const { name, steps = [] } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Campaign name required' });
    }

    const campaign = await emailService.createDripCampaign(name, steps);

    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    logger.error(`Create campaign error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /email/campaigns
 * Get all campaigns
 * @swagger
 * /email/campaigns:
 *   get:
 *     summary: Get all campaigns
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of campaigns
 */
router.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await emailService.getCampaigns();
    res.json({ success: true, data: campaigns });
  } catch (error) {
    logger.error(`Get campaigns error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /email/campaigns/:campaignId/publish
 * Publish campaign
 * @swagger
 * /email/campaigns/{campaignId}/publish:
 *   post:
 *     summary: Publish drip campaign
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Campaign published
 */
router.post('/campaigns/:campaignId/publish', async (req, res) => {
  try {
    const { campaignId } = req.params;

    const campaign = await emailService.publishDripCampaign(campaignId);

    res.json({ success: true, data: campaign });
  } catch (error) {
    logger.error(`Publish campaign error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /email/campaigns/:campaignId/bulk
 * Send bulk email for campaign
 * @swagger
 * /email/campaigns/{campaignId}/bulk:
 *   post:
 *     summary: Send bulk email
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipients: { type: array }
 *               templateId: { type: string }
 *               variables: { type: object }
 *     responses:
 *       200:
 *         description: Bulk email sent
 */
router.post('/campaigns/:campaignId/bulk', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { recipients, templateId, variables = {} } = req.body;

    if (!recipients || !templateId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const results = await emailService.sendBulkEmail(
      campaignId,
      recipients,
      templateId,
      variables
    );

    res.json({ success: true, data: { sent: results.length, results } });
  } catch (error) {
    logger.error(`Bulk email error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /email/ab-test
 * Create A/B test
 * @swagger
 * /email/ab-test:
 *   post:
 *     summary: Create A/B test
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               templateIdA: { type: string }
 *               templateIdB: { type: string }
 *               sampleSize: { type: number }
 *     responses:
 *       201:
 *         description: A/B test created
 */
router.post('/ab-test', async (req, res) => {
  try {
    const { name, templateIdA, templateIdB, sampleSize = 0.5 } = req.body;

    if (!name || !templateIdA || !templateIdB) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const test = await emailService.createABTest(name, templateIdA, templateIdB, sampleSize);

    res.status(201).json({ success: true, data: test });
  } catch (error) {
    logger.error(`A/B test creation error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /email/ab-test/:testId/results
 * Get A/B test results
 * @swagger
 * /email/ab-test/{testId}/results:
 *   get:
 *     summary: Get A/B test results
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: testId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: A/B test results
 */
router.get('/ab-test/:testId/results', async (req, res) => {
  try {
    const { testId } = req.params;

    const results = await emailService.getABTestResults(testId);

    res.json({ success: true, data: results });
  } catch (error) {
    logger.error(`Get A/B test results error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /email/track/open
 * Track email open
 * @swagger
 * /email/track/open:
 *   post:
 *     summary: Track email open
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailId: { type: string }
 *     responses:
 *       200:
 *         description: Open tracked
 */
router.post('/track/open', async (req, res) => {
  try {
    const { emailId } = req.body;

    if (!emailId) {
      return res.status(400).json({ error: 'Email ID required' });
    }

    const email = await emailService.trackOpen(emailId);

    res.json({ success: true, data: email });
  } catch (error) {
    logger.error(`Track open error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /email/track/click
 * Track email click
 * @swagger
 * /email/track/click:
 *   post:
 *     summary: Track email click
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailId: { type: string }
 *               linkUrl: { type: string }
 *     responses:
 *       200:
 *         description: Click tracked
 */
router.post('/track/click', async (req, res) => {
  try {
    const { emailId, linkUrl } = req.body;

    if (!emailId || !linkUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const email = await emailService.trackClick(emailId, linkUrl);

    res.json({ success: true, data: email });
  } catch (error) {
    logger.error(`Track click error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /email/engagement
 * Get engagement logs
 * @swagger
 * /email/engagement:
 *   get:
 *     summary: Get engagement logs
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200:
 *         description: Engagement logs
 */
router.get('/engagement', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const logs = await emailService.getEngagementLogs({}, parseInt(limit));

    res.json({ success: true, data: logs });
  } catch (error) {
    logger.error(`Get engagement error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /email/campaigns/:campaignId/stats
 * Get campaign statistics
 * @swagger
 * /email/campaigns/{campaignId}/stats:
 *   get:
 *     summary: Get campaign statistics
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Campaign statistics
 */
router.get('/campaigns/:campaignId/stats', async (req, res) => {
  try {
    const { campaignId } = req.params;

    const stats = await emailService.getCampaignStats(campaignId);

    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error(`Campaign stats error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

/**
 * Advanced Payment Controller
 * Handles Boleto, Apple Pay, Google Pay, PayPal, and Subscriptions
 */

const express = require('express');
const paymentService = require('../services/[REDACTED_TOKEN]');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * POST /payments/boleto
 * Create Boleto payment
 * @swagger
 * /payments/boleto:
 *   post:
 *     summary: Create Boleto payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId: { type: string }
 *               amount: { type: number }
 *               dueDate: { type: string, format: date }
 *     responses:
 *       201:
 *         description: Boleto created
 */
router.post('/boleto', async (req, res) => {
  try {
    const { bookingId, amount, dueDate } = req.body;

    if (!bookingId || !amount || !dueDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const payment = await paymentService.createBoletoPayment(bookingId, amount, dueDate);

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    logger.error(`Boleto error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /payments/apple-pay
 * Create Apple Pay payment
 * @swagger
 * /payments/apple-pay:
 *   post:
 *     summary: Create Apple Pay payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId: { type: string }
 *               amount: { type: number }
 *               applePayToken: { type: string }
 *     responses:
 *       201:
 *         description: Apple Pay processed
 */
router.post('/apple-pay', async (req, res) => {
  try {
    const { bookingId, amount, applePayToken } = req.body;

    if (!bookingId || !amount || !applePayToken) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const payment = await paymentService.[REDACTED_TOKEN](bookingId, amount, applePayToken);

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    logger.error(`Apple Pay error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /payments/google-pay
 * Create Google Pay payment
 * @swagger
 * /payments/google-pay:
 *   post:
 *     summary: Create Google Pay payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId: { type: string }
 *               amount: { type: number }
 *               googlePayToken: { type: string }
 *     responses:
 *       201:
 *         description: Google Pay processed
 */
router.post('/google-pay', async (req, res) => {
  try {
    const { bookingId, amount, googlePayToken } = req.body;

    if (!bookingId || !amount || !googlePayToken) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const payment = await paymentService.[REDACTED_TOKEN](bookingId, amount, googlePayToken);

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    logger.error(`Google Pay error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /payments/paypal
 * Initiate PayPal payment
 * @swagger
 * /payments/paypal:
 *   post:
 *     summary: Initiate PayPal payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId: { type: string }
 *               amount: { type: number }
 *               returnUrl: { type: string }
 *               cancelUrl: { type: string }
 *     responses:
 *       201:
 *         description: PayPal approval URL generated
 */
router.post('/paypal', async (req, res) => {
  try {
    const { bookingId, amount, returnUrl, cancelUrl } = req.body;

    if (!bookingId || !amount || !returnUrl || !cancelUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const payment = await paymentService.createPayPalPayment(bookingId, amount, returnUrl, cancelUrl);

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    logger.error(`PayPal error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /payments/paypal/:paymentId/execute
 * Execute PayPal payment
 * @swagger
 * /payments/paypal/{paymentId}/execute:
 *   post:
 *     summary: Execute PayPal payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200:
 *         description: PayPal payment executed
 */
router.post('/paypal/:paymentId/execute', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const payment = await paymentService.[REDACTED_TOKEN](paymentId, { email });

    res.json({ success: true, data: payment });
  } catch (error) {
    logger.error(`PayPal execution error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /subscriptions
 * Create subscription
 * @swagger
 * /subscriptions:
 *   post:
 *     summary: Create subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId: { type: string }
 *               planId: { type: string }
 *               planName: { type: string }
 *               amount: { type: number }
 *               interval: { type: string, enum: ['weekly', 'monthly', 'yearly'] }
 *     responses:
 *       201:
 *         description: Subscription created
 */
router.post('/subscriptions', async (req, res) => {
  try {
    const { customerId, planId, planName, amount, interval = 'monthly' } = req.body;

    if (!customerId || !planId || !planName || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const subscription = await paymentService.createSubscription(
      customerId,
      planId,
      planName,
      amount,
      interval
    );

    res.status(201).json({ success: true, data: subscription });
  } catch (error) {
    logger.error(`Subscription creation error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /subscriptions/:subscriptionId
 * Get subscription
 * @swagger
 * /subscriptions/{subscriptionId}:
 *   get:
 *     summary: Get subscription details
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Subscription details
 */
router.get('/subscriptions/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await paymentService.getSubscription(subscriptionId);

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json({ success: true, data: subscription });
  } catch (error) {
    logger.error(`Get subscription error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /subscriptions/:subscriptionId
 * Update subscription
 * @swagger
 * /subscriptions/{subscriptionId}:
 *   patch:
 *     summary: Update subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200:
 *         description: Subscription updated
 */
router.patch('/subscriptions/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const subscription = await paymentService.updateSubscription(subscriptionId, req.body);

    res.json({ success: true, data: subscription });
  } catch (error) {
    logger.error(`Update subscription error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /subscriptions/:subscriptionId
 * Cancel subscription
 * @swagger
 * /subscriptions/{subscriptionId}:
 *   delete:
 *     summary: Cancel subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Subscription cancelled
 */
router.delete('/subscriptions/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { reason } = req.body;

    const subscription = await paymentService.cancelSubscription(subscriptionId, reason);

    res.json({ success: true, data: subscription });
  } catch (error) {
    logger.error(`Cancel subscription error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /subscriptions/:subscriptionId/billing
 * Process subscription billing
 * @swagger
 * /subscriptions/{subscriptionId}/billing:
 *   post:
 *     summary: Process subscription billing
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Billing processed
 */
router.post('/subscriptions/:subscriptionId/billing', async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const payment = await paymentService.[REDACTED_TOKEN](subscriptionId);

    res.json({ success: true, data: payment });
  } catch (error) {
    logger.error(`Billing process error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /payments/stats
 * Get payment statistics
 * @swagger
 * /payments/stats:
 *   get:
 *     summary: Get payment statistics
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await paymentService.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error(`Stats error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

/**
 * Payment Integration Controller
 * Endpoints para pagamentos: Stripe, PIX, reembolsos, reconciliação
 */

const express = require('express');
const router = express.Router();
const PaymentIntegrationService = require('../services/PaymentIntegrationService');

// POST /api/payments/stripe
router.post('/stripe', async (req, res) => {
  try {
    const { amount, customerId, description, receiptEmail } = req.body;
    const charge = await PLACEHOLDER.createStripePayment({
      amount,
      customerId,
      description,
      receiptEmail
    });
    res.status(201).json(charge);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/payments/pix
router.post('/pix', async (req, res) => {
  try {
    const { amount, customerId, orderId } = req.body;
    const payment = await PLACEHOLDER.createPixPayment({
      amount,
      customerId,
      orderId
    });
    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/payments/webhook
router.post('/webhook', async (req, res) => {
  try {
    // Validar assinatura do Stripe (importante para segurança)
    const signature = req.headers['stripe-signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body);
    
    const result = await PLACEHOLDER.processWebhook(req.body, signature, rawBody);
    res.json(result);
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/payments/:chargeId/refund
router.post('/:chargeId/refund', async (req, res) => {
  try {
    const { amount } = req.body;
    const refund = await PLACEHOLDER.requestRefund(req.params.chargeId, amount);
    res.status(201).json(refund);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/payments/:chargeId
router.get('/:chargeId', async (req, res) => {
  try {
    const status = await PLACEHOLDER.getPaymentStatus(req.params.chargeId);
    res.json(status);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// GET /api/payments/customer/:customerId/history
router.get('/customer/:customerId/history', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const history = await PLACEHOLDER.getPaymentHistory(req.params.customerId, parseInt(limit));
    res.json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/payments/reconcile
router.post('/reconcile', async (req, res) => {
  try {
    const result = await PLACEHOLDER.reconcilePayments();
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

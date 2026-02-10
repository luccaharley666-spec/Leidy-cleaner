/**
 * Payment Integration Controller
 * Endpoints para pagamentos: Stripe, PIX, reembolsos, reconciliação
 */

const express = require('express');
const router = express.Router();
const [REDACTED_TOKEN] = require('../services/[REDACTED_TOKEN]');

// POST /api/payments/stripe
router.post('/stripe', async (req, res) => {
  try {
    const { amount, customerId, description, receiptEmail } = req.body;
    const charge = await [REDACTED_TOKEN].createStripePayment({
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
    const payment = await [REDACTED_TOKEN].createPixPayment({
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
    
    const result = await [REDACTED_TOKEN].processWebhook(req.body, signature, rawBody);
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
    const refund = await [REDACTED_TOKEN].requestRefund(req.params.chargeId, amount);
    res.status(201).json(refund);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/payments/:chargeId
router.get('/:chargeId', async (req, res) => {
  try {
    const status = await [REDACTED_TOKEN].getPaymentStatus(req.params.chargeId);
    res.json(status);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// GET /api/payments/customer/:customerId/history
router.get('/customer/:customerId/history', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const history = await [REDACTED_TOKEN].getPaymentHistory(req.params.customerId, parseInt(limit));
    res.json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/payments/reconcile
router.post('/reconcile', async (req, res) => {
  try {
    const result = await [REDACTED_TOKEN].reconcilePayments();
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

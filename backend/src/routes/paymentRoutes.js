/**
 * paymentRoutes.js - Stripe Payment Endpoints
 */

const express = require('express');
const router = express.Router();
const PaymentService = require('../services/PaymentService');
const [REDACTED_TOKEN] = require('../services/[REDACTED_TOKEN]');
const { authenticateToken } = require('../middleware/auth');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database
const DB_PATH = path.join(__dirname, '../../backend_data/database.db');

/**
 * POST /api/payments/create-checkout
 * Criar sessão de checkout Stripe
 */
router.post('/create-checkout', authenticateToken, async (req, res) => {
  try {
    const { hourPackage } = req.body;
    const userId = req.user.id;

    // Validar pacote
    const packages = [REDACTED_TOKEN].[REDACTED_TOKEN]();
    const selectedPackage = packages.find(p => p.hours === parseInt(hourPackage));

    if (!selectedPackage) {
      return res.status(400).json({
        success: false,
        error: 'Pacote de horas inválido'
      });
    }

    // Criar sessão Stripe
    const checkout = await PaymentService.[REDACTED_TOKEN](
      userId,
      hourPackage,
      selectedPackage.totalPrice
    );

    if (!checkout.success) {
      return res.status(400).json(checkout);
    }

    res.json({
      success: true,
      sessionId: checkout.sessionId,
      sessionUrl: checkout.sessionUrl
    });
  } catch (error) {
    console.error('Erro ao criar checkout:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/payments/session/:sessionId
 * Recuperar status da sessão
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const session = await PaymentService.getCheckoutSession(req.params.sessionId);

    res.json({
      success: true,
      status: session.payment_status,
      amount: session.amount_total / 100,
      metadata: session.metadata
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/payments/webhook
 * Webhook Stripe - Processar pagamentos
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const event = PaymentService.[REDACTED_TOKEN](req.body, signature);

    console.log('🔔 Webhook Stripe recebido:', event.type);

    // Processar evento de pagamento bem-sucedido
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Validar se realmente foi pago
      const isPaid = await PaymentService.[REDACTED_TOKEN](session.id);
      if (!isPaid) {
        console.log('❌ Pagamento não confirmado ainda');
        return res.status(200).json({ received: true });
      }

      const userId = parseInt(session.metadata.userId);
      const hourPackage = parseInt(session.metadata.hourPackage);
      const amount = session.amount_total / 100;

      // Adicionar crédito de horas ao usuário
      await [REDACTED_TOKEN].addUserHourCredit(
        userId,
        hourPackage,
        `Compra de ${hourPackage}h - Transação Stripe ${session.id}`,
        amount
      );

      // Registrar transação no banco
      const db = new sqlite3.Database(DB_PATH);
      db.run(
        `INSERT INTO user_hour_credits 
         (user_id, hour_package_id, purchased_at, expires_at, amount_paid, stripe_session_id, status)
         VALUES (?, ?, datetime('now'), datetime('now', '+365 days'), ?, ?, 'completed')`,
        [userId, hourPackage, amount, session.id],
        (err) => {
          if (err) console.error('Erro ao registrar transação:', err);
          else console.log('✅ Horas creditadas:', userId, hourPackage);
          db.close();
        }
      );
    }

    // Processar evento de pagamento falhado
    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      console.log('⏱️ Sessão expirada:', session.id);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Erro no webhook:', error.message);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/payments/transactions
 * Listar transações do usuário
 */
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const sessions = await PaymentService.getUserTransactions(req.user.id);

    const transactions = sessions.map(s => ({
      sessionId: s.id,
      date: new Date(s.created * 1000).toLocaleDateString('pt-BR'),
      amount: s.amount_total / 100,
      status: s.payment_status,
      hourPackage: s.metadata?.hourPackage,
      type: 'Compra de Horas'
    }));

    res.json({
      success: true,
      total: transactions.length,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/payments/refund
 * Solicitar reembolso
 */
router.post('/refund', authenticateToken, async (req, res) => {
  try {
    const { sessionId, reason } = req.body;

    // Verificar se a sessão pertence ao usuário
    const session = await PaymentService.getCheckoutSession(sessionId);
    if (session.metadata?.userId !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Não autorizado'
      });
    }

    // Criar refund
    const refund = await PaymentService.createRefund(
      session.payment_intent,
      reason || '[REDACTED_TOKEN]'
    );

    res.json(refund);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

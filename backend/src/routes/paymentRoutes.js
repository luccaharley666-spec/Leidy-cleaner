/**
 * paymentRoutes.js - Stripe Payment Endpoints
 */

const express = require('express');
const router = express.Router();
// const PaymentService = require('../services/PaymentService');
// const PLACEHOLDER = require('../services/PLACEHOLDER');
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
    const packages = PricingService.getHourPackages();
    const selectedPackage = packages.find(p => p.hours === parseInt(hourPackage));

    if (!selectedPackage) {
      return res.status(400).json({
        success: false,
        error: 'Pacote de horas inválido'
      });
    }

    // Criar sessão Stripe
    const checkout = await PaymentService.createStripeCheckout(
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
 * Webhook Stripe - Processar pagamentos com validação HMAC-SHA256
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];
  
  if (!signature) {
    console.error('❌ Webhook sem stripe-signature header');
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  try {
    // Validar assinatura HMAC
    const StripeService = require('../services/StripeService');
    let event;
    try {
      event = StripeService.constructEvent(req.body, signature);
    } catch (err) {
      if (err.statusCode === 401) {
        console.error('❌ Assinatura Stripe inválida (HMAC falhou)');
        return res.status(401).json({ error: 'Invalid signature' });
      }
      throw err;
    }

    console.log('🔔 Webhook Stripe validado:', event.type);

    // Processar evento de pagamento bem-sucedido
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const bookingId = paymentIntent.metadata?.bookingId;
      const userId = paymentIntent.metadata?.userId;
      
      if (bookingId && userId) {
        console.log(`✅ Pagamento confirmado: booking ${bookingId}, user ${userId}`);
        // TODO: Atualizar status do agendamento no banco como "confirmado"
      }
    }

    if (event.type === 'charge.failed') {
      const charge = event.data.object;
      console.error(`❌ Pagamento falhou: ${charge.id}`);
      // TODO: Notificar usuário sobre falha
    }

    // Retornar 200 para Stripe reconhecer recebimento
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Erro no webhook Stripe:', error.message);
    // Sempre retornar 200 para Stripe não ficar retentando (evita DDoS)
    res.status(200).json({ received: true, error: error.message });
  }
};
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
      reason || 'PLACEHOLDER'
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

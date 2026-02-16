/**
 * PaymentService.js
 * Camada de negócio acima do Stripe (cria sessão, recupera sessão, reembolsos)
 * Modelo: pagamento por booking (bookingId + amount), sem pacotes
 */

const logger = require('../utils/logger');

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;

const isStripeConfigured = Boolean(STRIPE_KEY);

let stripe = null;
if (isStripeConfigured) {
  try {
    stripe = require('stripe')(STRIPE_KEY);
  } catch (err) {
    logger.error('Erro ao inicializar Stripe:', err.message);
    stripe = null;
  }
}

/**
 * Criar sessão de checkout Stripe para pagamento por booking
 * @param {string} userId - ID do usuário
 * @param {string} bookingId - ID da faxinha/booking
 * @param {number} amountReais - Valor em reais
 */
async function createStripeCheckout(userId, bookingId, amountReais) {
  if (!stripe) {
    logger.warn('Stripe não configurado: retornando sessão mock');
    const mockId = `sess_mock_${Date.now()}`;
    return {
      success: true,
      sessionId: mockId,
      sessionUrl: `http://localhost:3000/mock-checkout?sessionId=${mockId}`,
    };
  }

  const priceCents = Math.round(Number(amountReais) * 100);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Pagamento por faxinha #${bookingId}`,
              description: `Booking ${bookingId} - Serviço de limpeza`,
            },
            unit_amount: priceCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.BASE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL || 'http://localhost:3000'}/hour-checkout`,
      metadata: {
        userId: String(userId),
        bookingId: String(bookingId),
      },
    });

    return {
      success: true,
      sessionId: session.id,
      sessionUrl: session.url,
    };
  } catch (err) {
    logger.error('Erro createStripeCheckout', { error: err.message });
    return { success: false, error: err.message };
  }
}

/**
 * Recuperar informações da sessão de checkout
 * @param {string} sessionId - ID da sessão Stripe
 */
async function getCheckoutSession(sessionId) {
  if (!stripe) {
    // retorno mock para desenvolvimento
    return {
      id: sessionId,
      payment_status: 'paid',
      amount_total: 0,
      metadata: {},
    };
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });
    return session;
  } catch (err) {
    throw new Error(err.message || 'Erro ao recuperar sessão Stripe');
  }
}

/**
 * Listar transações de um usuário
 * @param {string} userId - ID do usuário
 */
async function getUserTransactions(userId) {
  if (!stripe) return [];

  try {
    const sessions = await stripe.checkout.sessions.list({ limit: 100 });
    const filtered = sessions.data.filter((s) => s.metadata?.userId === String(userId));
    return filtered;
  } catch (err) {
    logger.error('Erro getUserTransactions', { error: err.message });
    return [];
  }
}

/**
 * Criar reembolso para um payment intent
 * @param {string} paymentIntentId - ID do payment intent
 * @param {string} reason - Motivo do reembolso
 */
async function createRefund(paymentIntentId, reason = 'requested_by_customer') {
  if (!stripe) throw new Error('Stripe not configured');

  try {
    const refund = await stripe.refunds.create({ payment_intent: paymentIntentId, reason });
    return refund;
  } catch (err) {
    throw new Error(err.message || 'Erro ao criar refund');
  }
}

module.exports = {
  createStripeCheckout,
  getCheckoutSession,
  getUserTransactions,
  createRefund,
};

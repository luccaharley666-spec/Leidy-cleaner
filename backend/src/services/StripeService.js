const Stripe = require('stripe');
const logger = require('../utils/logger');

if (!process.env.STRIPE_SECRET_KEY) {
  logger.warn('STRIPE_SECRET_KEY não definido. PaymentService funcionará em modo mock.');
}

const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;

async function processPayment(paymentMethodId, amountInReais, bookingId = null) {
  if (!stripe) {
    logger.warn('Stripe não configurado, simulando pagamento (modo dev).');
    return {
      success: true,
      id: `pi_mock_${Date.now()}`,
      status: 'succeeded',
      amount: amountInReais,
      last4: '0000'
    };
  }

  const amountInCents = Math.round(amountInReais * 100);
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'brl',
      payment_method: paymentMethodId,
      confirm: true,
      metadata: {
        bookingId: bookingId || 'unknown',
        created_at: new Date().toISOString()
      }
    });

    return {
      success: paymentIntent.status === 'succeeded',
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: amountInReais,
      last4: paymentIntent.charges?.data?.[0]?.payment_method_details?.card?.last4 || null,
      clientSecret: paymentIntent.client_secret
    };
  } catch (err) {
    logger.error('Stripe processPayment error', { error: err.message });
    return { success: false, error: err.message };
  }
}

async function refundPayment(stripePaymentId) {
  if (!stripe) throw new Error('Stripe not configured');
  const refund = await stripe.refunds.create({ payment_intent: stripePaymentId });
  return refund;
}

function constructEvent(body, signature) {
  if (!stripe) throw new Error('Stripe not configured');
  return stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
}

module.exports = {
  processPayment,
  refundPayment,
  constructEvent
};

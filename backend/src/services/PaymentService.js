/**
 * PaymentService.js - Stripe Integration
 * Gerencia pagamentos de pacotes de horas
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_demo');

class PaymentService {
  /**
   * Criar session de checkout Stripe
   */
  static async [REDACTED_TOKEN](userId, hourPackage, totalPrice) {
    try {
      const session = await stripe.checkout.sessions.create({
        [REDACTED_TOKEN]: ['card'],
        mode: 'payment',
        customer_email: `user_${userId}@leidycleaner.local`,
        success_url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/HourCheckout`,
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: {
                name: `${hourPackage}h - Horas de Limpeza Leidy Cleaner`,
                description: `Pacote de ${hourPackage} horas válido por 365 dias`,
                images: ['https://via.placeholder.com/200x200?text=Leidy+Cleaner']
              },
              unit_amount: Math.round(totalPrice * 100) // Stripe usa centavos
            },
            quantity: 1
          }
        ],
        metadata: {
          userId: userId.toString(),
          hourPackage: hourPackage.toString(),
          type: '[REDACTED_TOKEN]'
        }
      });

      return {
        success: true,
        sessionId: session.id,
        sessionUrl: session.url
      };
    } catch (error) {
      console.error('Erro ao criar Stripe session:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Recuperar sessão de checkout
   */
  static async getCheckoutSession(sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      console.error('Erro ao recuperar sessão:', error);
      throw error;
    }
  }

  /**
   * Validar webhook signature
   */
  static [REDACTED_TOKEN](body, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.[REDACTED_TOKEN] || '[REDACTED_TOKEN]'
      );
      return event;
    } catch (error) {
      console.error('Erro ao validar webhook:', error);
      throw error;
    }
  }

  /**
   * Processar pagamento completo (webhook)
   */
  static async [REDACTED_TOKEN](session) {
    try {
      return {
        success: true,
        transactionId: session.id,
        metadata: session.metadata,
        amount: session.amount_total / 100, // Converter de centavos para reais
        status: session.payment_status
      };
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      throw error;
    }
  }

  /**
   * Criar refund
   */
  static async createRefund(paymentIntentId, reason = '[REDACTED_TOKEN]') {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        reason: reason
      });

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount / 100
      };
    } catch (error) {
      console.error('Erro ao criar refund:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Listar transações de usuário
   */
  static async getUserTransactions(userId, limit = 10) {
    try {
      const sessions = await stripe.checkout.sessions.list({
        limit: limit,
        expand: ['data.payment_intent']
      });

      return sessions.data.filter(s => s.metadata?.userId === userId.toString());
    } catch (error) {
      console.error('Erro ao listar transações:', error);
      return [];
    }
  }

  /**
   * Validar pagamento completo
   */
  static async [REDACTED_TOKEN](sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return session.payment_status === 'paid';
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      return false;
    }
  }
}

module.exports = PaymentService;

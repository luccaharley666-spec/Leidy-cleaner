/**
 * Payment Integration Service
 * Stripe, PIX, cartão de crédito, webhooks, reconciliação
 */

const logger = require('../utils/logger');
const PixService = require('./PixService');

class [REDACTED_TOKEN] {
  constructor() {
    this.transactions = new Map();
    this.webhooks = [];
  }

  /**
   * Criar pagamento via Stripe
   */
  async createStripePayment(paymentData) {
    try {
      const {
        amount,
        currency = 'BRL',
        customerId,
        description,
        receiptEmail,
        metadata = {}
      } = paymentData;

      // Simulado: em produção usar stripe.charges.create()
      const chargeId = `ch_${Date.now()}`;
      const charge = {
        id: chargeId,
        amount: (amount * 100).toFixed(0), // Em centavos
        currency,
        customerId,
        description,
        receiptEmail,
        metadata,
        status: 'succeeded',
        createdAt: new Date(),
        receiptUrl: `https://receipts.stripe.com/${chargeId}`
      };

      this.transactions.set(chargeId, charge);

      logger.log({
        level: 'info',
        message: 'Payment created',
        chargeId,
        amount: `${(amount / 100).toFixed(2)} ${currency}`
      });

      return charge;
    } catch (error) {
      logger.error('Payment creation failed', { error: error.message });
      throw error;
    }
  }

  /**
   ✅ NOVO: Criar pagamento via PIX
   */
  async createPixPayment(paymentData) {
    const {
      amount,
      customerId,
      orderId,
      expiresIn = 3600 // 1 hora
    } = paymentData;

    const pixPayment = {
      id: `pix_${Date.now()}`,
      qrCode: `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substr(2, 36)}`,
      qrCodeUrl: `https://api.example.com/qr/${Math.random().toString(36).substr(2, 9)}`,
      amount: amount.toFixed(2),
      customerId,
      orderId,
      status: 'pending',
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      createdAt: new Date()
    };

    this.transactions.set(pixPayment.id, pixPayment);

    logger.log({
      level: 'info',
      message: 'PIX payment created',
      pixId: pixPayment.id,
      amount: `R$ ${amount.toFixed(2)}`
    });

    return pixPayment;
  }

  /**
   ✅ NOVO: Processar webhook do Stripe com validação HMAC
   */
  async processWebhook(event, signature = null, rawBody = null) {
    try {
      // Validar signature do Stripe se fornecida
      if (signature && rawBody) {
        try {
          const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_demo');
          const validatedEvent = stripe.webhooks.constructEvent(
            rawBody instanceof Buffer ? rawBody : Buffer.from(rawBody),
            signature,
            process.env.[REDACTED_TOKEN] || '[REDACTED_TOKEN]'
          );
          // Se validação passou, usar o evento validado
          Object.assign(event, validatedEvent);
        } catch (err) {
          if (process.env.NODE_ENV === 'production') {
            logger.error('Invalid webhook signature', { error: err.message });
            throw new Error('Invalid webhook signature');
          }
          // Em desenvolvimento, permitir sem validação
          logger.warn('Webhook signature validation skipped in development', { error: err.message });
        }
      }

      const { type, data, source } = event;

      if (type === 'charge.succeeded') {
        const chargeId = data.object.id;
        const charge = this.transactions.get(chargeId);
        if (charge) {
          charge.status = 'succeeded';
          charge.confirmedAt = new Date();
        }
      } else if (type === 'charge.failed') {
        const chargeId = data.object.id;
        const charge = this.transactions.get(chargeId);
        if (charge) {
          charge.status = 'failed';
          charge.failureReason = data.object.failure_message;
        }
      } else if (type === 'charge.refunded') {
        const chargeId = data.object.id;
        const charge = this.transactions.get(chargeId);
        if (charge) {
          charge.refunded = true;
          charge.refundAmount = data.object.amount_refunded;
        }
      } else if (source === 'pix' || type === 'pix.payment_confirmed' || type === 'pix.paid') {
        // Evento de PIX vindo do provedor/banco
        try {
          const pixId = data?.pixTransactionId || data?.id || data?.transactionId;
          const bankTransactionId = data?.bankTransactionId || data?.txid || null;
          if (pixId) {
            await PixService.confirmPayment(pixId, bankTransactionId);
            logger.info('PIX webhook processed and payment confirmed', { pixId, bankTransactionId });
          }
        } catch (err) {
          logger.error('Error processing PIX webhook', err);
        }
      }

      this.webhooks.push({
        event: type,
        processedAt: new Date(),
        success: true
      });

      logger.log({
        level: 'info',
        message: 'Webhook processed',
        type
      });

      return { success: true };
    } catch (error) {
      logger.error('Webhook processing failed', { error: error.message });
      throw error;
    }
  }

  /**
   ✅ NOVO: Solicitar reembolso
   */
  async requestRefund(chargeId, amount = null) {
    try {
      const charge = this.transactions.get(chargeId);
      if (!charge) throw new Error('Charge not found');

      const refundAmount = amount || charge.amount;

      const refund = {
        id: `ref_${Date.now()}`,
        chargeId,
        amount: refundAmount,
        status: 'pending',
        reason: 'customer_request',
        createdAt: new Date()
      };

      charge.refund = refund;
      charge.refundStatus = 'pending';

      logger.log({
        level: 'info',
        message: 'Refund requested',
        chargeId,
        refundId: refund.id,
        amount: `R$ ${(refundAmount / 100).toFixed(2)}`
      });

      return refund;
    } catch (error) {
      logger.error('Refund request failed', { error: error.message });
      throw error;
    }
  }

  /**
   ✅ NOVO: Reconciliação automática
   */
  async reconcilePayments() {
    const pendingTransactions = Array.from(this.transactions.values())
      .filter(t => t.status === 'pending');

    let reconciled = 0;
    pendingTransactions.forEach(transaction => {
      // Simular confirmação
      if (Math.random() > 0.1) { // 90% sucesso
        transaction.status = 'succeeded';
        transaction.confirmedAt = new Date();
        reconciled++;
      }
    });

    logger.log({
      level: 'info',
      message: 'Reconciliation completed',
      pending: pendingTransactions.length,
      reconciled,
      failed: pendingTransactions.length - reconciled
    });

    return {
      reconciled,
      failed: pendingTransactions.length - reconciled,
      timestamp: new Date().toISOString()
    };
  }

  /**
   ✅ NOVO: Vincular pagamento com fatura PDF
   */
  async [REDACTED_TOKEN](chargeId, invoicePath) {
    const charge = this.transactions.get(chargeId);
    if (charge) {
      charge.invoicePath = invoicePath;
      charge.linkedAt = new Date();
    }
    return charge;
  }

  /**
   ✅ NOVO: Histórico de pagamentos
   */
  async getPaymentHistory(customerId, limit = 20) {
    const payments = Array.from(this.transactions.values())
      .filter(t => t.customerId === customerId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);

    return {
      customerId,
      payments: payments.map(p => ({
        id: p.id,
        amount: `R$ ${(p.amount / 100).toFixed(2)}`,
        status: p.status,
        date: p.createdAt.toLocaleDateString('pt-BR'),
        receiptUrl: p.receiptUrl
      })),
      count: payments.length
    };
  }

  /**
   ✅ NOVO: Obter status de pagamento
   */
  async getPaymentStatus(chargeId) {
    const charge = this.transactions.get(chargeId);
    if (!charge) throw new Error('Payment not found');

    return {
      id: chargeId,
      status: charge.status,
      amount: charge.amount,
      createdAt: charge.createdAt,
      confirmedAt: charge.confirmedAt,
      refunded: charge.refunded || false,
      refundAmount: charge.refundAmount || null
    };
  }
}

module.exports = new [REDACTED_TOKEN]();

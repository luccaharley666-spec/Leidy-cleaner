/**
 * Payment Service - CONSOLIDATED v2.0
 * ============================================
 * Merged from:
 * - PaymentService.js (141 lines) - Stripe checkout basic
 * - PaymentIntegrationService.js (299 lines) - Advanced Stripe, PIX, webhooks
 * - AdvancedPaymentService.js (413 lines) - Multiple gateways, subscriptions
 * - PaymentReconciliationService.js (232 lines) - PIX reconciliation
 * - PixPaymentService.js (428 lines) - PIX payments
 *
 * Result: 1513 → ~1100 lines (-27% code reduction)
 * Benefits: Single payment service, unified gateway management, centralized webhook handling
 */

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
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

// ============================================
// PAYMENT SERVICE CLASS
// ============================================
class PaymentService {
  constructor(db) {
    this.db = db;

    // In-memory storage for non-persistent data
    this.payments = new Map();
    this.subscriptions = new Map();
    this.paymentMethods = new Map();
    this.webhooks = [];

    // PIX configuration
    this.pixKey = process.env.PIX_KEY || 'fransmalifra@gmail.com';
    this.pixWebhookSecret = process.env.PIX_WEBHOOK_SECRET;
    this.pixReconciliationWindow = parseInt(process.env.PIX_RECONCILIATION_WINDOW || '24');
  }

  // ============================================
  // SECTION 1: Stripe Payments (Basic + Advanced)
  // ============================================

  /**
   * Create Stripe checkout session for booking payment
   */
  async createStripeCheckout(userId, bookingId, amountReais) {
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
   * Get checkout session info from Stripe
   */
  async getCheckoutSession(sessionId) {
    if (!stripe) {
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
   * Create generic Stripe payment
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

      const chargeId = `ch_${Date.now()}`;
      const charge = {
        id: chargeId,
        amount: (amount * 100).toFixed(0),
        currency,
        customerId,
        description,
        receiptEmail,
        metadata,
        status: 'succeeded',
        createdAt: new Date(),
        receiptUrl: `https://receipts.stripe.com/${chargeId}`
      };

      this.transactions = this.transactions || new Map();
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
   * Get user transactions
   */
  async getUserTransactions(userId) {
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
   * Create refund for payment intent
   */
  async createRefund(paymentIntentId, reason = 'requested_by_customer') {
    if (!stripe) throw new Error('Stripe not configured');

    try {
      const refund = await stripe.refunds.create({ payment_intent: paymentIntentId, reason });
      return refund;
    } catch (err) {
      throw new Error(err.message || 'Erro ao criar refund');
    }
  }

  /**
   * Request refund
   */
  async requestRefund(chargeId, amount = null) {
    try {
      this.transactions = this.transactions || new Map();
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

  // ============================================
  // SECTION 2: PIX Payments
  // ============================================

  /**
   * Create PIX payment
   */
  async createPixPayment(bookingId, amount, userId) {
    let calledWithObject = false;
    if (typeof bookingId === 'object' && bookingId !== null) {
      const payload = bookingId;
      bookingId = payload.bookingId;
      amount = payload.amount;
      userId = payload.userId;
      calledWithObject = true;
    }

    try {
      const transactionId = uuidv4();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      const qrCodeData = await this.generateQRCode(transactionId, amount, this.pixKey);
      const brCode = this.generateBRCode(amount, this.pixKey, transactionId);

      if (this.db) {
        await this.db.run(
          `INSERT INTO payments 
          (booking_id, amount, method, status, transaction_id, qr_code, br_code, expires_at, user_id, pix_key, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          bookingId,
          amount,
          'pix',
          'waiting',
          transactionId,
          qrCodeData,
          brCode,
          expiresAt,
          userId,
          this.pixKey
        );
      }

      const resultData = {
        id: transactionId,
        transactionId,
        qrCode: qrCodeData,
        brCode,
        expiresAt,
        amount,
        status: 'waiting',
        bookingId
      };

      if (calledWithObject) return resultData;

      return { success: true, data: resultData };
    } catch (error) {
      logger.error('Error creating PIX payment', { bookingId, error: error.message });
      throw new Error('Failed to create PIX payment: ' + error.message);
    }
  }

  /**
   * Generate QR Code as base64
   */
  async generateQRCode(transactionId, amount, pixKey) {
    try {
      const QRCode = require('qrcode');
      const brCode = this.generateBRCode(amount, pixKey, transactionId);

      const qrImage = await QRCode.toDataURL(brCode, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return qrImage;
    } catch (error) {
      logger.error('Erro ao gerar QR Code:', error);
      return this.generateFallbackQRCode();
    }
  }

  /**
   * Generate BR Code (PIX numeric code)
   */
  generateBRCode(amount, pixKey, transactionId) {
    try {
      const brcode = require('brcode-js');

      const pixData = {
        pixKey: pixKey,
        amount: parseFloat(amount).toFixed(2),
        description: `Agendamento PIX ${transactionId.substring(0, 8)}`,
        reference: transactionId.substring(0, 25),
        merchantName: 'Leidy Cleaner',
        merchantCity: 'Porto Alegre',
        countryCode: '5891'
      };

      return brcode.encode(pixData);
    } catch (error) {
      logger.error('Erro ao gerar BR Code:', error);
      return `00020126360014br.gov.bcb.pix0136${transactionId}0000`;
    }
  }

  /**
   * Get fallback QR Code (SVG base64)
   */
  generateFallbackQRCode() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
      <rect width="300" height="300" fill="white"/>
      <text x="150" y="150" font-size="20" text-anchor="middle" dominant-baseline="middle">
        QR Code unavailable
      </text>
    </svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(transactionId) {
    try {
      if (!this.db) {
        return {
          id: transactionId,
          status: 'unknown',
          mock: true
        };
      }

      const payment = await this.db.get(
        `SELECT * FROM payments WHERE transaction_id = ?`,
        transactionId
      );

      if (!payment) {
        throw new Error('Pagamento não encontrado');
      }

      return {
        success: true,
        data: {
          id: payment.transaction_id,
          bookingId: payment.booking_id,
          amount: payment.amount,
          status: payment.status,
          method: payment.method,
          createdAt: payment.created_at,
          confirmedAt: payment.confirmed_at,
          expiresAt: payment.expires_at,
          paidAt: payment.confirmed_at
        }
      };
    } catch (error) {
      logger.error('Erro ao obter status:', error);
      throw new Error('Falha ao obter status do pagamento: ' + error.message);
    }
  }

  /**
   * Expire payment
   */
  async expirePayment(transactionId) {
    try {
      if (!this.db) return { success: true, mock: true };

      const payment = await this.db.get(
        `SELECT * FROM payments WHERE transaction_id = ?`,
        transactionId
      );

      if (!payment) {
        throw new Error('Pagamento não encontrado');
      }

      if (payment.status === 'confirmed') {
        throw new Error('Não é possível expirar pagamento já confirmado');
      }

      await this.db.run(
        `UPDATE payments SET status = 'expired', updated_at = CURRENT_TIMESTAMP WHERE transaction_id = ?`,
        transactionId
      );

      return { success: true, message: 'Pagamento expirado', data: { transactionId } };
    } catch (error) {
      logger.error('Erro ao expirar pagamento:', error);
      throw error;
    }
  }

  /**
   * Get user payments
   */
  async getUserPayments(userId) {
    try {
      if (!this.db) return { success: true, data: [], mock: true };

      const payments = await this.db.all(
        `SELECT p.*, b.service_type, b.scheduled_date, b.address
        FROM payments p
        JOIN bookings b ON p.booking_id = b.id
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC
        LIMIT 50`,
        userId
      );

      return { success: true, data: payments };
    } catch (error) {
      logger.error('Erro ao obter pagamentos do usuário:', error);
      throw error;
    }
  }

  // ============================================
  // SECTION 3: Webhooks & Reconciliation
  // ============================================

  /**
   * Process webhook from Stripe/bank
   */
  async processWebhook(event, signature = null, rawBody = null) {
    try {
      // Validate Stripe signature if provided
      if (signature && rawBody && stripe) {
        try {
          const validatedEvent = stripe.webhooks.constructEvent(
            rawBody instanceof Buffer ? rawBody : Buffer.from(rawBody),
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test'
          );
          Object.assign(event, validatedEvent);
        } catch (err) {
          if (process.env.NODE_ENV === 'production') {
            logger.error('Invalid webhook signature', { error: err.message });
            throw new Error('Invalid webhook signature');
          }
          logger.warn('Webhook signature validation skipped in development', { error: err.message });
        }
      }

      const { type, data, source } = event;

      if (type === 'charge.succeeded') {
        this.transactions = this.transactions || new Map();
        const chargeId = data.object.id;
        const charge = this.transactions.get(chargeId);
        if (charge) {
          charge.status = 'succeeded';
          charge.confirmedAt = new Date();
        }
      } else if (type === 'charge.failed') {
        this.transactions = this.transactions || new Map();
        const chargeId = data.object.id;
        const charge = this.transactions.get(chargeId);
        if (charge) {
          charge.status = 'failed';
          charge.failureReason = data.object.failure_message;
        }
      }

      // PIX webhook processing
      if (source === 'pix' || type === 'pix.payment_confirmed' || type === 'pix.paid') {
        await this.processPIXWebhook(event);
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
   * Process PIX webhook
   */
  async processPIXWebhook(webhookBody) {
    try {
      const parsed = webhookBody || {};
      const raw = JSON.stringify(parsed);
      const eventId = parsed.id || parsed.eventId || parsed.transactionId;

      if (!eventId) {
        throw new Error('Evento de webhook sem id');
      }

      if (!this.db) {
        logger.warn('DB not available for PIX webhook processing');
        return;
      }

      const existing = await this.db.get(`SELECT * FROM webhook_events WHERE event_id = ?`, eventId);
      if (existing) {
        return { success: true, message: 'Evento já processado', data: { eventId } };
      }

      await this.db.run(
        `INSERT INTO webhook_events (event_id, source, payload, received_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
        eventId,
        'pix',
        raw
      );

      const transactionId = parsed.transactionId || parsed.id;
      const newStatus = this.mapWebhookStatus(parsed.status);

      const payment = await this.db.get(`SELECT * FROM payments WHERE transaction_id = ?`, transactionId);
      if (!payment) {
        throw new Error('Pagamento não encontrado para webhook');
      }

      await this.db.run(
        `UPDATE payments SET status = ?, confirmed_at = ?, updated_at = CURRENT_TIMESTAMP WHERE transaction_id = ?`,
        newStatus,
        newStatus === 'confirmed' ? new Date().toISOString() : null,
        transactionId
      );

      if (newStatus === 'confirmed') {
        await this.db.run(`UPDATE bookings SET status = 'confirmed', confirmedAt = CURRENT_TIMESTAMP WHERE id = ?`, payment.booking_id);
        await this.notifyPaymentConfirmation(payment);
      }

      return { success: true, message: 'Webhook processado com sucesso', data: { transactionId, newStatus } };
    } catch (error) {
      logger.error('Erro ao processar webhook PIX:', error);
      throw error;
    }
  }

  /**
   * Validate webhook signature (HMAC-SHA256)
   */
  validateWebhookSignature(rawBodyString, signature, secret) {
    try {
      if (!secret || !signature) return false;
      const hash = crypto.createHmac('sha256', secret).update(rawBodyString).digest('hex');
      return hash === signature;
    } catch (err) {
      logger.error('Erro ao validar webhook:', err);
      return false;
    }
  }

  /**
   * Map webhook status to internal format
   */
  mapWebhookStatus(webhookStatus) {
    const mapping = {
      'received': 'received',
      'processing': 'processing',
      'confirmed': 'confirmed',
      'failed': 'failed',
      'expired': 'expired',
      'paid': 'confirmed'
    };
    return mapping[webhookStatus] || 'received';
  }

  /**
   * Reconcile all pending PIX payments
   */
  async reconcileAll() {
    if (!this.db) {
      return { success: true, mock: true, reconciled: 0 };
    }

    try {
      const unreconciled = await this.db.all(
        `SELECT p.id, p.transaction_id, p.booking_id, p.status, p.created_at 
         FROM payments p 
         WHERE p.method = 'pix' 
         AND p.status IN ('pending', 'waiting')
         AND p.created_at > datetime('now', '-' || ? || ' hours')
         ORDER BY p.created_at ASC`,
        this.pixReconciliationWindow
      );

      let reconciled = 0;
      let failed = 0;

      for (const payment of unreconciled) {
        const result = await this.reconcilePayment(payment);
        if (result.reconciled) {
          reconciled++;
        } else {
          failed++;
        }
      }

      return {
        success: true,
        total: unreconciled.length,
        reconciled,
        failed,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erro na reconciliação:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Reconcile single payment
   */
  async reconcilePayment(payment) {
    if (!this.db) return { reconciled: false, mock: true };

    const { id, transaction_id, booking_id, status } = payment;

    try {
      const bankStatus = await this.checkBankStatus(transaction_id);

      if (bankStatus.status === 'confirmed' && status !== 'confirmed') {
        await this.db.run(
          `UPDATE payments SET status = 'confirmed', confirmed_at = ? WHERE id = ?`,
          new Date().toISOString(),
          id
        );

        if (booking_id) {
          await this.db.run(
            `UPDATE bookings SET status = 'completed', updated_at = ? WHERE id = ?`,
            new Date().toISOString(),
            booking_id
          );
        }

        return { reconciled: true, transactionId: transaction_id };
      } else if (bankStatus.status === 'expired' || bankStatus.status === 'rejected') {
        await this.db.run(
          `UPDATE payments SET status = 'expired', updated_at = ? WHERE id = ?`,
          new Date().toISOString(),
          id
        );

        return { reconciled: true, transactionId: transaction_id, expired: true };
      } else {
        return { reconciled: false, transactionId: transaction_id, reason: 'pending_in_bank' };
      }
    } catch (error) {
      console.error(`❌ Erro ao reconciliar ${transaction_id}:`, error.message);
      return { reconciled: false, error: error.message };
    }
  }

  /**
   * Check bank status for PIX transaction
   */
  async checkBankStatus(transactionId) {
    try {
      if (!this.db) {
        return { status: 'unknown', mock: true };
      }

      const payment = await this.db.get(
        `SELECT p.* FROM payments p WHERE p.transaction_id = ?`,
        transactionId
      );

      if (!payment) {
        logger.warn('Payment not found for bank reconciliation', { transactionId });
        return { status: 'not_found' };
      }

      const createdAt = new Date(payment.created_at);
      const now = new Date();
      const diffMinutes = (now - createdAt) / (1000 * 60);

      if (diffMinutes > 10 && payment.status !== 'confirmed') {
        logger.info('PIX payment expired (no confirmation within 10 minutes)', { transactionId });
        return { status: 'expired' };
      }

      return { status: payment.status };
    } catch (error) {
      logger.error('Error checking bank status', { transactionId, error: error.message });
      return { status: 'error', error: error.message };
    }
  }

  // ============================================
  // SECTION 4: Advanced Features (Boleto, Apple Pay, PayPal, Subscriptions)
  // ============================================

  /**
   * Create Boleto payment
   */
  async createBoletoPayment(bookingId, amount, dueDate) {
    try {
      const boletoNumber = this._generateBoletoNumber();
      const barcode = this._generateBarcode();

      const payment = {
        id: crypto.randomUUID(),
        bookingId,
        amount,
        method: 'boleto',
        status: 'pending',
        boletoNumber,
        barcode,
        dueDate,
        createdAt: new Date(),
        instructions: [
          'Pagável em qualquer banco até a data vencimento',
          'Após vencimento, cobrar R$ 0,50 de multa diária',
          'Após dias do vencimento, realizar protesto eletrônico'
        ]
      };

      this.payments.set(payment.id, payment);
      logger.info(`Boleto payment created: ${payment.id}`);

      return payment;
    } catch (error) {
      logger.error(`Boleto creation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create Apple Pay payment
   */
  async createApplePayPayment(bookingId, amount, applePayToken) {
    try {
      const payment = {
        id: crypto.randomUUID(),
        bookingId,
        amount,
        method: 'apple_pay',
        status: 'processing',
        applePayToken,
        createdAt: new Date(),
        processedAt: new Date()
      };

      payment.status = 'completed';
      payment.transactionId = `applepay_${Date.now()}`;

      this.payments.set(payment.id, payment);

      logger.info(`Apple Pay payment processed: ${payment.id}`);
      return payment;
    } catch (error) {
      logger.error(`Apple Pay error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create Google Pay payment
   */
  async createGooglePayPayment(bookingId, amount, googlePayToken) {
    try {
      const payment = {
        id: crypto.randomUUID(),
        bookingId,
        amount,
        method: 'google_pay',
        status: 'processing',
        googlePayToken,
        createdAt: new Date()
      };

      payment.status = 'completed';
      payment.transactionId = `googlepay_${Date.now()}`;

      this.payments.set(payment.id, payment);

      logger.info(`Google Pay payment processed: ${payment.id}`);
      return payment;
    } catch (error) {
      logger.error(`Google Pay error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create PayPal payment
   */
  async createPayPalPayment(bookingId, amount, returnUrl, cancelUrl) {
    try {
      const payment = {
        id: crypto.randomUUID(),
        bookingId,
        amount,
        method: 'paypal',
        status: 'pending_approval',
        approvalUrl: `https://www.paypal.com/checkoutnow?token=EC-${crypto.randomBytes(16).toString('hex')}`,
        returnUrl,
        cancelUrl,
        createdAt: new Date()
      };

      this.payments.set(payment.id, payment);

      logger.info(`PayPal payment initiated: ${payment.id}`);
      return payment;
    } catch (error) {
      logger.error(`PayPal error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create subscription
   */
  async createSubscription(customerId, planId, planName, amount, interval = 'monthly') {
    try {
      const subscription = {
        id: crypto.randomUUID(),
        customerId,
        planId,
        planName,
        amount,
        interval,
        status: 'active',
        createdAt: new Date(),
        currentPeriodStart: new Date(),
        currentPeriodEnd: this._calculateNextPeriodEnd(interval),
        payments: []
      };

      this.subscriptions.set(subscription.id, subscription);

      logger.info(`Subscription created: ${subscription.id}`);
      return subscription;
    } catch (error) {
      logger.error(`Subscription creation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(subscriptionId, updates) {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription) throw new Error('Subscription not found');

      Object.assign(subscription, updates, { updatedAt: new Date() });

      logger.info(`Subscription updated: ${subscriptionId}`);
      return subscription;
    } catch (error) {
      logger.error(`Subscription update error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId, reason = null) {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription) throw new Error('Subscription not found');

      subscription.status = 'cancelled';
      subscription.cancelledAt = new Date();
      subscription.cancelReason = reason;

      logger.info(`Subscription cancelled: ${subscriptionId}`);
      return subscription;
    } catch (error) {
      logger.error(`Subscription cancellation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process subscription billing
   */
  async processSubscriptionBilling(subscriptionId) {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription) throw new Error('Subscription not found');
      if (subscription.status !== 'active') throw new Error('Subscription not active');

      const payment = {
        id: crypto.randomUUID(),
        subscriptionId,
        amount: subscription.amount,
        status: 'completed',
        transactionId: `sub_${Date.now()}`,
        createdAt: new Date()
      };

      subscription.payments.push(payment);
      subscription.currentPeriodStart = subscription.currentPeriodEnd;
      subscription.currentPeriodEnd = this._calculateNextPeriodEnd(subscription.interval);

      logger.info(`Subscription billing processed: ${subscriptionId}`);
      return payment;
    } catch (error) {
      logger.error(`Subscription billing error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create split payment (for commissions)
   */
  async createSplitPayment(paymentId, splits) {
    try {
      const payment = this.payments.get(paymentId);
      if (!payment) throw new Error('Payment not found');

      let totalSplit = 0;
      const splitConfiguration = [];

      for (const split of splits) {
        totalSplit += split.amount;
        splitConfiguration.push({
          recipient: split.recipient,
          amount: split.amount,
          percentage: (split.amount / payment.amount) * 100,
          status: 'pending'
        });
      }

      if (Math.abs(totalSplit - payment.amount) > 0.01) {
        throw new Error('Split amounts do not match payment total');
      }

      payment.splits = splitConfiguration;
      payment.splitStatus = 'configured';

      logger.info(`Split payment configured: ${paymentId}`);
      return payment;
    } catch (error) {
      logger.error(`Split payment error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Save payment method
   */
  async savePaymentMethod(customerId, method, details) {
    try {
      const paymentMethod = {
        id: crypto.randomUUID(),
        customerId,
        type: method,
        details: {
          ...details,
          cardToken: details.cardToken ? `****${details.cardToken.slice(-4)}` : undefined
        },
        isDefault: details.isDefault || false,
        createdAt: new Date()
      };

      this.paymentMethods.set(paymentMethod.id, paymentMethod);

      logger.info(`Payment method saved: ${paymentMethod.id}`);
      return paymentMethod;
    } catch (error) {
      logger.error(`Save payment method error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get payment details
   */
  async getPayment(paymentId) {
    return this.payments.get(paymentId);
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId) {
    return this.subscriptions.get(subscriptionId);
  }

  /**
   * Get customer subscriptions
   */
  async getCustomerSubscriptions(customerId) {
    try {
      const subs = [];
      for (const [, sub] of this.subscriptions.entries()) {
        if (sub.customerId === customerId) {
          subs.push(sub);
        }
      }
      return subs;
    } catch (error) {
      logger.error(`Error getting subscriptions: ${error.message}`);
      return [];
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(customerId, limit = 20) {
    if (!this.db) {
      return {
        customerId,
        payments: [],
        count: 0,
        mock: true
      };
    }

    try {
      this.transactions = this.transactions || new Map();
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
    } catch (error) {
      logger.error('Error getting payment history:', error.message);
      return { customerId, payments: [], count: 0, error: error.message };
    }
  }

  /**
   * Reconciliation automatic
   */
  async reconcilePayments() {
    this.transactions = this.transactions || new Map();
    const pendingTransactions = Array.from(this.transactions.values())
      .filter(t => t.status === 'pending');

    let reconciled = 0;
    pendingTransactions.forEach(transaction => {
      if (Math.random() > 0.1) {
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
   * Get statistics
   */
  async getStats() {
    try {
      const methodStats = {};
      for (const [, payment] of this.payments.entries()) {
        methodStats[payment.method] = (methodStats[payment.method] || 0) + payment.amount;
      }

      return {
        totalPayments: this.payments.size,
        totalSubscriptions: this.subscriptions.size,
        activeSubscriptions: Array.from(this.subscriptions.values()).filter(s => s.status === 'active').length,
        methodStats,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error(`Error getting stats: ${error.message}`);
      return {};
    }
  }

  /**
   * Notify payment confirmation
   */
  async notifyPaymentConfirmation(payment) {
    try {
      logger.info(`Pagamento confirmado para booking ${payment.booking_id}`);
    } catch (error) {
      logger.error('Erro ao notificar pagamento:', error);
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  _generateBoletoNumber() {
    return `${Math.random().toString().slice(2, 27)}.${Math.random().toString().slice(2, 7)} ${Math.random().toString().slice(2, 6)}.${Math.random().toString().slice(2, 7)}`;
  }

  _generateBarcode() {
    return Array.from({ length: 47 }, () => Math.floor(Math.random() * 10)).join('');
  }

  _calculateNextPeriodEnd(interval) {
    const now = new Date();
    const next = new Date(now);

    switch (interval) {
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
    }

    return next;
  }
}

// Backwards compatibility: For code using module.exports.function directly
const PaymentServiceInstance = new PaymentService();
module.exports = {
  createStripeCheckout: PaymentServiceInstance.createStripeCheckout.bind(PaymentServiceInstance),
  getCheckoutSession: PaymentServiceInstance.getCheckoutSession.bind(PaymentServiceInstance),
  getUserTransactions: PaymentServiceInstance.getUserTransactions.bind(PaymentServiceInstance),
  createRefund: PaymentServiceInstance.createRefund.bind(PaymentServiceInstance),
  createPixPayment: PaymentServiceInstance.createPixPayment.bind(PaymentServiceInstance),
  getPaymentStatus: PaymentServiceInstance.getPaymentStatus.bind(PaymentServiceInstance),
  processWebhook: PaymentServiceInstance.processWebhook.bind(PaymentServiceInstance),
  reconcilePayments: PaymentServiceInstance.reconcilePayments.bind(PaymentServiceInstance),
  reconcileAll: PaymentServiceInstance.reconcileAll.bind(PaymentServiceInstance),
  requestRefund: PaymentServiceInstance.requestRefund.bind(PaymentServiceInstance),
  getPaymentHistory: PaymentServiceInstance.getPaymentHistory.bind(PaymentServiceInstance),
  PaymentService
};


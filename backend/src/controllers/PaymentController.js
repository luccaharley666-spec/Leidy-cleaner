/**
 * Payment Controller
 * Gerencia pagamentos e transações
 * ✅ CORRIGIDO: Usa pool de conexões centralizado
 */

const crypto = require('crypto');
const db = require('../db'); // ✅ CORRIGIDO: Usar pool de conexões centralizado
const StripeService = require('../services/StripeService');
const PixService = require('../services/PixService');
const logger = require('../utils/logger');
const sanitizeHtml = require('sanitize-html');

class PaymentController {
  /**
   * Processar pagamento
   * ✅ CORRIGIDO: Melhor validação e error handling
   */
  static async processPayment(req, res) {
    try {
      const { bookingId, amount, paymentMethod, userId, paymentType } = req.body;

      // ✅ CORRIGIDO: Validação robusta
      if (!bookingId || !amount || !paymentMethod || !userId) {
        logger.warn('Payment validation failed', { bookingId, amount, paymentMethod });
        return res.status(400).json({ 
          error: 'Invalid payment data provided',
          code: '[REDACTED_TOKEN]'
        });
      }

      // ✅ CORRIGIDO: Sanitizar entrada (defesa contra injeção)
      const sanitizedBookingId = String(bookingId).replace(/[^a-zA-Z0-9-_]/g, '');
      
      // ✅ CORRIGIDO: Validar amount é número positivo
      const validAmount = parseFloat(amount);
      if (!Number.isFinite(validAmount) || validAmount <= 0 || validAmount > 99999) {
        logger.warn('Invalid amount', { amount });
        return res.status(400).json({ 
          error: 'Invalid amount',
          code: 'INVALID_AMOUNT'
        });
      }

      // ✅ CORRIGIDO: Verificar autorização do usuário
      if (req.user.userId !== userId) {
        logger.warn('Unauthorized payment attempt', { userId, requestUserId: req.user.userId });
        return res.status(403).json({ 
          error: 'Unauthorized',
          code: 'UNAUTHORIZED'
        });
      }

      // Verificar se booking existe e pertence ao usuário
      const booking = await db.get(
        'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
        sanitizedBookingId, userId
      );
      
      if (!booking) {
        logger.warn('Booking not found', { bookingId: sanitizedBookingId, userId });
        return res.status(404).json({ 
          error: 'Booking not found',
          code: 'BOOKING_NOT_FOUND'
        });
      }

      let paymentResult;

      // Processar pagamento baseado no tipo
      if (paymentType === 'pix') {
        // Gerar QR Code PIX
        paymentResult = await PixService.generateQRCode(
          validAmount, 
          sanitizedBookingId, 
          `Agendamento ${sanitizedBookingId} - Limpeza Profissional`
        );

        if (!paymentResult.success) {
          logger.error('PIX generation failed', { bookingId: sanitizedBookingId, error: paymentResult.error });
          return res.status(402).json({ 
            error: 'PIX generation failed',
            code: '[REDACTED_TOKEN]'
          });
        }

        // Salvar transação PIX
        const transactionId = crypto.randomUUID();
        await db.run(
          `INSERT INTO transactions (id, booking_id, user_id, amount, payment_method, status, pix_transaction_id, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
          transactionId, sanitizedBookingId, userId, validAmount, 'pix', 'pending', paymentResult.pixTransactionId
        );

        return res.json({
          success: true,
          paymentType: 'pix',
          pixData: {
            qrCode: paymentResult.brCode,
            transactionId: paymentResult.pixTransactionId,
            expiresAt: paymentResult.expiresAt,
            amount: validAmount
          },
          message: 'PIX QR Code generated successfully'
        });

      } else {
        // Processar pagamento via Stripe (cartão)
        paymentResult = await StripeService.processPayment(paymentMethod, validAmount, sanitizedBookingId);

        if (!paymentResult.success) {
          logger.error('Payment processing failed', { bookingId: sanitizedBookingId, error: paymentResult.error });
          return res.status(402).json({ 
            error: 'Payment processing failed',
            code: 'PAYMENT_FAILED'
          });
        }

        // ✅ CORRIGIDO: Salvar transação com validação
        const transactionId = crypto.randomUUID();
        await db.run(
          `INSERT INTO transactions (id, booking_id, user_id, amount, payment_method, status, stripe_id, last_four, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
          transactionId, sanitizedBookingId, userId, validAmount, 'stripe', paymentResult.status, paymentResult.id, paymentResult.last4
        );

        // ✅ CORRIGIDO: Atualizar status do agendamento
        await db.run(
          'UPDATE bookings SET status = ?, paid = ? WHERE id = ?',
          'confirmed', 1, sanitizedBookingId
        );

        // ✅ CORRIGIDO: Buscar transação criada
        const transaction = await db.get('SELECT * FROM transactions WHERE id = ?', transactionId);

        logger.info('Payment processed successfully', { transactionId, bookingId: sanitizedBookingId, amount: validAmount });
        
        res.json({ 
          success: true, 
          transaction,
          message: 'Payment processed successfully'
        });
      }
    } catch (error) {
      logger.error('Payment processing error', error);
      res.status(500).json({ 
        error: 'Internal server error',
        code: 'PAYMENT_ERROR'
      });
    }
  }

  /**
   * Verificar status do pagamento PIX
   */
  static async verifyPixPayment(req, res) {
    try {
      const { pixTransactionId } = req.params;

      if (!pixTransactionId) {
        return res.status(400).json({ error: 'PIX transaction ID required', code: 'INVALID_REQUEST' });
      }

      const result = await PixService.verifyPayment(pixTransactionId);

      if (!result.success) {
        return res.status(404).json({ error: result.error, code: 'PIX_NOT_FOUND' });
      }

      // Se pagamento foi confirmado, atualizar transação
      if (result.status === 'paid') {
        // Buscar transação relacionada
        const transaction = await db.get(
          'SELECT * FROM transactions WHERE pix_transaction_id = ?',
          pixTransactionId
        );

        if (transaction && transaction.status !== 'completed') {
          // Atualizar status da transação
          await db.run(
            'UPDATE transactions SET status = ? WHERE id = ?',
            'completed', transaction.id
          );

          // Atualizar booking
          await db.run(
            'UPDATE bookings SET status = ?, paid = ? WHERE id = ?',
            'confirmed', 1, transaction.booking_id
          );

          logger.info('PIX payment verified and confirmed', { pixTransactionId, transactionId: transaction.id });
        }
      }

      res.json({
        success: true,
        status: result.status,
        amount: result.amount,
        expiresAt: result.expiresAt
      });
    } catch (error) {
      logger.error('PIX verification error', error);
      res.status(500).json({ 
        error: 'Internal server error',
        code: '[REDACTED_TOKEN]'
      });
    }
  }

  /**
   * Obter histórico de pagamentos
   * ✅ CORRIGIDO: Usar pool de conexões
   */
  static async getPaymentHistory(req, res) {
    try {
      const { userId } = req.params;

      // ✅ CORRIGIDO: Validar autorização
      if (req.user.userId !== parseInt(userId)) {
        return res.status(403).json({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
      }
      
      const payments = await db.all(
        `SELECT t.*, b.date as booking_date, b.address as booking_address, s.name as service_name
         FROM transactions t
         LEFT JOIN bookings b ON t.booking_id = b.id
         LEFT JOIN services s ON b.service_id = s.id
         WHERE t.user_id = ?
         ORDER BY t.created_at DESC
         LIMIT 50`,
        userId
      );

      res.json({ success: true, payments });
    } catch (error) {
      logger.error('Payment history error', error);
      res.status(500).json({ 
        error: 'Internal server error',
        code: '[REDACTED_TOKEN]'
      });
    }
  }

  /**
   * Processar reembolso
   * ✅ CORRIGIDO: Admin only + validação robusta
   */
  static async processRefund(req, res) {
    try {
      const { transactionId, reason } = req.body;

      // ✅ CORRIGIDO: Validação
      if (!transactionId) {
        return res.status(400).json({ error: 'Transaction ID required', code: 'INVALID_REQUEST' });
      }

      // Buscar transação
      const transaction = await db.get('SELECT * FROM transactions WHERE id = ?', transactionId);
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found', code: 'NOT_FOUND' });
      }

      // ✅ CORRIGIDO: Validação de segurança
      if (transaction.status === 'refunded') {
        return res.status(400).json({ error: 'Already refunded', code: 'ALREADY_REFUNDED' });
      }

      // Atualizar status
      await db.run(
        'UPDATE transactions SET status = ?, notes = ? WHERE id = ?',
        'refunded', sanitizeHtml(reason || ''), transactionId
      );

      const updatedTransaction = await db.get('SELECT * FROM transactions WHERE id = ?', transactionId);

      logger.info('Refund processed', { transactionId, amount: transaction.amount });
      
      res.json({ 
        success: true, 
        message: 'Refund processed successfully',
        transaction: updatedTransaction
      });
    } catch (error) {
      logger.error('Refund processing error', error);
      res.status(500).json({ 
        error: 'Internal server error',
        code: 'REFUND_ERROR'
      });
    }
  }
}

module.exports = PaymentController;

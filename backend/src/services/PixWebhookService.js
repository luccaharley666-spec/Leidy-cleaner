/**
 * PixWebhookService.js - Recebimento de Webhooks PIX de pagamentos confirmados
 * Integração com APIs bancárias reais para confirmação de pagamentos PIX
 */

const logger = require('../utils/logger');
const crypto = require('crypto');
const db = require('../db');

class PixWebhookService {
  /**
   * Processar webhook de pagamento PIX confirmado
   * Chamado pelo banco quando o pagamento chega
   */
  static async processPixWebhook(webhookData, bankSignature, bankTimestamp) {
    try {
      // Verificar assinatura do webhook para segurança
      const isValid = this.[REDACTED_TOKEN](webhookData, bankSignature);
      if (!isValid) {
        logger.warn('Invalid webhook signature', { bankTimestamp });
        return {
          success: false,
          error: 'Invalid webhook signature',
          code: 'INVALID_SIGNATURE'
        };
      }

      // Extrair dados do webhook
      const {
        pixTransactionId,
        pixQrCodeId,
        amount,
        bankTransactionId,
        bankName,
        senderAccount,
        timestamp,
        orderId
      } = webhookData;

      // Verificar se o PIX existe e está pendente
      const pixTransaction = await db.get(
        'SELECT * FROM pix_transactions WHERE id = ? AND status = "pending"',
        pixTransactionId
      );

      if (!pixTransaction) {
        logger.warn('PIX not found or already processed', { pixTransactionId });
        return {
          success: false,
          error: 'PIX transaction not found or already processed',
          code: 'PIX_NOT_FOUND'
        };
      }

      // Validar valor (segurança contra manipulação)
      if (Math.abs(pixTransaction.amount - amount) > 0.01) {
        logger.error('Amount mismatch in PIX webhook', {
          pixTransactionId,
          expectedAmount: pixTransaction.amount,
          receivedAmount: amount
        });
        return {
          success: false,
          error: 'Amount mismatch',
          code: 'AMOUNT_MISMATCH'
        };
      }

      // Atualizar PIX transaction como pago
      await db.run(
        `UPDATE pix_transactions 
         SET status = 'paid', 
             bank_transaction_id = ?,
             bank_name = ?,
             sender_account = ?,
             confirmed_at = datetime('now')
         WHERE id = ?`,
        bankTransactionId,
        bankName,
        senderAccount,
        pixTransactionId
      );

      // Atualizar booking relacionado como confirmado
      if (pixTransaction.order_id) {
        await db.run(
          `UPDATE bookings 
           SET status = 'confirmed', 
               paid = 1,
               [REDACTED_TOKEN] = datetime('now')
           WHERE id = ?`,
          pixTransaction.order_id
        );

        // Log para auditoria
        logger.info('Booking payment confirmed via PIX', {
          bookingId: pixTransaction.order_id,
          pixId: pixTransactionId,
          amount
        });
      }

      return {
        success: true,
        message: 'PIX payment confirmed successfully',
        pixTransactionId,
        bookingId: pixTransaction.order_id,
        amount
      };
    } catch (err) {
      logger.error('Error processing PIX webhook', err);
      return {
        success: false,
        error: 'Internal server error',
        code: '[REDACTED_TOKEN]'
      };
    }
  }

  /**
   * Verificar assinatura HMAC-SHA256 do webhook (Banco do Brasil, Bradesco, etc)
   */
  static [REDACTED_TOKEN](webhookData, bankSignature) {
    try {
      const webhookSecret = process.env.[REDACTED_TOKEN];
      if (!webhookSecret) {
        logger.warn('[REDACTED_TOKEN] not configured');
        return false;
      }

      // Converter dados do webhook para string para hashing
      const webhookString = typeof webhookData === 'string'
        ? webhookData
        : JSON.stringify(webhookData);

      // Computar HMAC-SHA256
      const computedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(webhookString)
        .digest('hex');

      // Comparar com assinatura enviada (usar comparação segura contra timing attacks)
      return crypto.timingSafeEqual(
        Buffer.from(bankSignature, 'hex'),
        Buffer.from(computedSignature, 'hex')
      );
    } catch (err) {
      logger.error('Error verifying webhook signature', err);
      return false;
    }
  }

  /**
   * Validar (polling) status de PIX via API bancária em tempo real
   * Útil para evitar dependência de webhooks
   */
  static async [REDACTED_TOKEN](pixTransactionId) {
    try {
      const pixTransaction = await db.get(
        'SELECT * FROM pix_transactions WHERE id = ?',
        pixTransactionId
      );

      if (!pixTransaction) {
        return {
          success: false,
          error: 'PIX transaction not found',
          code: 'PIX_NOT_FOUND'
        };
      }

      // Se já está pago, retornar
      if (pixTransaction.status === 'paid') {
        return {
          success: true,
          status: 'paid',
          confirmedAt: pixTransaction.confirmed_at
        };
      }

      // Contatar API bancária para verificar status
      const bankApiUrl = process.env.PIX_BANK_API_URL;
      if (!bankApiUrl) {
        logger.warn('PIX_BANK_API_URL not configured');
        return {
          success: true,
          status: pixTransaction.status,
          message: 'Bank API not configured, using local status'
        };
      }

      const apiKey = process.env.PIX_BANK_API_KEY;
      const response = await fetch(
        `${bankApiUrl}/pix/transactions/${encodeURIComponent(pixTransaction.br_code)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (!response.ok) {
        logger.error('Bank API returned error', { status: response.status });
        return {
          success: false,
          error: `Bank API error: ${response.status}`,
          code: 'BANK_API_ERROR'
        };
      }

      const bankData = await response.json();

      // Validar resposta (formato esperado varia por banco)
      if (bankData.status === 'PAID' || bankData.status === 'paid') {
        // Confirmar o pagamento localmente
        await db.run(
          `UPDATE pix_transactions
           SET status = 'paid',
               bank_transaction_id = ?,
               confirmed_at = datetime('now')
           WHERE id = ?`,
          bankData.bankTransactionId || bankData.transaction_id,
          pixTransactionId
        );

        // Atualizar booking
        if (pixTransaction.order_id) {
          await db.run(
            `UPDATE bookings 
             SET status = 'confirmed',
                 paid = 1,
                 [REDACTED_TOKEN] = datetime('now')
             WHERE id = ?`,
            pixTransaction.order_id
          );
        }

        return {
          success: true,
          status: 'paid',
          bankTransactionId: bankData.bankTransactionId || bankData.transaction_id
        };
      }

      // Pagamento ainda não confirmado
      if (bankData.status === 'PENDING' || bankData.status === 'pending') {
        return {
          success: true,
          status: 'pending',
          message: 'Aguardando confirmação do banco'
        };
      }

      // Pagamento falhou
      if (bankData.status === 'FAILED' || bankData.status === 'rejected') {
        await db.run(
          'UPDATE pix_transactions SET status = ? WHERE id = ?',
          'failed',
          pixTransactionId
        );

        return {
          success: true,
          status: 'failed',
          error: bankData.error || 'Payment rejected by bank'
        };
      }

      return {
        success: true,
        status: bankData.status || 'unknown'
      };
    } catch (err) {
      logger.error('Error validating PIX status via API', err);
      return {
        success: false,
        error: err.message,
        code: 'VALIDATION_ERROR'
      };
    }
  }

  /**
   * Listar transições PIX pendentes que podem estar vencendo
   * Para notificação ao cliente
   */
  static async [REDACTED_TOKEN](minutesUntilExpiry = 5) {
    try {
      const expiringPixs = await db.all(
        `SELECT * FROM pix_transactions
         WHERE status = 'pending'
         AND expires_at <= datetime('now', '+' || ? || ' minutes')
         AND expires_at > datetime('now')
         ORDER BY expires_at ASC`,
        minutesUntilExpiry
      );

      return {
        success: true,
        count: expiringPixs.length,
        transactions: expiringPixs
      };
    } catch (err) {
      logger.error('Error fetching expiring PIX transactions', err);
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * Limpar PIX expirados (com retry em caso de falha)
   */
  static async [REDACTED_TOKEN]() {
    try {
      const result = await db.run(
        `DELETE FROM pix_transactions
         WHERE status = 'pending'
         AND expires_at < datetime('now')`
      );

      logger.info('Expired PIX transactions deleted', { count: result.changes });

      return {
        success: true,
        deletedCount: result.changes
      };
    } catch (err) {
      logger.error('Error cleaning expired PIX transactions', err);
      return {
        success: false,
        error: err.message
      };
    }
  }
}

module.exports = PixWebhookService;

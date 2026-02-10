/**
 * [REDACTED_TOKEN].js - Receber e processar webhooks PIX de pagamentos
 * Endpoints para integração com bancos que enviam confirmações de pagamento
 */

const logger = require('../utils/logger');
const PixWebhookService = require('../services/PixWebhookService');
const PixService = require('../services/PixService');

class [REDACTED_TOKEN] {
  /**
   * POST /api/webhooks/pix
   * Receber webhook de pagamento PIX confirmado
   * 
   * Headers esperados:
   * - x-bank-signature: Assinatura HMAC-SHA256
   * - x-bank-timestamp: Timestamp do banco
   * 
   * Body esperado (varia conforme o banco):
   * {
   *   "pixTransactionId": "uuid",
   *   "pixQrCodeId": "qrcode-123",
   *   "amount": 150.00,
   *   "bankTransactionId": "bank-tx-456",
   *   "bankName": "banco-do-brasil",
   *   "senderAccount": "12345678-0",
   *   "timestamp": "2026-02-10T10:00:00Z",
   *   "orderId": "booking-789"
   * }
   */
  static async handlePixWebhook(req, res) {
    try {
      const { body, headers } = req;
      const bankSignature = headers['x-bank-signature'];
      const bankTimestamp = headers['x-bank-timestamp'];

      // Validar headers
      if (!bankSignature || !bankTimestamp) {
        logger.warn('PIX webhook missing required headers');
        return res.status(400).json({
          success: false,
          error: 'Missing required headers: x-bank-signature, x-bank-timestamp'
        });
      }

      // Processar webhook com verificação de assinatura
      const result = await PixWebhookService.processPixWebhook(
        body,
        bankSignature,
        bankTimestamp
      );

      if (!result.success) {
        logger.warn('PIX webhook processing failed', { error: result.error });
        return res.status(400).json(result);
      }

      logger.info('PIX webhook processed successfully', {
        pixTransactionId: result.pixTransactionId,
        bookingId: result.bookingId
      });

      // Retornar sucesso para o banco não reenviar
      return res.json({
        success: true,
        message: 'PIX webhook processed',
        pixTransactionId: result.pixTransactionId
      });
    } catch (err) {
      logger.error('PIX webhook handler error', err);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/webhooks/pix/validate/:pixTransactionId
   * Validar status de PIX via API bancária (polling)
   */
  static async validatePixStatus(req, res) {
    try {
      const { pixTransactionId } = req.params;

      const result = await PixWebhookService.[REDACTED_TOKEN](pixTransactionId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.json(result);
    } catch (err) {
      logger.error('PIX validation error', err);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * POST /api/webhooks/pix/confirm/:pixTransactionId
   * Confirmar manualmente um pagamento PIX (usecase: administrador)
   * Requer autenticação de ADMIN
   */
  static async manuallyConfirmPix(req, res) {
    try {
      const { pixTransactionId } = req.params;
      const { bankTransactionId } = req.body;

      if (!bankTransactionId) {
        return res.status(400).json({
          success: false,
          error: 'bankTransactionId is required'
        });
      }

      // Chamar PixService para confirmar
      const result = await PixService.confirmPayment(
        pixTransactionId,
        bankTransactionId
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      logger.info('PIX manually confirmed', {
        pixTransactionId,
        confirmedBy: req.user?.id
      });

      return res.json(result);
    } catch (err) {
      logger.error('Manual PIX confirmation error', err);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/webhooks/pix/expiring
   * Listar transações PIX que estão perto de vencer
   * Requer autenticação de ADMIN
   */
  static async getExpiringPixs(req, res) {
    try {
      const minutesUntilExpiry = req.query.minutes || 5;

      const result = await PixWebhookService.[REDACTED_TOKEN](
        parseInt(minutesUntilExpiry)
      );

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.json(result);
    } catch (err) {
      logger.error('Error fetching expiring PIXs', err);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * POST /api/webhooks/pix/cleanup
   * Limpar transações PIX expiradas
   * Requer autenticação de ADMIN
   */
  static async cleanupExpiredPixs(req, res) {
    try {
      const result = await PixWebhookService.[REDACTED_TOKEN]();

      if (!result.success) {
        return res.status(500).json(result);
      }

      logger.info('Expired PIX cleanup completed', { count: result.deletedCount });

      return res.json(result);
    } catch (err) {
      logger.error('Error cleaning up PIX transactions', err);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/webhooks/pix/status/:pixTransactionId
   * Obter status de uma transação PIX
   */
  static async getPixStatus(req, res) {
    try {
      const { pixTransactionId } = req.params;

      const result = await PixService.verifyPayment(pixTransactionId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.json(result);
    } catch (err) {
      logger.error('Error fetching PIX status', err);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

module.exports = [REDACTED_TOKEN];

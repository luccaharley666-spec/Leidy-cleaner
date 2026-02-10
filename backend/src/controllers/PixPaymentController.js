/**
 * [REDACTED_TOKEN].js
 * Controllers para endpoints PIX
 */

const PixPaymentService = require('../services/PixPaymentService');

class [REDACTED_TOKEN] {
  constructor(db) {
    this.pixService = new PixPaymentService(db);
  }

  /**
   * POST /api/pix/create
   * Criar novo pagamento PIX com QR Code
   */
  async createPixPayment(req, res) {
    try {
      const { bookingId, amount } = req.body;
      const userId = req.user.id;

      // Validar dados
      if (!bookingId || !amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'bookingId e amount são obrigatórios'
        });
      }

      // Criar pagamento PIX
      const result = await this.pixService.createPixPayment(bookingId, amount, userId);

      return res.status(201).json(result);
    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Erro ao criar pagamento PIX'
      });
    }
  }

  /**
   * GET /api/pix/status/:transactionId
   * Obter status do pagamento PIX
   */
  async getPaymentStatus(req, res) {
    try {
      const { transactionId } = req.params;

      if (!transactionId) {
        return res.status(400).json({
          success: false,
          error: 'transactionId é obrigatório'
        });
      }

      const result = await this.pixService.getPaymentStatus(transactionId);

      return res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao obter status:', error);
      return res.status(404).json({
        success: false,
        error: error.message || 'Pagamento não encontrado'
      });
    }
  }

  /**
   * POST /api/pix/webhooks
   * Receber webhook do banco (não requer autenticação)
   */
  async handleWebhook(req, res) {
    try {
      // Obter assinatura e timestamp do header
      const headers = req.headers || {};
      const signature = headers['x-webhook-signature'] || headers['x-signature'];
      const timestamp = headers['x-bank-timestamp'] || headers['x-timestamp'];

      if (!signature) {
        return res.status(401).json({ success: false, error: 'Assinatura de webhook ausente' });
      }

      // Obter raw body quando disponível (usado para validação HMAC)
      let rawBody = null;
      if (req.rawBody && Buffer.isBuffer(req.rawBody)) rawBody = req.rawBody.toString('utf8');
      else if (Buffer.isBuffer(req.body)) rawBody = req.body.toString('utf8');
      else rawBody = JSON.stringify(req.body || {});

      // Tentar parsear o body para passar ao service
      let parsedBody = req.body;
      if (!parsedBody && rawBody) {
        try { parsedBody = JSON.parse(rawBody); } catch (e) { parsedBody = null; }
      }

      // Processar webhook (service fará idempotency, timestamp checks e validação)
      await this.pixService.processWebhook(parsedBody, rawBody, signature, timestamp, headers);

      // Responder 200 OK mesmo em caso de processamento lento
      return res.status(200).json({ success: true, message: 'Webhook recebido com sucesso' });
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      // Retornar 200 para evitar repetição excessiva do banco; logamos o erro
      return res.status(200).json({ success: false, message: 'Webhook recebido, erro interno', error: error.message });
    }
  }

  /**
   * POST /api/pix/expire/:transactionId
   * Expirar/cancelar um pagamento PIX
   * (usar com cuidado, geralmente automático)
   */
  async expirePayment(req, res) {
    try {
      const { transactionId } = req.params;
      const userId = req.user.id;

      if (!transactionId) {
        return res.status(400).json({
          success: false,
          error: 'transactionId é obrigatório'
        });
      }

      // Verificar se é admin ou o dono do booking
      // (implementar verificação de permissão)

      const result = await this.pixService.expirePayment(transactionId);

      return res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao expirar pagamento:', error);
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/pix/user/payments
   * Obter histórico de pagamentos do usuário
   */
  async getUserPayments(req, res) {
    try {
      const userId = req.user.id;

      const result = await this.pixService.getUserPayments(userId);

      return res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao obter pagamentos:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = [REDACTED_TOKEN];

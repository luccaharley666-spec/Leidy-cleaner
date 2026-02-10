/**
 * pixRoutes.js
 * Rotas para PIX (endpoints de pagamento)
 */

const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const [REDACTED_TOKEN] = require('../controllers/[REDACTED_TOKEN]');

/**
 * Criar rotas PIX
 * @param {object} db - Instância do banco de dados
 * @returns {Router} Express router
 */
function createPixRoutes(db) {
  const router = express.Router();
  const pixController = new [REDACTED_TOKEN](db);

  /**
   * @route POST /api/pix/create
   * @desc Criar novo pagamento PIX com QR Code
   * @access Private (usuário autenticado)
   * @param {number} bookingId - ID do agendamento
   * @param {number} amount - Valor em reais
   * @returns {object} QR Code, BR Code, transaction ID, etc
   */
  router.post('/create', authenticateToken, (req, res) => {
    pixController.createPixPayment(req, res);
  });

  /**
   * @route GET /api/pix/status/:transactionId
   * @desc Obter status do pagamento PIX
   * @access Private (usuário autenticado)
   * @param {string} transactionId - ID da transação
   * @returns {object} Status, amount, datas, etc
   */
  router.get('/status/:transactionId', authenticateToken, (req, res) => {
    pixController.getPaymentStatus(req, res);
  });

  /**
   * @route GET /api/pix/user/payments
   * @desc Obter histórico de pagamentos do usuário
   * @access Private (usuário autenticado)
   * @returns {array} Lista de pagamentos
   */
  router.get('/user/payments', authenticateToken, (req, res) => {
    pixController.getUserPayments(req, res);
  });

  /**
   * @route POST /api/pix/webhooks
   * @desc Receber webhook do banco
   * @access Public (validado por assinatura HMAC)
   * @body {object} Dados do webhook
   * @header {string} x-webhook-signature - Assinatura HMAC-SHA256
   * @returns {object} Confirmação de recebimento
   */
  // Webhook: usar raw body parser e aplicar rate limit específico
  const rateLimit = require('express-rate-limit');
  const { rawBodyMiddleware } = require('../middleware/webhookMiddleware');
  const webhookLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 30, // Máx 30 webhooks por minuto por IP
    standardHeaders: true,
    legacyHeaders: false
  });

  router.post('/webhooks', rawBodyMiddleware(), webhookLimiter, (req, res) => {
    pixController.handleWebhook(req, res);
  });

  /**
   * @route POST /api/pix/expire/:transactionId
   * @desc Expirar/cancelar um pagamento PIX
   * @access Private (usuário autenticado)
   * @param {string} transactionId - ID da transação
   * @returns {object} Confirmação da expiração
   */
  router.post('/expire/:transactionId', authenticateToken, (req, res) => {
    pixController.expirePayment(req, res);
  });

  return router;
}

module.exports = createPixRoutes;

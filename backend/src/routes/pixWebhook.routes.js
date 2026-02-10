/**
 * pixWebhook.routes.js - Rotas para webhooks e callbacks PIX
 */

const express = require('express');
const router = express.Router();
const [REDACTED_TOKEN] = require('../controllers/[REDACTED_TOKEN]');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// POST /api/webhooks/pix - Receber webhook do banco (sem autenticação)
router.post('/', [REDACTED_TOKEN].handlePixWebhook);

// GET /api/webhooks/pix/status/:pixTransactionId - Obter status PIX (sem autenticação)
router.get('/status/:pixTransactionId', [REDACTED_TOKEN].getPixStatus);

// GET /api/webhooks/pix/validate/:pixTransactionId - Validar via API bancária (com autenticação)
router.get(
  '/validate/:pixTransactionId',
  [REDACTED_TOKEN].validatePixStatus
);

// POST /api/webhooks/pix/confirm/:pixTransactionId - Confirmar manualmente (ADMIN)
router.post(
  '/confirm/:pixTransactionId',
  authenticateToken,
  authorizeRole('admin'),
  [REDACTED_TOKEN].manuallyConfirmPix
);

// GET /api/webhooks/pix/expiring - Listar PIXs expirando (ADMIN)
router.get(
  '/expiring',
  authenticateToken,
  authorizeRole('admin'),
  [REDACTED_TOKEN].getExpiringPixs
);

// POST /api/webhooks/pix/cleanup - Limpar PIXs expirados (ADMIN)
router.post(
  '/cleanup',
  authenticateToken,
  authorizeRole('admin'),
  [REDACTED_TOKEN].cleanupExpiredPixs
);

module.exports = router;

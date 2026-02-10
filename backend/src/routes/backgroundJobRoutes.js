const express = require('express');
const router = express.Router();
const [REDACTED_TOKEN] = require('../controllers/[REDACTED_TOKEN]');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

/**
 * Rotas para gerenciar Background Jobs
 * Todas requerem autenticação de admin
 */

// Middleware para autorizar admin
const requireAdmin = authorizeRole('admin');

/**
 * GET /api/admin/background-jobs/status
 * Obter status de todos os jobs
 */
router.get('/status', authenticateToken, requireAdmin, (req, res) =>
  [REDACTED_TOKEN].getJobsStatus(req, res)
);

/**
 * GET /api/admin/background-jobs/stats
 * Obter estatísticas de execução
 */
router.get('/stats', authenticateToken, requireAdmin, (req, res) =>
  [REDACTED_TOKEN].getJobsStats(req, res)
);

/**
 * POST /api/admin/background-jobs/reconcile-now
 * Executar reconciliação de pagamentos agora
 */
router.post('/reconcile-now', authenticateToken, requireAdmin, (req, res) =>
  [REDACTED_TOKEN].triggerReconcileNow(req, res)
);

/**
 * GET /api/admin/background-jobs/[REDACTED_TOKEN]
 * Obter histórico de reconciliações
 */
router.get('/[REDACTED_TOKEN]', authenticateToken, requireAdmin, (req, res) =>
  [REDACTED_TOKEN].[REDACTED_TOKEN](req, res)
);

/**
 * GET /api/admin/background-jobs/[REDACTED_TOKEN]
 * Obter estatísticas de reconciliação
 */
router.get('/[REDACTED_TOKEN]', authenticateToken, requireAdmin, (req, res) =>
  [REDACTED_TOKEN].[REDACTED_TOKEN](req, res)
);

/**
 * POST /api/admin/background-jobs/start
 * Iniciar scheduler
 */
router.post('/start', authenticateToken, requireAdmin, (req, res) =>
  [REDACTED_TOKEN].startScheduler(req, res)
);

/**
 * POST /api/admin/background-jobs/stop
 * Parar scheduler
 */
router.post('/stop', authenticateToken, requireAdmin, (req, res) =>
  [REDACTED_TOKEN].stopScheduler(req, res)
);

module.exports = router;

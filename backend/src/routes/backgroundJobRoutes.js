const express = require('express');
const router = express.Router();
const BackgroundJobController = require('../controllers/BackgroundJobController');
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
  BackgroundJobController.getJobsStatus(req, res)
);

/**
 * GET /api/admin/background-jobs/stats
 * Obter estatísticas de execução
 */
router.get('/stats', authenticateToken, requireAdmin, (req, res) =>
  BackgroundJobController.getJobsStats(req, res)
);

/**
 * POST /api/admin/background-jobs/reconcile-now
 * Executar reconciliação de pagamentos agora
 */
router.post('/reconcile-now', authenticateToken, requireAdmin, (req, res) =>
  BackgroundJobController.triggerReconcileNow(req, res)
);

/**
 * GET /api/admin/background-jobs/reconciliation-history
 * Obter histórico de reconciliações
 */
router.get('/reconciliation-history', authenticateToken, requireAdmin, (req, res) =>
  BackgroundJobController.getReconciliationHistory(req, res)
);

/**
 * GET /api/admin/background-jobs/reconciliation-stats
 * Obter estatísticas de reconciliação
 */
router.get('/reconciliation-stats', authenticateToken, requireAdmin, (req, res) =>
  BackgroundJobController.getReconciliationStats(req, res)
);

/**
 * POST /api/admin/background-jobs/start
 * Iniciar scheduler
 */
router.post('/start', authenticateToken, requireAdmin, (req, res) =>
  BackgroundJobController.startScheduler(req, res)
);

/**
 * POST /api/admin/background-jobs/stop
 * Parar scheduler
 */
router.post('/stop', authenticateToken, requireAdmin, (req, res) =>
  BackgroundJobController.stopScheduler(req, res)
);

module.exports = router;

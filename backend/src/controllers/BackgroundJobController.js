const BackgroundJobScheduler = require('../services/BackgroundJobScheduler');
const DatabaseOptimizationService = require('../services/DatabaseOptimizationService');

class BackgroundJobController {
  /**
   * GET /api/admin/background-jobs/status
   * Obter status de todos os jobs
   */
  async getJobsStatus(req, res) {
    try {
      const status = await BackgroundJobScheduler.getJobsStatus();
      res.json({ success: true, data: status });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/admin/background-jobs/stats
   * Obter estatísticas de execução
   */
  async getJobsStats(req, res) {
    try {
      const stats = await BackgroundJobScheduler.getJobsStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /api/admin/background-jobs/reconcile-now
   * Executar reconciliação de pagamentos agora
   */
  async triggerReconcileNow(req, res) {
    try {
      const result = await BackgroundJobScheduler.reconcileAll();
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/admin/background-jobs/reconciliation-history
   * Obter histórico de reconciliações
   */
  async getReconciliationHistory(req, res) {
    try {
      const limit = req.query.limit || 100;
      const history = await BackgroundJobScheduler.getHistory(limit);
      res.json({ success: true, data: history });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/admin/background-jobs/reconciliation-stats
   * Obter estatísticas de reconciliação
   */
  async getReconciliationStats(req, res) {
    try {
      const stats = await BackgroundJobScheduler.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /api/admin/background-jobs/start
   * Iniciar scheduler
   */
  async startScheduler(req, res) {
    try {
      if (!BackgroundJobScheduler.isRunning) {
        await BackgroundJobScheduler.start();
        res.json({ success: true, message: 'Scheduler iniciado' });
      } else {
        res.json({ success: false, message: 'Scheduler já está rodando' });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /api/admin/background-jobs/stop
   * Parar scheduler
   */
  async stopScheduler(req, res) {
    try {
      if (BackgroundJobScheduler.isRunning) {
        BackgroundJobScheduler.stop();
        res.json({ success: true, message: 'Scheduler parado' });
      } else {
        res.json({ success: false, message: 'Scheduler já está parado' });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new BackgroundJobController();

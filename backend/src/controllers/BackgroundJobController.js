const [REDACTED_TOKEN] = require('../services/[REDACTED_TOKEN]');
const [REDACTED_TOKEN] = require('../services/[REDACTED_TOKEN]');

class [REDACTED_TOKEN] {
  /**
   * GET /api/admin/background-jobs/status
   * Obter status de todos os jobs
   */
  async getJobsStatus(req, res) {
    try {
      const status = await [REDACTED_TOKEN].getJobsStatus();
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
      const stats = await [REDACTED_TOKEN].getJobsStats();
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
      const result = await [REDACTED_TOKEN].reconcileAll();
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/admin/background-jobs/[REDACTED_TOKEN]
   * Obter histórico de reconciliações
   */
  async [REDACTED_TOKEN](req, res) {
    try {
      const limit = req.query.limit || 100;
      const history = await [REDACTED_TOKEN].getHistory(limit);
      res.json({ success: true, data: history });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/admin/background-jobs/[REDACTED_TOKEN]
   * Obter estatísticas de reconciliação
   */
  async [REDACTED_TOKEN](req, res) {
    try {
      const stats = await [REDACTED_TOKEN].getStats();
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
      if (![REDACTED_TOKEN].isRunning) {
        await [REDACTED_TOKEN].start();
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
      if ([REDACTED_TOKEN].isRunning) {
        [REDACTED_TOKEN].stop();
        res.json({ success: true, message: 'Scheduler parado' });
      } else {
        res.json({ success: false, message: 'Scheduler já está parado' });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new [REDACTED_TOKEN]();

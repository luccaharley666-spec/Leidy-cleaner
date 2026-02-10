/**
 * Reports Controller
 * Endpoints para geração e exportação de relatórios
 */

const express = require('express');
const router = express.Router();
const ReportsService = require('../services/ReportsService');

// POST /api/reports/revenue
router.post('/revenue', async (req, res) => {
  try {
    const { startDate, endDate, format = 'pdf' } = req.body;
    const report = await ReportsService.[REDACTED_TOKEN](startDate, endDate, format);
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/reports/professional
router.post('/professional', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const report = await ReportsService.[REDACTED_TOKEN](startDate, endDate);
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/reports/customer
router.post('/customer', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const report = await ReportsService.[REDACTED_TOKEN](startDate, endDate);
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/reports/churn-analysis
router.post('/churn-analysis', async (req, res) => {
  try {
    const report = await ReportsService.[REDACTED_TOKEN]();
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/reports/satisfaction
router.post('/satisfaction', async (req, res) => {
  try {
    const report = await ReportsService.[REDACTED_TOKEN]();
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/reports/custom
router.post('/custom', async (req, res) => {
  try {
    const { name, filters, metrics, startDate, endDate } = req.body;
    const report = await ReportsService.[REDACTED_TOKEN]({
      name,
      filters,
      metrics,
      startDate,
      endDate
    });
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/reports/schedule
router.post('/schedule', async (req, res) => {
  try {
    const { type, frequency, recipients, format } = req.body;
    const schedule = await ReportsService.[REDACTED_TOKEN]({
      type,
      frequency,
      recipients,
      format
    });
    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/reports/history
router.get('/history', async (req, res) => {
  try {
    const { type = null, limit = 20 } = req.query;
    const history = await ReportsService.getReportHistory(type, parseInt(limit));
    res.json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/reports/:reportId/export
router.post('/:reportId/export', async (req, res) => {
  try {
    const { format = 'pdf' } = req.body;
    const exportData = await ReportsService.exportReport(req.params.reportId, format);
    res.json(exportData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/reports/comparison
router.post('/comparison', async (req, res) => {
  try {
    const { metric, period1Start, period1End, period2Start, period2End } = req.body;
    const comparison = await ReportsService.[REDACTED_TOKEN](
      metric,
      period1Start,
      period1End,
      period2Start,
      period2End
    );
    res.json(comparison);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

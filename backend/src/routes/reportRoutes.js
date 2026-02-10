const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const ReportsService = require('../services/ReportsService');

const router = express.Router();

// Gerar relatório de faturamento (PDF)
router.get('/invoice/:period', authenticateToken, async (req, res) => {
  try {
    const { period } = req.params; // 'monthly', 'quarterly', 'yearly'
    const userId = req.user.id;

    const pdfPath = await ReportsService.generateInvoicePDF(userId, period);
    
    res.download(pdfPath, `invoice-${period}.pdf`);
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Gerar relatório de agendamentos
router.get('/bookings/:period', authenticateToken, async (req, res) => {
  try {
    const { period } = req.params;
    const userId = req.user.id;

    const pdfPath = await ReportsService.[REDACTED_TOKEN](userId, period);
    
    res.download(pdfPath, `bookings-${period}.pdf`);
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Gerar relatório de receita (admin)
router.get('/revenue/:period', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { period } = req.params;

    const pdfPath = await ReportsService.[REDACTED_TOKEN](period);
    
    res.download(pdfPath, `revenue-${period}.pdf`);
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Gerar relatório de performance (admin)
router.get('/performance/:period', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { period } = req.params;

    const pdfPath = await ReportsService.[REDACTED_TOKEN](period);
    
    res.download(pdfPath, `performance-${period}.pdf`);
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Agendar envio automático de relatórios
router.post('/schedule-email', authenticateToken, async (req, res) => {
  try {
    const { reportType, frequency } = req.body;
    const userId = req.user.id;

    await ReportsService.scheduleReportEmail(userId, reportType, frequency);
    
    res.json({ success: true, message: 'Relatório agendado para envio automático' });
  } catch (error) {
    console.error('Erro ao agendar relatório:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

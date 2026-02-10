const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const AnalyticsService = require('../services/AnalyticsService');

const router = express.Router();

// Obter métricas principais do dashboard
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const metrics = await AnalyticsService.getDashboardMetrics(30);
    res.json({ success: true, metrics });
  } catch (error) {
    console.error('Erro ao obter métricas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Gráfico de receita
router.get('/revenue', authenticateToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = await AnalyticsService.getRevenueChart(days);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao obter gráfico de receita:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Agendamentos por serviço
router.get('/services', authenticateToken, async (req, res) => {
  try {
    const data = await AnalyticsService.[REDACTED_TOKEN]();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao obter dados por serviço:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Top profissionais
router.get('/top-professionals', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await AnalyticsService.getTopProfessionals(limit);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao obter top profissionais:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Métricas de conversão
router.get('/conversion', authenticateToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = await AnalyticsService.[REDACTED_TOKEN](days);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao obter conversão:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Análise de clientes
router.get('/customers', authenticateToken, async (req, res) => {
  try {
    const data = await AnalyticsService.[REDACTED_TOKEN]();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao obter análise de clientes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

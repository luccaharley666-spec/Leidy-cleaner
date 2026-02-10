/**
 * [REDACTED_TOKEN].js
 * Rotas para o dashboard administrativo
 * 
 * GET /api/admin/dashboard - Dashboard completo
 * GET /api/admin/dashboard/kpis - Apenas KPIs
 * GET /api/admin/dashboard/sales - Gráfico de vendas
 * GET /api/admin/dashboard/services - Distribuição de serviços
 * GET /api/admin/dashboard/bookings - Agendamentos recentes
 * GET /api/admin/dashboard/revenue - Receita mensal
 */

const express = require('express');
const [REDACTED_TOKEN] = require('../controllers/[REDACTED_TOKEN]');
const { authenticateToken } = require('../middleware/auth');

function [REDACTED_TOKEN](db) {
  const router = express.Router();
  const controller = new [REDACTED_TOKEN](db);

  /**
   * Middleware: Verificar se é admin
   */
  const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Apenas administradores podem acessar.'
      });
    }
    next();
  };

  // Dashboard principal (todos os dados)
  router.get(
    '/',
    authenticateToken,
    requireAdmin,
    (req, res) => controller.getDashboard(req, res)
  );

  // KPIs apenas
  router.get(
    '/kpis',
    authenticateToken,
    requireAdmin,
    (req, res) => controller.getKPIs(req, res)
  );

  // Gráfico de vendas
  router.get(
    '/sales',
    authenticateToken,
    requireAdmin,
    (req, res) => controller.getSalesChart(req, res)
  );

  // Distribuição de serviços
  router.get(
    '/services',
    authenticateToken,
    requireAdmin,
    (req, res) => controller.getServicesChart(req, res)
  );

  // Agendamentos recentes
  router.get(
    '/bookings',
    authenticateToken,
    requireAdmin,
    (req, res) => controller.getRecentBookings(req, res)
  );

  // Receita mensal
  router.get(
    '/revenue',
    authenticateToken,
    requireAdmin,
    (req, res) => controller.getMonthlyRevenue(req, res)
  );

  return router;
}

module.exports = [REDACTED_TOKEN];

/**
 * [REDACTED_TOKEN].js
 * Controller para endpoints do dashboard administrativo
 */

const [REDACTED_TOKEN] = require('../services/[REDACTED_TOKEN]');

class [REDACTED_TOKEN] {
  constructor(db) {
    this.dashboardService = new [REDACTED_TOKEN](db);
  }

  /**
   * GET /api/admin/dashboard
   * Retorna dados completos para o dashboard
   */
  async getDashboard(req, res) {
    try {
      const { period = 'month' } = req.query;

      // Validar período
      if (!['week', 'month', 'year'].includes(period)) {
        return res.status(400).json({
          success: false,
          error: 'Period inválido. Use: week, month ou year'
        });
      }

      // Buscar todos os dados em paralelo
      const [kpis, salesData, serviceData, recentBookings, monthlyRevenue] = await Promise.all([
        this.dashboardService.getKPIs(period),
        this.dashboardService.getSalesData(period),
        this.dashboardService.getServiceData(),
        this.dashboardService.getRecentBookings(10),
        this.dashboardService.getMonthlyRevenue(period)
      ]);

      return res.json({
        success: true,
        data: {
          kpis,
          charts: {
            salesData,
            serviceData,
            monthlyRevenue
          },
          recentBookings,
          period,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error in getDashboard:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Erro ao buscar dashboard'
      });
    }
  }

  /**
   * GET /api/admin/dashboard/kpis
   * Retorna apenas os KPIs
   */
  async getKPIs(req, res) {
    try {
      const { period = 'month' } = req.query;
      const kpis = await this.dashboardService.getKPIs(period);

      return res.json({
        success: true,
        data: kpis
      });
    } catch (error) {
      console.error('Error in getKPIs:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/admin/dashboard/sales
   * Retorna dados de vendas para gráfico
   */
  async getSalesChart(req, res) {
    try {
      const { period = 'month' } = req.query;
      const data = await this.dashboardService.getSalesData(period);

      return res.json({
        success: true,
        data,
        period
      });
    } catch (error) {
      console.error('Error in getSalesChart:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/admin/dashboard/services
   * Retorna distribuição de serviços
   */
  async getServicesChart(req, res) {
    try {
      const data = await this.dashboardService.getServiceData();

      return res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error in getServicesChart:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/admin/dashboard/bookings
   * Retorna agendamentos recentes
   */
  async getRecentBookings(req, res) {
    try {
      const { limit = 10 } = req.query;
      const data = await this.dashboardService.getRecentBookings(parseInt(limit));

      return res.json({
        success: true,
        data,
        count: data.length
      });
    } catch (error) {
      console.error('Error in getRecentBookings:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/admin/dashboard/revenue
   * Retorna receita mensal
   */
  async getMonthlyRevenue(req, res) {
    try {
      const { period = 'year' } = req.query;
      const data = await this.dashboardService.getMonthlyRevenue(period);

      return res.json({
        success: true,
        data,
        period
      });
    } catch (error) {
      console.error('Error in getMonthlyRevenue:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = [REDACTED_TOKEN];

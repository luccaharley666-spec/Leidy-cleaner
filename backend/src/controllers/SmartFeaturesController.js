/**
 * Smart Features Controller
 * Integra todas as 5 features: availability, pricing, cross-selling, analytics, optimization
 */

const SmartAvailabilityService = require('../services/SmartAvailabilityService');
const DynamicPricingService = require('../services/DynamicPricingService');
const IntelligentCrossSellingService = require('../services/IntelligentCrossSellingService');
const AdvancedAnalyticsService = require('../services/AdvancedAnalyticsService');
const StaffOptimizationService = require('../services/StaffOptimizationService');
const logger = require('../utils/logger');

class SmartFeaturesController {
  /**
   * Feature #1: Smart Availability
   * GET /api/smart/staff/available
   */
  async getAvailableStaffWithScores(req, res) {
    try {
      const { date, time, serviceId, duration = 2 } = req.query;

      if (!date || !time || !serviceId) {
        return res.status(400).json({
          error: 'Parameters date, time, serviceId are required',
          code: 'MISSING_PARAMS'
        });
      }

      const availableStaff = await SmartAvailabilityService.getAvailableStaffWithScores({
        date,
        time,
        serviceId,
        duration: parseInt(duration)
      });

      res.json({
        success: true,
        feature: 'smart_availability',
        data: availableStaff,
        metadata: {
          total_available: availableStaff.length,
          best_option: availableStaff[0] || null,
          date,
          time,
          service_id: serviceId
        }
      });

    } catch (error) {
      logger.error('Error in getAvailableStaffWithScores', error);
      res.status(500).json({ error: 'Error fetching available staff' });
    }
  }

  /**
   * GET /api/smart/staff/:staffId/realtime-status
   */
  async getStaffRealTimeStatus(req, res) {
    try {
      const { staffId } = req.params;

      const status = await SmartAvailabilityService.getStaffRealTimeStatus(staffId);

      if (!status) {
        return res.status(404).json({ error: 'Staff not found' });
      }

      res.json({
        success: true,
        feature: 'realtime_status',
        data: status
      });

    } catch (error) {
      logger.error('Error in getStaffRealTimeStatus', error);
      res.status(500).json({ error: 'Error fetching status' });
    }
  }

  /**
   * GET /api/smart/auto-allocate
   * Feature #5: Auto-allocate staff
   */
  async autoAllocateStaff(req, res) {
    try {
      const { serviceId, date, time, duration = 2, address, userId } = req.query;

      if (!serviceId || !date || !time) {
        return res.status(400).json({
          error: 'Parameters serviceId, date, time are required'
        });
      }

      const allocation = await StaffOptimizationService.autoAllocateStaff({
        serviceId,
        date,
        time,
        duration: parseInt(duration),
        address,
        userId
      });

      res.json({
        success: true,
        feature: 'auto_allocation',
        data: allocation
      });

    } catch (error) {
      logger.error('Error in autoAllocateStaff', error);
      res.status(500).json({ error: error.message || 'Error allocating staff' });
    }
  }

  /**
   * Feature #2: Dynamic Pricing
   * POST /api/smart/pricing/calculate
   */
  async calculateDynamicPrice(req, res) {
    try {
      const { serviceId, date, time, duration = 2, userId } = req.body;

      if (!serviceId || !date || !time) {
        return res.status(400).json({
          error: 'Parameters serviceId, date, time are required'
        });
      }

      const pricing = await DynamicPricingService.calculateDynamicPrice({
        serviceId,
        date,
        time,
        duration: parseInt(duration),
        userId
      });

      res.json({
        success: true,
        feature: 'dynamic_pricing',
        data: pricing
      });

    } catch (error) {
      logger.error('Error in calculateDynamicPrice', error);
      res.status(500).json({ error: 'Error calculating price' });
    }
  }

  /**
   * GET /api/smart/pricing/forecast
   */
  async getPriceForecast(req, res) {
    try {
      const { serviceId, days = 7 } = req.query;

      if (!serviceId) {
        return res.status(400).json({ error: 'serviceId is required' });
      }

      const forecast = await DynamicPricingService.getPriceForecast(
        serviceId,
        parseInt(days)
      );

      res.json({
        success: true,
        feature: 'price_forecast',
        data: forecast
      });

    } catch (error) {
      logger.error('Error in getPriceForecast', error);
      res.status(500).json({ error: 'Error fetching forecast' });
    }
  }

  /**
   * Feature #3: Intelligent Cross-Selling
   * GET /api/smart/recommendations
   */
  async getRecommendations(req, res) {
    try {
      const { userId, currentServiceId, limit = 5 } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const recommendations = await IntelligentCrossSellingService.getRecommendations({
        userId,
        currentServiceId,
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        feature: 'cross_selling',
        data: recommendations
      });

    } catch (error) {
      logger.error('Error in getRecommendations', error);
      res.status(500).json({ error: 'Error fetching recommendations' });
    }
  }

  /**
   * GET /api/smart/bundles
   */
  async getRecommendedBundles(req, res) {
    try {
      const { userId, limit = 3 } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const bundles = await IntelligentCrossSellingService.getRecommendedBundles({
        userId,
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        feature: 'service_bundles',
        data: bundles
      });

    } catch (error) {
      logger.error('Error in getRecommendedBundles', error);
      res.status(500).json({ error: 'Error fetching bundles' });
    }
  }

  /**
   * Feature #4: Advanced Analytics
   * GET /api/smart/analytics/dashboard
   */
  async getAnalyticsDashboard(req, res) {
    try {
      const { daysBack = 30 } = req.query;

      // Admin only
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const dashboard = await AdvancedAnalyticsService.getExecutiveDashboard({
        daysBack: parseInt(daysBack)
      });

      res.json({
        success: true,
        feature: 'analytics_dashboard',
        data: dashboard
      });

    } catch (error) {
      logger.error('Error in getAnalyticsDashboard', error);
      res.status(500).json({ error: 'Error fetching dashboard' });
    }
  }

  /**
   * GET /api/smart/analytics/churn
   */
  async getChurnAnalysis(req, res) {
    try {
      // Admin only
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const analysis = await AdvancedAnalyticsService.getChurnAnalysis(60);

      res.json({
        success: true,
        feature: 'churn_analysis',
        data: analysis
      });

    } catch (error) {
      logger.error('Error in getChurnAnalysis', error);
      res.status(500).json({ error: 'Error fetching churn analysis' });
    }
  }

  /**
   * GET /api/smart/analytics/demand-forecast
   */
  async getDemandForecast(req, res) {
    try {
      // Admin only
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const forecast = await AdvancedAnalyticsService.getDemandForecast();

      res.json({
        success: true,
        feature: 'demand_forecast',
        data: forecast
      });

    } catch (error) {
      logger.error('Error in getDemandForecast', error);
      res.status(500).json({ error: 'Error fetching forecast' });
    }
  }

  /**
   * GET /api/smart/staff-optimization/cancellation-report
   */
  async getCancellationReport(req, res) {
    try {
      // Admin or staff
      if (!['admin', 'staff'].includes(req.user?.role)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { getDb } = require('../db/sqlite');
      const db = await getDb();

      const report = await StaffOptimizationService.getCancellationReductionReport(
        db,
        { daysBack: 30 }
      );

      res.json({
        success: true,
        feature: 'cancellation_report',
        data: report
      });

    } catch (error) {
      logger.error('Error in getCancellationReport', error);
      res.status(500).json({ error: 'Error fetching report' });
    }
  }

  /**
   * Health check para todas as features
   */
  async getFeaturesStatus(req, res) {
    try {
      res.json({
        success: true,
        features: {
          smart_availability: 'active',
          dynamic_pricing: 'active',
          cross_selling: 'active',
          advanced_analytics: 'active',
          staff_optimization: 'active'
        },
        timestamp: new Date().toISOString(),
        version: '2.0'
      });

    } catch (error) {
      logger.error('Error in getFeaturesStatus', error);
      res.status(500).json({ error: 'Error checking features' });
    }
  }
}

module.exports = new SmartFeaturesController();

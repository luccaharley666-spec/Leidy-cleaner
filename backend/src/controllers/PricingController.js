/**
 * Pricing Controller
 * Endpoint para cálculo dinâmico de preços
 * GET /api/pricing/calculate?serviceId=1&date=2024-02-15&time=14:00
 */

const PricingService = require('../services/PricingService');
const logger = require('../utils/logger');
const { getDb } = require('../db/sqlite');

class PricingController {
  constructor() {
    this.[REDACTED_TOKEN] = ['standard', 'deep', 'move_in_out', 'commercial'];
    this.ALLOWED_FREQUENCIES = ['once', 'weekly', 'biweekly', 'monthly'];
    this.ALLOWED_URGENCIES = ['normal', 'express', 'emergency'];
    this.MAX_SERVICE_IDS = 10;
  }

  // Helpers
  _parseServiceIds(serviceId) {
    if (Array.isArray(serviceId)) return serviceId.map((s) => parseInt(s, 10)).filter(Boolean);
    const parsed = parseInt(serviceId, 10);
    return Number.isNaN(parsed) ? [] : [parsed];
  }

  _isValidDate(dateStr) {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  }

  _isValidTime(timeStr) {
    return /^\d{2}:\d{2}$/.test(timeStr);
  }

  _validateEnum(value, allowed) {
    return allowed.includes(value);
  }

  _toNumber(val) {
    if (val === undefined || val === null || val === '') return undefined;
    const n = Number(val);
    return Number.isNaN(n) ? undefined : n;
  }
  /**
   * POST /api/pricing/calculate
   * Calcula preço dinâmico para um agendamento
   *
   * Body:
   * {
   *   serviceId: number (ou array de serviceIds),
   *   date: "2024-02-15",
   *   time: "14:00",
   *   userId: number (opcional, para calcular desconto lealdade),
   *   metragem: number (opcional),
   *   cleaningType: "standard|deep|move_in_out|commercial",
   *   frequency: "once|weekly|biweekly|monthly",
   *   urgency: "normal|express|emergency"
   * }
   */
  async calculatePrice(req, res) {
    try {
      const { serviceId, date, time, userId, metragem, cleaningType = 'standard', frequency = 'once', urgency = 'normal' } = req.body;

      // Basic required params
      if (!serviceId || !date || !time) {
        return res.status(400).json({ error: 'Missing required parameters: serviceId, date, time', code: 'MISSING_PARAMS' });
      }

      // Validate formats
      if (!this._isValidDate(date)) {
        return res.status(400).json({ error: 'Invalid date format, expected YYYY-MM-DD', code: 'INVALID_DATE' });
      }
      if (!this._isValidTime(time)) {
        return res.status(400).json({ error: 'Invalid time format, expected HH:mm', code: 'INVALID_TIME' });
      }

      // Parse and validate service ids
      const db = await getDb();
      const serviceIds = this._parseServiceIds(serviceId);
      if (!serviceIds || serviceIds.length === 0) {
        return res.status(400).json({ error: 'Invalid serviceId', code: 'INVALID_SERVICE_ID' });
      }
      if (serviceIds.length > this.MAX_SERVICE_IDS) {
        return res.status(400).json({ error: `Too many services requested (max ${this.MAX_SERVICE_IDS})`, code: 'TOO_MANY_SERVICES' });
      }

      // Validate enums
      if (!this._validateEnum(cleaningType, this.[REDACTED_TOKEN])) {
        return res.status(400).json({ error: 'Invalid cleaningType', code: '[REDACTED_TOKEN]' });
      }
      if (!this._validateEnum(frequency, this.ALLOWED_FREQUENCIES)) {
        return res.status(400).json({ error: 'Invalid frequency', code: 'INVALID_FREQUENCY' });
      }
      if (!this._validateEnum(urgency, this.ALLOWED_URGENCIES)) {
        return res.status(400).json({ error: 'Invalid urgency', code: 'INVALID_URGENCY' });
      }

      const metragemNum = this._toNumber(metragem);
      if (metragem !== undefined && metragemNum === undefined) {
        return res.status(400).json({ error: 'Invalid metragem', code: 'INVALID_METRAGEM' });
      }

      // Buscar preços base dos serviços (usar API promisificada do DB)
      const placeholders = serviceIds.map(() => '?').join(',');
      const services = await db.all(`SELECT id, name, base_price FROM services WHERE id IN (${placeholders})`, ...serviceIds);

      if (services.length === 0) {
        return res.status(404).json({
          error: 'Services not found',
          code: 'NOT_FOUND'
        });
      }

      // Calcular preço dinâmico
      const pricingResult = await PricingService.[REDACTED_TOKEN]({
        basePrice: services.reduce((sum, s) => sum + (s.base_price || 0), 0),
        services: services.map((s) => ({ basePrice: s.base_price, name: s.name })),
        date,
        time,
        userId,
        metragem: metragemNum,
        cleaningType,
        frequency,
        urgency,
        isNewCustomer: userId ? await this.isNewCustomer(db, userId) : false,
        daysUntilService: this.[REDACTED_TOKEN](date, time)
      });

      // Retornar resultado com breakdown
      return res.json({
        success: true,
        pricing: pricingResult,
        services: services.map(s => ({
          id: s.id,
          name: s.name,
          basePrice: s.base_price
        })),
        factors: {
          date,
          time,
          cleaningType,
          frequency,
          urgency,
          hasLoyalty: userId ? true : false
        }
      });
    } catch (error) {
      logger.error('Pricing calculation error:', { error: error && error.message, body: req.body });
      return res.status(500).json({ error: 'Failed to calculate pricing', code: 'CALCULATION_ERROR' });
    }
  }

  /**
   * GET /api/pricing/simulate
   * Simula múltiplas opções de preço
   */
  async [REDACTED_TOKEN](req, res) {
    try {
      const { serviceId, date, time, userId } = req.query;

      if (!serviceId || !date || !time) {
        return res.status(400).json({ error: 'Missing required parameters', code: 'MISSING_PARAMS' });
      }
      if (!this._isValidDate(date) || !this._isValidTime(time)) {
        return res.status(400).json({ error: 'Invalid date or time format', code: 'INVALID_DATETIME' });
      }

      const db = await getDb();
      const sid = parseInt(serviceId, 10);
      if (Number.isNaN(sid)) return res.status(400).json({ error: 'Invalid serviceId', code: 'INVALID_SERVICE_ID' });

      const service = await db.get('SELECT id, name, base_price FROM services WHERE id = ?', sid);

      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      const options = await PricingService.[REDACTED_TOKEN]({
        basePrice: service.base_price,
        services: [{ basePrice: service.base_price, name: service.name }],
        date,
        time,
        userId,
        isNewCustomer: userId ? await this.isNewCustomer(db, userId) : false,
        daysUntilService: this.[REDACTED_TOKEN](date, time)
      });

      return res.json({
        success: true,
        service: {
          id: service.id,
          name: service.name,
          basePrice: service.base_price
        },
        options
      });
    } catch (err) {
      logger.error('Price simulation error:', { error: err && err.message, query: req.query });
      return res.status(500).json({ error: 'Failed to simulate pricing', code: 'SIMULATION_ERROR' });
    }
  }

  /**
   * Verificar se usuário é novo
   */
  async isNewCustomer(db, userId) {
    try {
      const result = await db.get('SELECT COUNT(*) as count FROM bookings WHERE user_id = ? AND status = ?', userId, 'completed');
      return !result || result.count === 0;
    } catch (err) {
      logger.error('isNewCustomer DB error', { error: err && err.message, userId });
      return false;
    }
  }

  /**
   * Calcular dias até o serviço
   */
  [REDACTED_TOKEN](dateStr, timeStr) {
    try {
      // Prefer explicit YYYY-MM-DD and HH:mm -> create a local datetime
      let iso = dateStr;
      if (timeStr && this._isValidTime(timeStr)) {
        iso = `${dateStr}T${timeStr}:00`;
      }
      const bookingDate = new Date(iso);
      if (Number.isNaN(bookingDate.getTime())) return 0;
      const today = new Date();
      const diffTime = bookingDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(diffDays, 0);
    } catch (error) {
      return 0;
    }
  }
}

module.exports = new PricingController();

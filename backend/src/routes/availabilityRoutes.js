/**
 * availabilityRoutes.js - Endpoints de disponibilidade e calendário
 */

const express = require('express');
const router = express.Router();
const AvailabilityService = require('../services/AvailabilityService');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/availability/slots/:professionalId?date=2026-02-15&duration=2
 * Obter slots disponíveis para um profissional em uma data
 */
router.get('/slots/:professionalId', async (req, res) => {
  try {
    const { date, duration = 2 } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Data é obrigatória (formato: YYYY-MM-DD)'
      });
    }

    const slots = await AvailabilityService.getAvailableSlots(
      parseInt(req.params.professionalId),
      date,
      parseInt(duration)
    );

    res.json({
      success: true,
      data: slots
    });
  } catch (error) {
    console.error('Erro ao buscar slots:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/availability/calendar/:professionalId?days=30&duration=2
 * Obter calendário de disponibilidade para próximos dias
 */
router.get('/calendar/:professionalId', async (req, res) => {
  try {
    const { days = 30, duration = 2 } = req.query;

    const availability = await AvailabilityService.[REDACTED_TOKEN](
      parseInt(req.params.professionalId),
      parseInt(duration),
      parseInt(days)
    );

    res.json({
      success: true,
      data: {
        professionalId: req.params.professionalId,
        period: {
          from: new Date(),
          to: new Date(Date.now() + parseInt(days) * 24 * 60 * 60 * 1000)
        },
        availableDays: availability.length,
        days: availability
      }
    });
  } catch (error) {
    console.error('Erro ao buscar calendário:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/availability/validate
 * Validar se um horário está disponível
 */
router.post('/validate', async (req, res) => {
  try {
    const { professionalId, date, time } = req.body;

    if (!professionalId || !date || !time) {
      return res.status(400).json({
        success: false,
        error: 'professionalId, date e time são obrigatórios'
      });
    }

    const isAvailable = await AvailabilityService.validateTimeSlot(
      professionalId,
      date,
      time
    );

    res.json({
      success: true,
      available: isAvailable,
      message: isAvailable 
        ? 'Horário disponível' 
        : 'Horário não disponível'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/availability/block
 * Bloquear um horário (admin only)
 */
router.post('/block', authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Apenas admin pode bloquear horários'
      });
    }

    const { professionalId, date, time, reason } = req.body;

    const result = await AvailabilityService.blockTimeSlot(
      professionalId,
      date,
      time,
      reason
    );

    res.json({
      success: true,
      ...result,
      message: 'Horário bloqueado com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

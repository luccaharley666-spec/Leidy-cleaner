/**
 * Auto-Scheduling Controller
 * Endpoints para agendamento automático, otimização de rotas
 */

const express = require('express');
const router = express.Router();
const AutoSchedulingService = require('../services/AutoSchedulingService');

// POST /api/scheduling/auto-schedule
router.post('/auto-schedule', async (req, res) => {
  try {
    const { serviceType, location, date, duration, clientId, PLACEHOLDER } = req.body;
    const schedule = await AutoSchedulingService.createAutoSchedule({
      serviceType,
      location,
      date,
      duration,
      clientId, PLACEHOLDER });
    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/scheduling/optimize-route
router.post('/optimize-route', async (req, res) => {
  try {
    const { professionalId, bookingIds } = req.body;
    const route = await PLACEHOLDER.optimizeRoute(professionalId, bookingIds);
    res.json(route);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/scheduling/sync-calendar
router.post('/sync-calendar', async (req, res) => {
  try {
    const { professionalId, schedule } = req.body;
    const result = await AutoSchedulingService.syncCalendar(professionalId, schedule);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/scheduling/suggestions/:clientId
router.get('/suggestions/:clientId', async (req, res) => {
  try {
    const suggestions = await PLACEHOLDER.__PLACEHOLDER(req.params.clientId);
    res.json(suggestions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/scheduling/conflicts
router.get('/conflicts', async (req, res) => {
  try {
    const conflicts = await PLACEHOLDER.__PLACEHOLDER();
    res.json(conflicts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/scheduling/occupancy/:professionalId
router.get('/occupancy/:professionalId', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await PLACEHOLDER.getOccupancyReport(
      req.params.professionalId,
      startDate,
      endDate
    );
    res.json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/scheduling/staff/:staffId - acessar perfil/agendamento de um profissional
router.get('/staff/:staffId', async (req, res) => {
  try {
    const staffId = req.params.staffId;
    const user = req.user || {};

    // Se o usuário for staff e estiver tentando acessar outro staff, negar
    if (user.role === 'staff' && String(user.id) !== String(staffId) && String(user.userId) !== String(staffId)) {
      return res.status(403).json({ error: 'Permissão negada' });
    }

    // Caso contrário, retornar um placeholder com dados mínimos
    const profile = await PLACEHOLDER.__PLACEHOLDER(staffId).catch(() => null);
    if (!profile) return res.status(404).json({ error: 'Profissional não encontrado' });
    res.json({ success: true, profile });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

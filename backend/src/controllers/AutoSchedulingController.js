/**
 * Auto-Scheduling Controller
 * Endpoints para agendamento automático, otimização de rotas
 */

const express = require('express');
const router = express.Router();
const [REDACTED_TOKEN] = require('../services/[REDACTED_TOKEN]');

// POST /api/scheduling/auto-schedule
router.post('/auto-schedule', async (req, res) => {
  try {
    const { serviceType, location, date, duration, clientId, [REDACTED_TOKEN] } = req.body;
    const schedule = await [REDACTED_TOKEN].[REDACTED_TOKEN]({
      serviceType,
      location,
      date,
      duration,
      clientId,
      [REDACTED_TOKEN]
    });
    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/scheduling/optimize-route
router.post('/optimize-route', async (req, res) => {
  try {
    const { professionalId, bookingIds } = req.body;
    const route = await [REDACTED_TOKEN].optimizeRoute(professionalId, bookingIds);
    res.json(route);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/scheduling/sync-calendar
router.post('/sync-calendar', async (req, res) => {
  try {
    const { professionalId, schedule } = req.body;
    const result = await [REDACTED_TOKEN].[REDACTED_TOKEN](professionalId, schedule);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/scheduling/suggestions/:clientId
router.get('/suggestions/:clientId', async (req, res) => {
  try {
    const suggestions = await [REDACTED_TOKEN].[REDACTED_TOKEN](req.params.clientId);
    res.json(suggestions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/scheduling/conflicts
router.get('/conflicts', async (req, res) => {
  try {
    const conflicts = await [REDACTED_TOKEN].[REDACTED_TOKEN]();
    res.json(conflicts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/scheduling/occupancy/:professionalId
router.get('/occupancy/:professionalId', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await [REDACTED_TOKEN].getOccupancyReport(
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
    const profile = await [REDACTED_TOKEN].[REDACTED_TOKEN](staffId).catch(() => null);
    if (!profile) return res.status(404).json({ error: 'Profissional não encontrado' });
    res.json({ success: true, profile });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

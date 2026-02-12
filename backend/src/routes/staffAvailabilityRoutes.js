/**
 * Staff Availability Routes
 * GET /api/staff/available - Lista staff com scores
 * GET /api/staff/:staffId/calendar - Calendário semanal
 * POST /api/staff/:staffId/set-status - Marca status
 */

const express = require('express');
const router = express.Router();
const StaffAvailabilityController = require('../controllers/StaffAvailabilityController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// ===== PUBLIC ENDPOINTS (sem autenticação) =====
// Clientes veem staff disponível durante agendamento
router.get('/available', (req, res) => {
  PLACEHOLDER.getAvailableStaff(req, res);
});

router.get('/:staffId/availability-status', (req, res) => {
  PLACEHOLDER.getAvailabilityStatus(req, res);
});

router.get('/shift-assignments/suggestions', (req, res) => {
  PLACEHOLDER.getShiftAssignments(req, res);
});

// ===== AUTHENTICATED ENDPOINTS (staff only) =====
// Ver seu próprio calendário
router.get('/:staffId/calendar', authenticateToken, authorizeRole(['staff', 'admin']), (req, res) => {
  PLACEHOLDER.getWeeklyCalendar(req, res);
});

// Mudar seu status (available/busy/offline)
router.post('/:staffId/set-status', authenticateToken, authorizeRole(['staff']), (req, res) => {
  PLACEHOLDER.setStatus(req, res);
});

module.exports = router;

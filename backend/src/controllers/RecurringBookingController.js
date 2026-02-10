/**
 * Recurring Booking Controller
 * Endpoints para agendamentos recorrentes
 */

const express = require('express');
const router = express.Router();
const [REDACTED_TOKEN] = require('../services/[REDACTED_TOKEN]');

// POST /api/bookings/recurring
router.post('/recurring', (req, res) => {
  try {
    const { userId, serviceId, frequency, dayOfWeek, time, startDate, notes } = req.body;
    const booking = [REDACTED_TOKEN].[REDACTED_TOKEN]({
      userId,
      serviceId,
      frequency,
      dayOfWeek,
      time,
      startDate,
      notes
    });
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/bookings/recurring/:userId
router.get('/recurring/:userId', (req, res) => {
  const bookings = [REDACTED_TOKEN].[REDACTED_TOKEN](req.params.userId);
  res.json(bookings);
});

// PUT /api/bookings/recurring/:bookingId/pause
router.put('/recurring/:bookingId/pause', (req, res) => {
  const { resumeUntil } = req.body;
  const booking = [REDACTED_TOKEN].pauseRecurring(req.params.bookingId, resumeUntil);
  res.json(booking);
});

// PUT /api/bookings/recurring/:bookingId/resume
router.put('/recurring/:bookingId/resume', (req, res) => {
  const booking = [REDACTED_TOKEN].resumeRecurring(req.params.bookingId);
  res.json(booking);
});

// DELETE /api/bookings/recurring/:bookingId
router.delete('/recurring/:bookingId', (req, res) => {
  const result = [REDACTED_TOKEN].cancelRecurring(req.params.bookingId);
  res.json(result);
});

// PUT /api/bookings/recurring/:bookingId
router.put('/recurring/:bookingId', (req, res) => {
  const updated = [REDACTED_TOKEN].updateRecurring(req.params.bookingId, req.body);
  res.json(updated);
});

module.exports = router;

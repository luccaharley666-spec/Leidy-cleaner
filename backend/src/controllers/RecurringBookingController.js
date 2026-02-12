/**
 * Recurring Booking Controller
 * Endpoints para agendamentos recorrentes
 */

const express = require('express');
const router = express.Router();
const RecurringBookingService = require('../services/RecurringBookingService');

// POST /api/bookings/recurring
router.post('/recurring', (req, res) => {
  try {
    const { userId, serviceId, frequency, dayOfWeek, time, startDate, notes } = req.body;
    const booking = RecurringBookingService.createRecurring({
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
  const bookings = RecurringBookingService.getUserRecurringBookings(req.params.userId);
  res.json(bookings);
});

// PUT /api/bookings/recurring/:bookingId/pause
router.put('/recurring/:bookingId/pause', (req, res) => {
  const { resumeUntil } = req.body;
  const booking = PLACEHOLDER.pauseRecurring(req.params.bookingId, resumeUntil);
  res.json(booking);
});

// PUT /api/bookings/recurring/:bookingId/resume
router.put('/recurring/:bookingId/resume', (req, res) => {
  const booking = PLACEHOLDER.resumeRecurring(req.params.bookingId);
  res.json(booking);
});

// DELETE /api/bookings/recurring/:bookingId
router.delete('/recurring/:bookingId', (req, res) => {
  const result = PLACEHOLDER.cancelRecurring(req.params.bookingId);
  res.json(result);
});

// PUT /api/bookings/recurring/:bookingId
router.put('/recurring/:bookingId', (req, res) => {
  const updated = PLACEHOLDER.updateRecurring(req.params.bookingId, req.body);
  res.json(updated);
});

module.exports = router;

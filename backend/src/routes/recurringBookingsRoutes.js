/**
 * Recurring Bookings Routes  
 * Endpoints para agendamentos recorrentes
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const db = require('../db');
const logger = require('../utils/logger');
const BookingService = require('../services/BookingService');

// POST /api/recurring-bookings/create
// Criar novo agendamento recorrente
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const {
      service_id,
      customer_id,
      professional_id,
      schedule_date,
      start_time,
      address,
      frequency, // 'weekly', 'biweekly', 'monthly'
      end_date,
      price,
      notes
    } = req.body;

    // Validar campos obrigatórios
    if (!service_id || !customer_id || !schedule_date || !start_time || !frequency) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: service_id, customer_id, schedule_date, start_time, frequency'
      });
    }

    // Validar frequência
    if (!['weekly', 'biweekly', 'monthly'].includes(frequency)) {
      return res.status(400).json({
        success: false,
        error: 'Frequência inválida. Use: weekly, biweekly, ou monthly'
      });
    }

    // Criar grupo de agendamentos recorrentes
    const insertResult = await db.run(
      `INSERT INTO recurring_bookings (
        service_id, customer_id, professional_id, 
        schedule_date, start_time, address, 
        frequency, end_date, price, notes, 
        is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))`,
      service_id,
      customer_id,
      professional_id || null,
      schedule_date,
      start_time,
      address || '',
      frequency,
      end_date || null,
      price,
      notes || ''
    );

    const recurringId = insertResult.lastID;

    // Gerar instâncias iniciais do agendamento (primeiras 4 semanas)
    const generateInstances = true;
    if (generateInstances) {
      let currentDate = new Date(schedule_date);
      const maxDate = end_date ? new Date(end_date) : new Date();
      maxDate.setMonth(maxDate.getMonth() + 3); // 3 meses no futuro

      const frequencyDays = {
        'weekly': 7,
        'biweekly': 14,
        'monthly': 30
      };

      const increment = frequencyDays[frequency];

      while (currentDate <= maxDate) {
        const dateStr = currentDate.toISOString().split('T')[0];

        await db.run(
          `INSERT INTO bookings (
            service_id, customer_id, professional_id,
            schedule_date, start_time, address,
            total_price, status, notes,
            recurring_booking_id, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
          service_id,
          customer_id,
          professional_id || null,
          dateStr,
          start_time,
          address || '',
          price,
          'pending',
          `Agendamento recorrente (${frequency})`,
          recurringId
        );

        currentDate.setDate(currentDate.getDate() + increment);
      }
    }

    logger.info('Recurring booking created', { recurringId, frequency, customerId: customer_id });

    res.json({
      success: true,
      message: 'Agendamento recorrente criado com sucesso',
      data: {
        recurringId,
        frequency,
        startDate: schedule_date,
        endDate: end_date
      }
    });
  } catch (error) {
    logger.error('Failed to create recurring booking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/recurring-bookings/:customerId
// Listar agendamentos recorrentes do cliente
router.get('/:customerId', authenticateToken, async (req, res) => {
  try {
    const { customerId } = req.params;

    const recurringBookings = await db.all(
      `SELECT rb.*, 
              s.name as service_name,
              u.name as professional_name
       FROM recurring_bookings rb
       LEFT JOIN services s ON rb.service_id = s.id
       LEFT JOIN users u ON rb.professional_id = u.id
       WHERE rb.customer_id = ? AND rb.is_active = 1
       ORDER BY rb.schedule_date DESC`,
      customerId
    );

    res.json({
      success: true,
      data: recurringBookings
    });
  } catch (error) {
    logger.error('Failed to fetch recurring bookings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/recurring-bookings/:recurringBookingId
// Atualizar agendamento recorrente
router.put('/:recurringBookingId', authenticateToken, async (req, res) => {
  try {
    const { recurringBookingId } = req.params;
    const { professional_id, address, price, notes } = req.body;

    await db.run(
      `UPDATE recurring_bookings 
       SET professional_id = ?, address = ?, price = ?, notes = ?,
           updated_at = datetime('now')
       WHERE id = ?`,
      professional_id,
      address,
      price,
      notes,
      recurringBookingId
    );

    // Também atualizar todas as instâncias futuras
    const today = new Date().toISOString().split('T')[0];
    if (professional_id) {
      await db.run(
        `UPDATE bookings 
         SET professional_id = ?, updated_at = datetime('now')
         WHERE recurring_booking_id = ? AND schedule_date >= ? AND status IN ('pending', 'confirmed')`,
        professional_id,
        recurringBookingId,
        today
      );
    }

    logger.info('Recurring booking updated', { recurringBookingId });

    res.json({
      success: true,
      message: 'Agendamento recorrente atualizado'
    });
  } catch (error) {
    logger.error('Failed to update recurring booking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/recurring-bookings/:recurringBookingId
// Cancelar agendamento recorrente (soft delete)
router.delete('/:recurringBookingId', authenticateToken, async (req, res) => {
  try {
    const { recurringBookingId } = req.params;
    const { cancelFutureOnly = true } = req.body; // true: cancela só futuras, false: cancela todas

    if (cancelFutureOnly) {
      const today = new Date().toISOString().split('T')[0];

      // Desativar recorrência
      await db.run(
        `UPDATE recurring_bookings 
         SET is_active = 0, updated_at = datetime('now')
         WHERE id = ?`,
        recurringBookingId
      );

      // Cancelar instâncias futuras
      await db.run(
        `UPDATE bookings 
         SET status = 'cancelled', updated_at = datetime('now')
         WHERE recurring_booking_id = ? AND schedule_date >= ? AND status IN ('pending', 'confirmed')`,
        recurringBookingId,
        today
      );
    } else {
      // Cancelar todas as instâncias
      await db.run(
        `UPDATE bookings 
         SET status = 'cancelled', updated_at = datetime('now')
         WHERE recurring_booking_id = ?`,
        recurringBookingId
      );

      await db.run(
        `UPDATE recurring_bookings 
         SET is_active = 0, updated_at = datetime('now')
         WHERE id = ?`,
        recurringBookingId
      );
    }

    logger.info('Recurring booking cancelled', { recurringBookingId, cancelFutureOnly });

    res.json({
      success: true,
      message: 'Agendamento recorrente cancelado'
    });
  } catch (error) {
    logger.error('Failed to cancel recurring booking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/recurring-bookings/:recurringBookingId/instances
// Listar todas as instâncias de um agendamento recorrente
router.get('/:recurringBookingId/instances', authenticateToken, async (req, res) => {
  try {
    const { recurringBookingId } = req.params;

    const instances = await db.all(
      `SELECT b.* 
       FROM bookings b
       WHERE b.recurring_booking_id = ?
       ORDER BY b.schedule_date ASC`,
      recurringBookingId
    );

    res.json({
      success: true,
      data: instances,
      count: instances.length
    });
  } catch (error) {
    logger.error('Failed to fetch recurring booking instances:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

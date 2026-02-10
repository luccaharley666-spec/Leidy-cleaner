const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const [REDACTED_TOKEN] = require('../services/[REDACTED_TOKEN]');

const router = express.Router();

// Criar agendamento por hora
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { professionalId, date, startTime, durationHours } = req.body;
    const userId = req.user.id;

    const booking = await [REDACTED_TOKEN].createHourlyBooking(
      userId,
      professionalId,
      date,
      startTime,
      durationHours
    );

    res.json({ success: true, booking });
  } catch (error) {
    console.error('Erro ao criar agendamento por hora:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obter disponibilidade de profissional
router.get('/availability/:professionalId', async (req, res) => {
  try {
    const { professionalId } = req.params;
    const { date, startTime, endTime } = req.query;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ 
        success: false, 
        error: 'date, startTime e endTime são obrigatórios' 
      });
    }

    const isAvailable = await [REDACTED_TOKEN].checkAvailability(
      professionalId,
      date,
      startTime,
      endTime
    );

    res.json({ success: true, available: isAvailable });
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obter tarifas do profissional
router.get('/rates/:professionalId', async (req, res) => {
  try {
    const { professionalId } = req.params;

    const rates = await [REDACTED_TOKEN].[REDACTED_TOKEN](professionalId);
    res.json({ success: true, rates });
  } catch (error) {
    console.error('Erro ao obter tarifas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obter agendamentos do usuário
router.get('/my-bookings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = require('../database');

    const bookings = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM hourly_bookings WHERE user_id = ? ORDER BY date DESC',
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Erro ao obter agendamentos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const [REDACTED_TOKEN] = require('../services/[REDACTED_TOKEN]');

const router = express.Router();

// Criar agendamento recorrente
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { professionalId, serviceId, dayOfWeek, time, frequency, startDate, endDate } = req.body;
    const userId = req.user.id;

    if (!professionalId || !serviceId || dayOfWeek === undefined || !time) {
      return res.status(400).json({ success: false, error: 'Parâmetros inválidos' });
    }

    const booking = await [REDACTED_TOKEN].[REDACTED_TOKEN](
      userId,
      professionalId,
      serviceId,
      dayOfWeek,
      time,
      frequency || 'weekly',
      startDate,
      endDate
    );

    res.json({ success: true, booking });
  } catch (error) {
    console.error('Erro ao criar agendamento recorrente:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Listar agendamentos recorrentes do usuário
router.get('/my-recurring', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await [REDACTED_TOKEN].[REDACTED_TOKEN](userId);
    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Erro ao listar agendamentos recorrentes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Pausar agendamento recorrente
router.post('/pause/:recurringId', authenticateToken, async (req, res) => {
  try {
    const { recurringId } = req.params;
    const result = await [REDACTED_TOKEN].[REDACTED_TOKEN](recurringId);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Erro ao pausar agendamento:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Retomar agendamento recorrente
router.post('/resume/:recurringId', authenticateToken, async (req, res) => {
  try {
    const { recurringId } = req.params;
    const result = await [REDACTED_TOKEN].[REDACTED_TOKEN](recurringId);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Erro ao retomar agendamento:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Gerar próximos agendamentos (executa via cron)
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const result = await [REDACTED_TOKEN].[REDACTED_TOKEN]();
    res.json({ success: true, result });
  } catch (error) {
    console.error('Erro ao gerar agendamentos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

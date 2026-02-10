const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const SMSService = require('../services/SMSService');

const router = express.Router();

// Enviar SMS de confirmação
router.post('/send-confirmation', authenticateToken, async (req, res) => {
  try {
    const { bookingId, phone } = req.body;

    if (!bookingId || !phone) {
      return res.status(400).json({ success: false, error: 'bookingId e phone são obrigatórios' });
    }

    const result = await SMSService.[REDACTED_TOKEN](bookingId, phone);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Erro ao enviar SMS:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Enviar SMS de relembrança (lembrete)
router.post('/send-reminder', authenticateToken, async (req, res) => {
  try {
    const { bookingId, phone } = req.body;

    const result = await SMSService.sendReminder(bookingId, phone);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Erro ao enviar lembrete:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Enviar via WhatsApp
router.post('/send-whatsapp', authenticateToken, async (req, res) => {
  try {
    const { bookingId, phone, message } = req.body;

    const result = await SMSService.sendWhatsApp(bookingId, phone, message);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Listar histórico de SMS
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await SMSService.getSMSHistory(userId);
    res.json({ success: true, history });
  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Configurar preferências de notificação
router.post('/preferences', authenticateToken, async (req, res) => {
  try {
    const { phone, enableSMS, enableWhatsApp } = req.body;
    const userId = req.user.id;

    await SMSService.setSMSPreferences(userId, phone, enableSMS, enableWhatsApp);
    
    res.json({ success: true, message: 'Preferências atualizadas' });
  } catch (error) {
    console.error('Erro ao atualizar preferências:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

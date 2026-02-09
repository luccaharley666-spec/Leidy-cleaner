const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const AddonsService = require('../services/AddonsService');

const router = express.Router();

// Obter add-ons disponíveis
router.get('/', async (req, res) => {
  try {
    const addons = await AddonsService.getAvailableAddons();
    res.json({ success: true, addons });
  } catch (error) {
    console.error('Erro ao obter add-ons:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Adicionar add-on a um agendamento
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { bookingId, addonId, quantity } = req.body;

    const result = await AddonsService.addToBooking(bookingId, addonId, quantity);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Erro ao adicionar add-on:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obter add-ons de um agendamento
router.get('/booking/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const addons = await AddonsService.getBookingAddons(bookingId);
    res.json({ success: true, addons });
  } catch (error) {
    console.error('Erro ao obter add-ons do agendamento:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const ReceiptService = require('../services/ReceiptService');

const router = express.Router();

// Gerar e enviar recibo
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user.id;
    const db = require('../database');

    // Obter dados do agendamento
    const booking = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM bookings WHERE id = ?', [bookingId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Agendamento não encontrado' });
    }

    // Obter dados do usuário
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    // Gerar PDF
    const receiptPath = await ReceiptService.generateReceiptPDF(booking, user);
    
    // Enviar email
    await ReceiptService.sendReceiptEmail(user.email, user.name, booking, receiptPath);

    res.json({ success: true, message: 'Recibo gerado e enviado com sucesso' });
  } catch (error) {
    console.error('Erro ao gerar recibo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

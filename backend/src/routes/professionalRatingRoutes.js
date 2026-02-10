const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const [REDACTED_TOKEN] = require('../services/[REDACTED_TOKEN]');

const router = express.Router();

// Avaliar profissional (apenas admin)
router.post('/rate', authenticateToken, async (req, res) => {
  try {
    // Verificar se é admin
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ success: false, error: 'Acesso negado' });
    // }

    const { professionalId, rating, feedback } = req.body;
    const adminId = req.user.id;

    const result = await [REDACTED_TOKEN].rateProfessional(
      professionalId,
      adminId,
      rating,
      feedback
    );

    res.json({ success: true, result });
  } catch (error) {
    console.error('Erro ao avaliar profissional:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obter avaliações de um profissional
router.get('/:professionalId', async (req, res) => {
  try {
    const { professionalId } = req.params;

    const ratings = await [REDACTED_TOKEN].[REDACTED_TOKEN](professionalId);
    res.json({ success: true, ratings });
  } catch (error) {
    console.error('Erro ao obter avaliações:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obter profissionais com baixa avaliação
router.get('/low-rated/:minRating', async (req, res) => {
  try {
    const { minRating } = req.params;

    const professionals = await [REDACTED_TOKEN].[REDACTED_TOKEN](
      parseInt(minRating)
    );

    res.json({ success: true, professionals });
  } catch (error) {
    console.error('Erro ao obter profissionais com baixa avaliação:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const GeoLocationService = require('../services/GeoLocationService');

const router = express.Router();

// Buscar profissionais próximos
router.get('/nearby', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude, radiusKm } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, error: 'Latitude e longitude são obrigatórios' });
    }

    const radius = radiusKm ? parseFloat(radiusKm) : 5;
    const professionals = await GeoLocationService.[REDACTED_TOKEN](
      parseFloat(latitude), 
      parseFloat(longitude), 
      radius
    );
    
    res.json({ success: true, professionals });
  } catch (error) {
    console.error('Erro ao buscar profissionais próximos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Geocodificar endereço
router.post('/geocode', async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ success: false, error: 'Endereço é obrigatório' });
    }

    const coordinates = await GeoLocationService.geocodeAddress(address);
    res.json({ success: true, coordinates });
  } catch (error) {
    console.error('Erro ao geocodificar endereço:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Atualizar localização do usuário
router.post('/update-location', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user.id;

    const result = await GeoLocationService.updateUserLocation(userId, latitude, longitude);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Erro ao atualizar localização:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Salvar endereço do cliente
router.post('/save-address', authenticateToken, async (req, res) => {
  try {
    const { address, latitude, longitude } = req.body;
    const userId = req.user.id;

    const result = await GeoLocationService.saveClientAddress(userId, address, latitude, longitude);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Erro ao salvar endereço:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obter endereços salvos do usuário
router.get('/addresses', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = require('../database');
    
    const addresses = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM user_addresses WHERE user_id = ?', [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    res.json({ success: true, addresses });
  } catch (error) {
    console.error('Erro ao obter endereços:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

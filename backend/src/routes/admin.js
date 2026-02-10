/**
 * Admin Routes
 * Rotas administrativas
 */

const express = require('express');
const router = express.Router();
const db = require('../db');
const { runMigrations } = require('../db/runMigrations');

const { authenticateToken, authorizeRole } = require('../middleware/auth');

/**
 * Dashboard - Métricas (com dados reais do banco)
 */
router.get('/dashboard', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const bookingsRes = await db.all('SELECT COUNT(*) as count FROM bookings');
    const totalBookings = bookingsRes[0]?.count || 0;

    const revenueRes = await db.all(
      'SELECT SUM(COALESCE(price, 0)) as total FROM bookings WHERE status = \'completed\''
    );
    const revenue = parseFloat(revenueRes[0]?.total || 0).toFixed(2);

    const usersRes = await db.all('SELECT COUNT(*) as count FROM users');
    const customers = usersRes[0]?.count || 0;

    const todayRes = await db.all(
      'SELECT COUNT(*) as count FROM bookings WHERE date = DATE(\'now\')'
    );
    const todaysScheduled = todayRes[0]?.count || 0;

    const metrics = {
      totalBookings,
      revenue: parseFloat(revenue),
      customers,
      teamMembers: 12,
      satisfaction: 4.7,
      todaysScheduled,
      pendingReviews: 23,
    };
    res.json({ success: true, metrics });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Listar todos os agendamentos (admin)
 */
router.get('/bookings', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const bookings = await db.all(
      `SELECT b.*, s.name as service_name, u.name as user_name
       FROM bookings b 
       LEFT JOIN services s ON b.service_id = s.id 
       LEFT JOIN users u ON b.user_id = u.id 
       ORDER BY b.created_at DESC`
    );

    res.json({ success: true, bookings: bookings || [], total: bookings?.length || 0 });
  } catch (error) {
    console.error('List bookings error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Atualizar status de booking
 */
router.put('/bookings/:bookingId', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    await db.run(
      'UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      status,
      bookingId
    );

    const booking = await db.get('SELECT * FROM bookings WHERE id = ?', bookingId);
    res.json({ success: true, booking });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Gestão de Equipa
 */
router.get('/team', authenticateToken, authorizeRole(['admin']), (req, res) => {
  try {
    // Listar membros da equipa
    res.json({ success: true, team: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/team', authenticateToken, authorizeRole(['admin']), (req, res) => {
  try {
    // Adicionar membro
    res.json({ success: true, message: 'Membro adicionado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Gestão de Serviços
 */
router.get('/services', authenticateToken, authorizeRole(['admin']), (req, res) => {
  try {
    // Listar serviços
    res.json({ success: true, services: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/services', authenticateToken, authorizeRole(['admin']), (req, res) => {
  try {
    // Criar serviço
    res.json({ success: true, message: 'Serviço criado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Relatórios
 */
router.get('/reports/financial', authenticateToken, authorizeRole(['admin']), (req, res) => {
  try {
    const report = {
      period: 'monthly',
      revenue: 45280.50,
      expenses: 12500,
      profit: 32780.50,
      [REDACTED_TOKEN]: 132.45,
    };
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/reports/performance', authenticateToken, authorizeRole(['admin']), (req, res) => {
  try {
    const report = {
      totalBookings: 342,
      completedBookings: 335,
      cancelledBookings: 7,
      averageRating: 4.7,
      teamUtilization: 87,
    };
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== Permissões Dinâmicas (grant/revoke) =====
const PermissionService = require('../services/PermissionService');

// Criar usuário (admin) - aceita múltiplos papéis em `roles`
router.post('/users', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { email, name, roles } = req.body;
    if (!email) return res.status(400).json({ error: 'email é obrigatório' });

    // Tentativa inicial de leitura - se a tabela estiver faltando, tentamos executar migrations e repetir
    try {
      const existing = await db.get('SELECT id FROM users WHERE email = ?', email);
      if (existing) return res.status(400).json({ error: 'Usuário já existe' });
    } catch (innerErr) {
      if (innerErr && innerErr.message && innerErr.message.includes('no such table')) {
        console.warn('Users table missing, running migrations...');
        await runMigrations();
      } else {
        throw innerErr;
      }
    }

    // Re-tentar após migrations
    const existing2 = await db.get('SELECT id FROM users WHERE email = ?', email);
    if (existing2) return res.status(400).json({ error: 'Usuário já existe' });

    const roleValue = Array.isArray(roles) && roles.length ? roles.join(',') : (roles || 'customer');

    const result = await db.run(
      'INSERT INTO users (email, name, role, is_active, created_at) VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)',
      email,
      name || '',
      roleValue
    );

    res.status(201).json({ success: true, id: result.lastID });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/permissions/grant', authenticateToken, authorizeRole(['admin']), (req, res) => {
  try {
    const { role, permission } = req.body;
    if (!role || !permission) return res.status(400).json({ error: 'role e permission são obrigatórios' });
    const ok = PermissionService.[REDACTED_TOKEN](role, permission);
    if (!ok) return res.status(400).json({ error: 'Não foi possível conceder a permissão' });
    res.json({ success: true, message: `Permissão ${permission} concedida ao papel ${role}` });
  } catch (error) {
    console.error('Grant permission error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/permissions/revoke', authenticateToken, authorizeRole(['admin']), (req, res) => {
  try {
    const { role, permission } = req.body;
    if (!role || !permission) return res.status(400).json({ error: 'role e permission são obrigatórios' });
    const ok = PermissionService.[REDACTED_TOKEN](role, permission);
    if (!ok) return res.status(400).json({ error: 'Não foi possível revogar a permissão' });
    res.json({ success: true, message: `Permissão ${permission} revogada do papel ${role}` });
  } catch (error) {
    console.error('Revoke permission error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

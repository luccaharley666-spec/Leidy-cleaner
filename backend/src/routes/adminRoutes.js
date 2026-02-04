/**
 * Admin Dashboard Routes
 * POST /api/admin/teams - Criar time
 * GET /api/admin/teams - Listar times
 * PUT /api/admin/teams/:id - Atualizar time
 * DELETE /api/admin/teams/:id - Deletar time
 * POST /api/admin/services - Criar serviço
 * GET /api/admin/services - Listar serviços
 * etc
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const db = require('../db');
const logger = require('../utils/logger');

// Middleware: Verificar admin (autenticação + autorização)
const requireAdmin = [authenticateToken, authorizeRole(['admin'])];

/**
 * POST /api/admin/teams
 * Criar novo time de limpeza
 */
router.post('/teams', requireAdmin, async (req, res) => {
  try {
    const { name, description, color, manager_id } = req.body;

    if (!name || !manager_id) {
      return res.status(400).json({
        success: false,
        error: 'Nome e gerente são obrigatórios'
      });
    }

    await db.run(
      `INSERT INTO teams (name, description, color, manager_id, created_at, is_active)
       VALUES (?, ?, ?, ?, datetime('now'), 1)`,
      name,
      description || '',
      color || '#6366f1',
      manager_id
    );

    logger.info('Team created', { name, managerId: manager_id });

    res.json({
      success: true,
      message: 'Time criado com sucesso!'
    });
  } catch (err) {
    logger.error('Team creation failed', err);
    res.status(500).json({ success: false, error: 'Erro ao criar time' });
  }
});

/**
 * GET /api/admin/teams
 * Listar todos os times
 */
router.get('/teams', requireAdmin, async (req, res) => {
  try {
    const teams = await db.all(
      `SELECT t.*, u.name as manager_name, COUNT(DISTINCT tm.staff_id) as member_count
       FROM teams t
       LEFT JOIN users u ON t.manager_id = u.id
       LEFT JOIN team_members tm ON t.id = tm.team_id
       GROUP BY t.id
       ORDER BY t.created_at DESC`,
    );

    res.json({
      success: true,
      teams
    });
  } catch (err) {
    logger.error('List teams failed', err);
    res.status(500).json({ success: false, error: 'Erro ao listar times' });
  }
});

/**
 * PUT /api/admin/teams/:id
 * Atualizar time
 */
router.put('/teams/:id', requireAdmin, async (req, res) => {
  try {
    const { name, description, color, is_active } = req.body;

    await db.run(
      `UPDATE teams 
       SET name = ?, description = ?, color = ?, is_active = ?
       WHERE id = ?`,
      name,
      description,
      color,
      is_active ? 1 : 0,
      req.params.id
    );

    logger.info('Team updated', { teamId: req.params.id });

    res.json({
      success: true,
      message: 'Time atualizado'
    });
  } catch (err) {
    logger.error('Team update failed', err);
    res.status(500).json({ success: false, error: 'Erro ao atualizar' });
  }
});

/**
 * DELETE /api/admin/teams/:id
 * Deletar time (soft delete)
 */
router.delete('/teams/:id', requireAdmin, async (req, res) => {
  try {
    await db.run(
      'UPDATE teams SET is_active = 0 WHERE id = ?',
      req.params.id
    );

    logger.info('Team deleted', { teamId: req.params.id });

    res.json({
      success: true,
      message: 'Time removido'
    });
  } catch (err) {
    logger.error('Team delete failed', err);
    res.status(500).json({ success: false, error: 'Erro ao remover time' });
  }
});

/**
 * POST /api/admin/services
 * Criar novo serviço
 */
router.post('/services', requireAdmin, async (req, res) => {
  try {
    const { name, description, category, base_price, duration_minutes, image_url } = req.body;

    if (!name || !category || base_price === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Nome, categoria e preço são obrigatórios'
      });
    }

    await db.run(
      `INSERT INTO services (name, description, category, base_price, duration_minutes, image_url, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'))`,
      name,
      description || '',
      category,
      base_price,
      duration_minutes || 60,
      image_url || null
    );

    logger.info('Service created', { name, category });

    res.json({
      success: true,
      message: 'Serviço criado com sucesso!'
    });
  } catch (err) {
    logger.error('Service creation failed', err);
    res.status(500).json({ success: false, error: 'Erro ao criar serviço' });
  }
});

/**
 * GET /api/admin/services
 * Listar todos os serviços
 */
router.get('/services', requireAdmin, async (req, res) => {
  try {
    const services = await db.all(
      `SELECT * FROM services 
       ORDER BY category ASC, name ASC`
    );

    res.json({
      success: true,
      services,
      total: services.length
    });
  } catch (err) {
    logger.error('List services failed', err);
    res.status(500).json({ success: false, error: 'Erro ao listar serviços' });
  }
});

/**
 * PUT /api/admin/services/:id
 * Atualizar serviço
 */
router.put('/services/:id', requireAdmin, async (req, res) => {
  try {
    const { name, description, base_price, duration_minutes, is_active } = req.body;

    await db.run(
      `UPDATE services 
       SET name = ?, description = ?, base_price = ?, duration_minutes = ?, is_active = ?
       WHERE id = ?`,
      name,
      description,
      base_price,
      duration_minutes,
      is_active ? 1 : 0,
      req.params.id
    );

    logger.info('Service updated', { serviceId: req.params.id });

    res.json({
      success: true,
      message: 'Serviço atualizado'
    });
  } catch (err) {
    logger.error('Service update failed', err);
    res.status(500).json({ success: false, error: 'Erro ao atualizar' });
  }
});

/**
 * GET /api/admin/dashboard
 * Dashboard com KPIs
 */
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    // Total de usuários
    const [{ totalUsers }] = await db.all('SELECT COUNT(*) as totalUsers FROM users WHERE role != "admin"');

    // Bookings este mês
    const [{ monthlyBookings }] = await db.all(
      `SELECT COUNT(*) as monthlyBookings FROM bookings 
       WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')`
    );

    // Receita este mês
    const [{ monthlyRevenue }] = await db.all(
      `SELECT COALESCE(SUM(CAST(final_price as FLOAT)), 0) as monthlyRevenue FROM bookings 
       WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now') AND status = 'completed'`
    );

    // Avaliação média
    const [{ avgRating }] = await db.all(
      'SELECT AVG(CAST(rating as FLOAT)) as avgRating FROM reviews'
    );

    // Serviços ativos
    const [{ activeServices }] = await db.all('SELECT COUNT(*) as activeServices FROM services WHERE is_active = 1');

    // Staff ativo
    const [{ activeStaff }] = await db.all('SELECT COUNT(*) as activeStaff FROM users WHERE role = "staff" AND is_active = 1');

    res.json({
      success: true,
      dashboard: {
        totalUsers,
        monthlyBookings,
        monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
        avgRating: (Math.round((avgRating || 0) * 10) / 10).toFixed(1),
        activeServices,
        activeStaff
      }
    });
  } catch (err) {
    logger.error('Dashboard data failed', err);
    res.status(500).json({ success: false, error: 'Erro ao carregar dashboard' });
  }
});

module.exports = router;

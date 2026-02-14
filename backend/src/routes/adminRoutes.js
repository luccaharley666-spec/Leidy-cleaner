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
const { limiters } = require('../middleware/rateLimited');
const db = require('../db');
const logger = require('../utils/logger');
const { validateSchema, teamCreateSchema, teamUpdateSchema, serviceCreateSchema, serviceUpdateSchema } = require('../utils/zodSchemas');

// Middleware: Verificar admin (autenticação + autorização)
const requireAdmin = [authenticateToken, authorizeRole(['admin'])];

/**
 * POST /api/admin/teams
 * Criar novo time de limpeza
 */
router.post('/teams', requireAdmin, limiters.adminWrite, validateSchema(teamCreateSchema), async (req, res) => {
  try {
    const { name, description, color, manager_id } = req.validated;

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
 * Listar todos os times (com paginação)
 */
router.get('/teams', requireAdmin, async (req, res) => {
  try {
    // ✅ PAGINAÇÃO: extrair params com validação
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const offset = (page - 1) * limit;

    const teams = await db.all(
      `SELECT t.*, u.name as manager_name, COUNT(DISTINCT tm.staff_id) as member_count
       FROM teams t
       LEFT JOIN users u ON t.manager_id = u.id
       LEFT JOIN team_members tm ON t.id = tm.team_id
       GROUP BY t.id
       ORDER BY t.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    // ✅ Contar total de registros
    const [{ total }] = await db.all(
      `SELECT COUNT(*) as total FROM teams`
    );

    res.json({
      success: true,
      data: teams,
      pagination: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit)
      }
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
router.put('/teams/:id', requireAdmin, limiters.adminWrite, validateSchema(teamUpdateSchema), async (req, res) => {
  try {
    const { name, description, color, is_active } = req.validated;

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
router.post('/services', requireAdmin, limiters.adminWrite, validateSchema(serviceCreateSchema), async (req, res) => {
  try {
    const { name, description, category, base_price, duration_minutes, image_url } = req.validated;

    await db.run(
      `INSERT INTO services (name, description, category, base_price, duration_minutes, image_url, active, created_at)
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
 * Listar todos os serviços (com paginação)
 */
router.get('/services', requireAdmin, async (req, res) => {
  try {
    // ✅ PAGINAÇÃO: extrair params com validação
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const offset = (page - 1) * limit;

    const services = await db.all(
      `SELECT * FROM services 
       ORDER BY category ASC, name ASC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    // ✅ Contar total de registros
    const [{ total }] = await db.all(
      `SELECT COUNT(*) as total FROM services`
    );

    res.json({
      success: true,
      data: services,
      pagination: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit)
      }
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
router.put('/services/:id', requireAdmin, limiters.adminWrite, validateSchema(serviceUpdateSchema), async (req, res) => {
  try {
    const { name, description, base_price, duration_minutes, is_active } = req.validated;

    await db.run(
      `UPDATE services 
       SET name = ?, description = ?, base_price = ?, duration_minutes = ?, active = ?
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
    const [{ activeServices }] = await db.all('SELECT COUNT(*) as activeServices FROM services WHERE active = 1');

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

/**
 * GET /api/admin/revenue
 * Relatório detalhado de faturamento
 */
router.get('/revenue', requireAdmin, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateFilter = "strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')";
    if (period === 'week') {
      dateFilter = "datetime(created_at) >= datetime('now', '-7 days')";
    } else if (period === 'year') {
      dateFilter = "strftime('%Y', created_at) = strftime('%Y', 'now')";
    }

    const [data] = await db.all(
      `SELECT 
        DATE(created_at) as day,
        COUNT(*) as bookings_count,
        SUM(COALESCE(total_price, 0)) as daily_revenue
      FROM bookings
      WHERE status = 'completed' AND ${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY day DESC`
    );

    const totalRevenue = data.reduce((sum, r) => sum + (r.daily_revenue || 0), 0);
    
    res.json({
      success: true,
      period,
      data,
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        daysTracked: data.length,
        avgPerDay: data.length > 0 ? Math.round((totalRevenue / data.length) * 100) / 100 : 0
      }
    });
  } catch (err) {
    logger.error('Revenue report failed', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/hour-sales
 * Relatório de vendas de pacotes de horas
 */
router.get('/hour-sales', requireAdmin, async (req, res) => {
  try {
    const [sales] = await db.all(
      `SELECT 
        hours,
        COUNT(*) as quantity_sold,
        SUM(COALESCE(amount_paid, 0)) as total_revenue
      FROM user_hour_credits
      WHERE status = 'completed'
      GROUP BY hours
      ORDER BY hours ASC`
    );

    const totalRevenue = sales.reduce((sum, s) => sum + (s.total_revenue || 0), 0);
    
    res.json({
      success: true,
      sales,
      summary: {
        totalPackages: sales.reduce((sum, s) => sum + s.quantity_sold, 0),
        totalRevenue: Math.round(totalRevenue * 100) / 100
      }
    });
  } catch (err) {
    logger.error('Hour sales report failed', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/settings
 * Obter configurações do sistema
 */
router.get('/settings', requireAdmin, async (req, res) => {
  try {
    const settings = await db.all(
      `SELECT key, value FROM company_settings`
    );

    const settingsObj = {};
    settings.forEach(s => {
      try {
        settingsObj[s.key] = JSON.parse(s.value);
      } catch {
        settingsObj[s.key] = s.value;
      }
    });

    res.json({
      success: true,
      data: settingsObj
    });
  } catch (err) {
    logger.error('Failed to fetch settings', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/admin/settings
 * Atualizar configurações do sistema
 */
router.put('/settings', requireAdmin, async (req, res) => {
  try {
    const settings = req.body;

    for (const [key, value] of Object.entries(settings)) {
      const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
      
      await db.run(
        `INSERT OR REPLACE INTO company_settings (key, value, updated_at)
         VALUES (?, ?, datetime('now'))`,
        key,
        valueStr
      );
    }

    logger.info('Settings updated', { keys: Object.keys(settings) });

    res.json({
      success: true,
      message: 'Configurações salvas com sucesso'
    });
  } catch (err) {
    logger.error('Failed to update settings', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/settings/:key
 * Obter configuração específica
 */
router.get('/settings/:key', requireAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await db.get(
      `SELECT value FROM company_settings WHERE key = ?`,
      key
    );

    if (!setting) {
      return res.status(404).json({
        success: false,
        error: 'Setting not found'
      });
    }

    try {
      const value = JSON.parse(setting.value);
      res.json({ success: true, data: value });
    } catch {
      res.json({ success: true, data: setting.value });
    }
  } catch (err) {
    logger.error('Failed to fetch setting', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

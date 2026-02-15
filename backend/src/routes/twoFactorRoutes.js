const express = require('express');
const router = express.Router();
const twoFactorService = require('../services/twoFactorService');
const { authenticateToken } = require('../middleware/auth');
const db = require('../db');
const logger = require('../utils/logger');

/**
 * GET /api/2fa/setup
 * Generate initial 2FA secret and QR code
 */
router.get('/setup', authenticateToken, async (req, res) => {
  try {
    const { id, email } = req.user;
    
    // Verificar se 2FA já está ativado
    const user = await db.get('SELECT two_factor_enabled FROM users WHERE id = ?', id);
    if (user?.two_factor_enabled) {
      return res.status(400).json({ error: '2FA já está ativado para este usuário' });
    }
    
    const twoFaData = await twoFactorService.generateSecret(email);
    const backupCodes = twoFactorService.generateBackupCodes();
    
    // Store temporarily in session (don't save to DB yet)
    req.session = req.session || {};
    req.session.temp2faSecret = twoFaData.secret;
    req.session.tempBackupCodes = backupCodes;
    
    res.json({
      qr_code_url: twoFaData.qr_code_url,
      manual_entry_key: twoFaData.manual_entry_key,
      backup_codes: backupCodes,
      message: 'Escanee o código QR com seu app autenticador (Google Authenticator, Authy, etc)',
    });
  } catch (error) {
    logger.error('Erro ao setup 2FA:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/2fa/verify
 * Verify TOTP token and enable 2FA
 */
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { token } = req.body;
    const { id } = req.user;
    
    if (!req.session?.temp2faSecret) {
      return res.status(400).json({ error: '2FA não foi iniciado, chame /setup primeiro' });
    }
    
    // Verify token
    const isValid = twoFactorService.verifyToken(req.session.temp2faSecret, token);
    if (!isValid) {
      return res.status(400).json({ error: 'Código inválido ou expirado' });
    }
    
    // Save to database
    const backupCodesJson = JSON.stringify(req.session.tempBackupCodes);
    await db.run(
      `UPDATE users 
       SET two_factor_enabled = 1, 
           two_factor_secret = ?,
           two_factor_backup_codes = ?
       WHERE id = ?`,
      [req.session.temp2faSecret, backupCodesJson, id]
    );
    
    // Clear session
    delete req.session.temp2faSecret;
    delete req.session.tempBackupCodes;
    
    logger.info(`✅ 2FA ativado para usuário ${id}`);
    
    res.json({
      success: true,
      message: '2FA ativado com sucesso! Guarde os códigos de backup em local seguro.',
      backup_codes: req.session.tempBackupCodes,
    });
  } catch (error) {
    logger.error('Erro ao verificar 2FA:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/2fa/disable
 * Disable 2FA for user (requires password confirmation + current 2FA code)
 */
router.post('/disable', authenticateToken, async (req, res) => {
  try {
    const { password, token } = req.body;
    const { id } = req.user;
    const bcrypt = require('bcrypt');
    
    // Get user
    const user = await db.get('SELECT * FROM users WHERE id = ?', id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash || user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Senha inválida' });
    }
    
    // If 2FA is enabled, verify current 2FA token
    if (user.two_factor_enabled) {
      if (!token) {
        return res.status(400).json({ error: 'Código 2FA é obrigatório para desativar 2FA' });
      }
      
      const isValid = twoFactorService.verifyToken(user.two_factor_secret, token);
      if (!isValid) {
        return res.status(401).json({ error: 'Código 2FA inválido' });
      }
    }
    
    // Disable 2FA
    await db.run(
      `UPDATE users 
       SET two_factor_enabled = 0, 
           two_factor_secret = NULL,
           two_factor_backup_codes = NULL
       WHERE id = ?`,
      id
    );
    
    logger.info(`✅ 2FA desativado para usuário ${id}`);
    
    res.json({
      success: true,
      message: '2FA desativado com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao desativar 2FA:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/2fa/backup-codes
 * List remaining backup codes (masked for security)
 */
router.get('/backup-codes', authenticateToken, async (req, res) => {
  try {
    const { id } = req.user;
    
    const user = await db.get(
      'SELECT two_factor_backup_codes FROM users WHERE id = ?',
      id
    );
    
    if (!user || !user.two_factor_backup_codes) {
      return res.status(404).json({ error: 'Nenhum código de backup encontrado' });
    }
    
    const codes = JSON.parse(user.two_factor_backup_codes);
    const maskedCodes = codes.map(code => code.slice(0, 4) + '****');
    
    res.json({
      backup_codes_remaining: codes.length,
      masked_codes: maskedCodes,
      message: 'Guarde estes códigos em local seguro. Cada código pode ser usado uma única vez para acceso sem seu app autenticador.',
    });
  } catch (error) {
    logger.error('Erro ao buscar backup codes:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/2fa/test
 * Test 2FA locally (for development only)
 */
router.post('/test', (req, res) => {
  try {
    const { secret } = req.body;
    
    if (!secret) {
      return res.status(400).json({ error: 'Secret not provided' });
    }
    
    // Get valid codes in current window
    const codes = twoFactorService.getTimeBasedCodes(secret, 5);
    
    res.json({
      message: 'Development only - Valid TOTP codes:',
      current_code: codes.find(c => c.valid)?.code,
      nearby_codes: codes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

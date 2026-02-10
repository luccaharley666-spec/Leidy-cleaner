/**
 * Two-Factor Authentication Service (TOTP)
 * Implementa 2FA com TOTP (Time-based One-Time Password)
 */

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const db = require('../db');
const crypto = require('crypto');

class [REDACTED_TOKEN] {
  /**
   * Gera novo secret TOTP e QR code
   * Retorna secret e QR code para usuário scanear
   */
  static async generateSecret(userId, userName, issuer = 'Leidy Cleaner') {
    try {
      // Gerar secret usando speakeasy
      const secret = speakeasy.generateSecret({
        name: `${issuer} (${userName})`,
        issuer,
        length: 32
      });

      // Gerar QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url);

      return {
        secret: secret.base32,
        qrCode,
        otpauthUrl: secret.otpauth_url,
        backupCodes: this.generateBackupCodes(10)
      };
    } catch (error) {
      throw new Error(`Failed to generate 2FA secret: ${error.message}`);
    }
  }

  /**
   * Valida um código TOTP fornecido pelo usuário
   */
  static verifyToken(secret, token) {
    try {
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2 // Tolerar ±2 períodos de 30s
      });

      return verified;
    } catch (error) {
      return false;
    }
  }

  /**
   * Ativa 2FA para usuário
   */
  static async enable2FA(userId, secret, backupCodes) {
    try {
      // Armazenar secret criptografado no banco
      const encryptedSecret = this.encryptSecret(secret);

      // Armazenar backup codes (hashed)
      const hashedBackupCodes = backupCodes.map((code) =>
        crypto.createHash('sha256').update(code).digest('hex')
      );

      // Salvar no banco
      db.run(
        `INSERT INTO two_factor_auth (user_id, secret, backup_codes, enabled, created_at)
         VALUES (?, ?, ?, 1, datetime('now'))`,
        [userId, encryptedSecret, JSON.stringify(hashedBackupCodes)]
      );

      return { success: true, message: '2FA ativado' };
    } catch (error) {
      throw new Error(`Failed to enable 2FA: ${error.message}`);
    }
  }

  /**
   * Desativa 2FA para usuário
   */
  static async disable2FA(userId, confirmationToken) {
    try {
      // Validar token de confirmação (TOTP)
      const twoFactorData = db.get(
        'SELECT secret FROM two_factor_auth WHERE user_id = ? AND enabled = 1',
        [userId]
      );

      if (!twoFactorData) {
        throw new Error('2FA not enabled');
      }

      const secret = this.decryptSecret(twoFactorData.secret);
      if (!this.verifyToken(secret, confirmationToken)) {
        throw new Error('Invalid confirmation token');
      }

      // Desabilitar
      db.run(
        'UPDATE two_factor_auth SET enabled = 0 WHERE user_id = ?',
        [userId]
      );

      return { success: true, message: '2FA desativado' };
    } catch (error) {
      throw new Error(`Failed to disable 2FA: ${error.message}`);
    }
  }

  /**
   * Valida código de backup
   */
  static async verifyBackupCode(userId, code) {
    try {
      const twoFactorData = db.get(
        'SELECT backup_codes FROM two_factor_auth WHERE user_id = ? AND enabled = 1',
        [userId]
      );

      if (!twoFactorData) {
        throw new Error('2FA not enabled');
      }

      const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
      const backupCodes = JSON.parse(twoFactorData.backup_codes);

      if (backupCodes.includes(hashedCode)) {
        // Remover código usado
        const updated = backupCodes.filter((c) => c !== hashedCode);
        db.run(
          'UPDATE two_factor_auth SET backup_codes = ? WHERE user_id = ?',
          [JSON.stringify(updated), userId]
        );

        return { valid: true, message: 'Código de backup válido' };
      }

      return { valid: false, message: 'Código de backup inválido' };
    } catch (error) {
      throw new Error(`Failed to verify backup code: ${error.message}`);
    }
  }

  /**
   * Gera códigos de backup para recuperação
   */
  static generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Verifica se 2FA está ativado para usuário
   */
  static async is2FAEnabled(userId) {
    try {
      const result = db.get(
        'SELECT enabled FROM two_factor_auth WHERE user_id = ?',
        [userId]
      );

      return result?.enabled === 1;
    } catch (error) {
      return false;
    }
  }

  /**
   * Criptografa secret TOTP (usando env var ENCRYPTION_KEY)
   */
  static encryptSecret(secret) {
    const encryptionKey = process.env.ENCRYPTION_KEY || '[REDACTED_TOKEN]!';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey.slice(0, 32)), iv);

    let encrypted = cipher.update(secret);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  /**
   * Descriptografa secret TOTP
   */
  static decryptSecret(encrypted) {
    const encryptionKey = process.env.ENCRYPTION_KEY || '[REDACTED_TOKEN]!';
    const parts = encrypted.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey.slice(0, 32)), iv);

    let decrypted = decipher.update(Buffer.from(parts[1], 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  }
}

module.exports = [REDACTED_TOKEN];

/**
 * 2FA Service - Autenticação 2 Fatores
 * Suporta: TOTP (Google Authenticator), SMS, Backup Codes
 */

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const logger = require('../utils/logger');

class TwoFactorService {
  /**
   * Gerar secret TOTP
   * @returns { secret, qrCode }
   */
  static async generateTOTPSecret(userEmail) {
    try {
      const secret = speakeasy.generateSecret({
        name: `Avante (${userEmail})`,
        issuer: 'Avante Cleaning',
        length: 32
      });

      // Gerar QR Code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url);

      return {
        secret: secret.base32,
        qrCode,
        backupCodes: this.generateBackupCodes(10),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error generating TOTP secret', { error: error.message });
      throw error;
    }
  }

  /**
   * Verificar token TOTP
   */
  static verifyTOTPToken(secret, token) {
    try {
      return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2 // Permite 2 time windows para sincronização
      });
    } catch (error) {
      logger.error('Error verifying TOTP token', { error: error.message });
      return false;
    }
  }

  /**
   * Gerar códigos de backup
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
   * Verificar e usar código de backup
   */
  static verifyBackupCode(storedCodes, providedCode) {
    const index = storedCodes.findIndex(code => code === providedCode.toUpperCase());
    if (index === -1) {
      return { valid: false, remaining: storedCodes.length };
    }
    
    // Remover código usado
    storedCodes.splice(index, 1);
    
    return { valid: true, remaining: storedCodes.length };
  }

  /**
   ✅ NOVO: Hash de códigos para armazenar seguro
   */
  static hashCode(code) {
    return crypto
      .createHash('sha256')
      .update(code)
      .digest('hex');
  }

  /**
   ✅ NOVO: Validar e consumir backup code
   */
  static [REDACTED_TOKEN](hashedCodes, providedCode) {
    const hashedProvided = this.hashCode(providedCode.toUpperCase());
    const index = hashedCodes.findIndex(h => h === hashedProvided);
    
    if (index === -1) {
      return { valid: false, remaining: hashedCodes.length };
    }

    hashedCodes.splice(index, 1);
    return { valid: true, remaining: hashedCodes.length };
  }

  /**
   ✅ NOVO: Formatar backup codes para display
   */
  static [REDACTED_TOKEN](codes) {
    return codes.map(code => ({
      code: code.slice(0, 4) + ' ' + code.slice(4),
      used: false
    }));
  }

  /**
   ✅ NOVO: Log de acesso 2FA
   */
  static logTwoFactorEvent(userId, event, method, success = true) {
    logger.log({
      level: success ? 'info' : 'warn',
      message: `2FA ${event} with ${method}`,
      userId,
      event,
      method,
      success,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = TwoFactorService;

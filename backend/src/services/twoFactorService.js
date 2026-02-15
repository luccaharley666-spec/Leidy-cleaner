const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

/**
 * Two-Factor Authentication Service
 * TOTP-based (Time-based One-Time Password)
 */

class TwoFactorService {
  /**
   * Generate initial 2FA secret
   * @returns {Object} { secret, otpauth_url, qr_code_url }
   */
  static async generateSecret(userEmail) {
    const secret = speakeasy.generateSecret({
      name: `Leidy Cleaner (${userEmail})`,
      issuer: 'Leidy Cleaner',
      length: 32,
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      otpauth_url: secret.otpauth_url,
      qr_code_url: qrCodeUrl,
      manual_entry_key: secret.base32, // For manual entry if camera fails
    };
  }

  /**
   * Verify TOTP token
   * @param {string} secret - Base32 encoded secret
   * @param {string} token - 6-digit token from user
   * @returns {boolean}
   */
  static verifyToken(secret, token) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2, // Allow ±2 time windows (60s tolerance)
    });
  }

  /**
   * Generate backup codes for account recovery
   * @returns {Array} Array of backup codes
   */
  static generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      // Format: XXXX-XXXX-XXXX (nice readable format)
      const code = crypto.randomBytes(6).toString('hex').toUpperCase();
      const formatted = `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
      codes.push(formatted);
    }
    return codes;
  }

  /**
   * Use backup code (can only use once)
   * @returns {boolean} Success flag
   */
  static useBackupCode(userBackupCodes, codeProvided) {
    const index = userBackupCodes.indexOf(codeProvided);
    if (index === -1) return false;
    
    // Remove used code
    userBackupCodes.splice(index, 1);
    return true;
  }

  /**
   * Get time-based codes for testing
   * Useful for local testing without auth app
   */
  static getTimeBasedCodes(secret, windowMinutes = 5) {
    const codes = [];
    const now = Date.now();
    
    for (let i = -windowMinutes; i <= windowMinutes; i++) {
      const time = Math.floor((now + i * 60 * 1000) / 30000) * 30000;
      const token = speakeasy.totp({
        secret: secret,
        encoding: 'base32',
        time: Math.floor(time / 1000),
      });
      codes.push({
        offset: i,
        code: token,
        valid: i === 0,
      });
    }
    
    return codes;
  }
}

module.exports = TwoFactorService;

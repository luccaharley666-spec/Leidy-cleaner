/**
 * Advanced 2FA Service
 * Biometric (Face ID, Touch ID), WebAuthn/FIDO2, Recovery Codes, Trusted Devices
 */

const logger = require('../utils/logger');
const crypto = require('crypto');

class Advanced2FAService {
  constructor() {
    this.[REDACTED_TOKEN] = new Map();
    this.webauthnCredentials = new Map();
    this.recoveryCodes = new Map();
    this.trustedDevices = new Map();
    this.totpSecrets = new Map();
  }

  /**
   * Register biometric
   */
  async registerBiometric(userId, biometricType, biometricData) {
    try {
      if (!['face_id', 'touch_id', 'fingerprint'].includes(biometricType)) {
        throw new Error('Invalid biometric type');
      }

      const registration = {
        id: crypto.randomUUID(),
        userId,
        type: biometricType,
        // In production, store encrypted biometric data or just reference ID
        biometricTemplate: crypto.randomBytes(32).toString('hex'),
        isVerified: true,
        createdAt: new Date(),
        lastUsedAt: new Date()
      };

      this.[REDACTED_TOKEN].set(registration.id, registration);

      logger.info(`Biometric registered: ${registration.id} (${biometricType})`);
      return registration;
    } catch (error) {
      logger.error(`Biometric registration error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify biometric
   */
  async verifyBiometric(userId, biometricId, biometricSample) {
    try {
      const registration = this.[REDACTED_TOKEN].get(biometricId);
      if (!registration) throw new Error('Biometric registration not found');
      if (registration.userId !== userId) throw new Error('Unauthorized');

      // In production, use ML/biometric library to compare biometricSample with template
      // For now, mock successful verification
      registration.lastUsedAt = new Date();

      logger.info(`Biometric verified: ${biometricId}`);

      return {
        verified: true,
        type: registration.type,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error(`Biometric verification error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate recovery codes
   */
  async [REDACTED_TOKEN](userId, count = 10) {
    try {
      const codes = [];

      for (let i = 0; i < count; i++) {
        const code = {
          id: crypto.randomUUID(),
          userId,
          code: this._generateCode(),
          used: false,
          createdAt: new Date(),
          usedAt: null
        };

        codes.push(code);
        this.recoveryCodes.set(code.id, code);
      }

      logger.info(`Recovery codes generated for user: ${userId} (${count} codes)`);

      return codes.map(c => ({
        id: c.id,
        code: c.code,
        used: c.used
      }));
    } catch (error) {
      logger.error(`Generate recovery codes error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Use recovery code
   */
  async useRecoveryCode(userId, code) {
    try {
      let usedCode = null;

      for (const [, rc] of this.recoveryCodes.entries()) {
        if (rc.userId === userId && rc.code === code && !rc.used) {
          rc.used = true;
          rc.usedAt = new Date();
          usedCode = rc;
          break;
        }
      }

      if (!usedCode) {
        throw new Error('Invalid or already used recovery code');
      }

      logger.info(`Recovery code used for user: ${userId}`);

      return {
        success: true,
        message: 'Recovery code accepted'
      };
    } catch (error) {
      logger.error(`Use recovery code error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Setup WebAuthn credential
   */
  async setupWebAuthn(userId, credentialOptions) {
    try {
      // In production, use @simplewebauthn/server to validate attestation
      const credential = {
        id: crypto.randomUUID(),
        userId,
        credentialId: credentialOptions.id || crypto.randomBytes(32).toString('base64'),
        publicKey: credentialOptions.publicKey || crypto.randomBytes(32).toString('base64'),
        signCount: 0,
        deviceName: credentialOptions.deviceName || 'WebAuthn Device',
        createdAt: new Date(),
        lastUsedAt: null,
        isBackupEligible: credentialOptions.isBackupEligible || false
      };

      this.webauthnCredentials.set(credential.id, credential);

      logger.info(`WebAuthn credential registered: ${credential.id}`);

      return credential;
    } catch (error) {
      logger.error(`WebAuthn setup error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify WebAuthn assertion
   */
  async [REDACTED_TOKEN](userId, credentialId, assertion) {
    try {
      const credential = this.webauthnCredentials.get(credentialId);
      if (!credential) throw new Error('WebAuthn credential not found');
      if (credential.userId !== userId) throw new Error('Unauthorized');

      // In production, verify assertion.clientDataJSON and assertion.authenticatorData
      // using @simplewebauthn/server
      credential.signCount++;
      credential.lastUsedAt = new Date();

      logger.info(`WebAuthn assertion verified: ${credentialId}`);

      return {
        verified: true,
        credentialId,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error(`WebAuthn verification error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Trust device
   */
  async trustDevice(userId, deviceFingerprint, deviceInfo = {}) {
    try {
      const trustedDevice = {
        id: crypto.randomUUID(),
        userId,
        fingerprint: deviceFingerprint,
        deviceName: deviceInfo.deviceName || 'Trusted Device',
        deviceOS: deviceInfo.deviceOS || 'Unknown',
        deviceBrowser: deviceInfo.deviceBrowser || 'Unknown',
        ipAddress: deviceInfo.ipAddress || 'Unknown',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      };

      this.trustedDevices.set(trustedDevice.id, trustedDevice);

      logger.info(`Device trusted: ${trustedDevice.id}`);

      return trustedDevice;
    } catch (error) {
      logger.error(`Trust device error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if device is trusted
   */
  async isDeviceTrusted(userId, deviceFingerprint) {
    try {
      for (const [, device] of this.trustedDevices.entries()) {
        if (
          device.userId === userId &&
          device.fingerprint === deviceFingerprint &&
          device.expiresAt > new Date()
        ) {
          return true;
        }
      }

      return false;
    } catch (error) {
      logger.error(`Check trusted device error: ${error.message}`);
      return false;
    }
  }

  /**
   * Get user's trusted devices
   */
  async getTrustedDevices(userId) {
    try {
      const devices = [];

      for (const [, device] of this.trustedDevices.entries()) {
        if (device.userId === userId && device.expiresAt > new Date()) {
          devices.push({
            id: device.id,
            deviceName: device.deviceName,
            deviceOS: device.deviceOS,
            deviceBrowser: device.deviceBrowser,
            createdAt: device.createdAt,
            expiresAt: device.expiresAt
          });
        }
      }

      return devices;
    } catch (error) {
      logger.error(`Get trusted devices error: ${error.message}`);
      return [];
    }
  }

  /**
   * Revoke trusted device
   */
  async revokeTrustedDevice(userId, deviceId) {
    try {
      const device = this.trustedDevices.get(deviceId);
      if (!device) throw new Error('Device not found');
      if (device.userId !== userId) throw new Error('Unauthorized');

      this.trustedDevices.delete(deviceId);

      logger.info(`Device revoked: ${deviceId}`);

      return { success: true };
    } catch (error) {
      logger.error(`Revoke device error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Setup TOTP
   */
  async setupTOTP(userId) {
    try {
      const secret = crypto.randomBytes(20).toString('base64');

      const totp = {
        userId,
        secret,
        createdAt: new Date(),
        verified: false
      };

      this.totpSecrets.set(userId, totp);

      logger.info(`TOTP setup initiated for user: ${userId}`);

      return {
        secret,
        qrCodeUrl: `otpauth://totp/Avante:${userId}?secret=${secret}&issuer=Avante`
      };
    } catch (error) {
      logger.error(`TOTP setup error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify TOTP
   */
  async verifyTOTP(userId, token) {
    try {
      const totp = this.totpSecrets.get(userId);
      if (!totp) throw new Error('TOTP not set up for user');

      // In production, use speakeasy or similar library to verify TOTP
      // For now, mock verification
      const isValid = /^\d{6}$/.test(token);

      if (!isValid) {
        throw new Error('Invalid TOTP token');
      }

      if (!totp.verified) {
        totp.verified = true;
        totp.verifiedAt = new Date();
      }

      logger.info(`TOTP verified for user: ${userId}`);

      return { verified: true };
    } catch (error) {
      logger.error(`TOTP verification error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get 2FA status
   */
  async get2FAStatus(userId) {
    try {
      const biometrics = [];
      const webAuthn = [];
      const recoveryCodes = [];
      let totp = { enabled: false };

      // Get biometrics
      for (const [, bio] of this.[REDACTED_TOKEN].entries()) {
        if (bio.userId === userId) {
          biometrics.push({
            id: bio.id,
            type: bio.type,
            createdAt: bio.createdAt
          });
        }
      }

      // Get WebAuthn
      for (const [, cred] of this.webauthnCredentials.entries()) {
        if (cred.userId === userId) {
          webAuthn.push({
            id: cred.id,
            deviceName: cred.deviceName,
            createdAt: cred.createdAt
          });
        }
      }

      // Get recovery codes
      for (const [, code] of this.recoveryCodes.entries()) {
        if (code.userId === userId) {
          recoveryCodes.push({
            id: code.id,
            used: code.used
          });
        }
      }

      // Get TOTP
      const userTotp = this.totpSecrets.get(userId);
      if (userTotp) {
        totp = { enabled: userTotp.verified };
      }

      return {
        userId,
        biometrics,
        webAuthn,
        recoveryCodes,
        totp,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error(`Get 2FA status error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper: Generate recovery code
   */
  _generateCode() {
    return crypto
      .randomBytes(4)
      .toString('hex')
      .match(/.{1,4}/g)
      .join('-')
      .toUpperCase();
  }
}

module.exports = new Advanced2FAService();

/**
 * OAuth Service
 * Handles OAuth 2.0 authentication with Google, Facebook, WhatsApp
 * Also handles OTP via SMS and Email
 */

const logger = require('../utils/logger');
const crypto = require('crypto');

class OAuthService {
  constructor() {
    this.oauthProviders = new Map();
    this.otpStorage = new Map(); // For production, use Redis
    this.userTokens = new Map(); // For production, use database
  }

  /**
   * Google OAuth Callback Handler
   */
  async [REDACTED_TOKEN](googleProfile) {
    try {
      logger.info(`Google OAuth callback for user: ${googleProfile.email}`);

      const userKey = `google_${googleProfile.id}`;
      const user = {
        id: googleProfile.id,
        email: googleProfile.email,
        name: googleProfile.displayName,
        avatar: googleProfile.photos[0]?.value,
        provider: 'google',
        providerProfile: googleProfile,
        createdAt: new Date(),
        verified: true // Google accounts are pre-verified
      };

      // Store or update user
      this.oauthProviders.set(userKey, user);

      // Generate JWT token
      const token = this.generateToken(user);

      logger.info(`Google OAuth successful for user: ${user.email}`);
      return {
        user,
        token,
        provider: 'google'
      };
    } catch (error) {
      logger.error(`Google OAuth error: ${error.message}`);
      throw new Error(`Google OAuth failed: ${error.message}`);
    }
  }

  /**
   * Facebook OAuth Callback Handler
   */
  async [REDACTED_TOKEN](facebookProfile) {
    try {
      logger.info(`Facebook OAuth callback for user: ${facebookProfile.email}`);

      const userKey = `facebook_${facebookProfile.id}`;
      const user = {
        id: facebookProfile.id,
        email: facebookProfile.email,
        name: facebookProfile.displayName,
        avatar: facebookProfile.photos[0]?.value,
        provider: 'facebook',
        providerProfile: facebookProfile,
        createdAt: new Date(),
        verified: true
      };

      this.oauthProviders.set(userKey, user);

      const token = this.generateToken(user);

      logger.info(`Facebook OAuth successful for user: ${user.email}`);
      return {
        user,
        token,
        provider: 'facebook'
      };
    } catch (error) {
      logger.error(`Facebook OAuth error: ${error.message}`);
      throw new Error(`Facebook OAuth failed: ${error.message}`);
    }
  }

  /**
   * WhatsApp Business API Callback Handler
   */
  async [REDACTED_TOKEN](whatsappProfile) {
    try {
      logger.info(`WhatsApp OAuth callback for user: ${whatsappProfile.phone}`);

      // Extract email from phone or use generic format
      const email = whatsappProfile.email || `whatsapp_${whatsappProfile.phone}@avante.local`;

      const userKey = `whatsapp_${whatsappProfile.phone}`;
      const user = {
        id: whatsappProfile.phone,
        phone: whatsappProfile.phone,
        email,
        name: whatsappProfile.displayName,
        avatar: whatsappProfile.picture,
        provider: 'whatsapp',
        providerProfile: whatsappProfile,
        createdAt: new Date(),
        verified: true
      };

      this.oauthProviders.set(userKey, user);

      const token = this.generateToken(user);

      logger.info(`WhatsApp OAuth successful for phone: ${whatsappProfile.phone}`);
      return {
        user,
        token,
        provider: 'whatsapp'
      };
    } catch (error) {
      logger.error(`WhatsApp OAuth error: ${error.message}`);
      throw new Error(`WhatsApp OAuth failed: ${error.message}`);
    }
  }

  /**
   * Send OTP via Email or SMS
   */
  async sendOTP(identifier, method = 'email') {
    try {
      const otp = this.generateOTP();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      const otpRecord = {
        otp,
        identifier,
        method,
        expiresAt,
        attempts: 0,
        createdAt: new Date()
      };

      // Store OTP
      const otpKey = `otp_${identifier}`;
      this.otpStorage.set(otpKey, otpRecord);

      // Send via email or SMS
      if (method === 'email') {
        await this.sendOTPEmail(identifier, otp);
      } else if (method === 'sms') {
        await this.sendOTPSMS(identifier, otp);
      }

      logger.info(`OTP sent via ${method} to ${identifier}`);
      return { success: true, method, expiresIn: 600 };
    } catch (error) {
      logger.error(`OTP send error: ${error.message}`);
      throw new Error(`Failed to send OTP: ${error.message}`);
    }
  }

  /**
   * Verify OTP Token
   */
  async verifyOTP(identifier, otp) {
    try {
      const otpKey = `otp_${identifier}`;
      const otpRecord = this.otpStorage.get(otpKey);

      if (!otpRecord) {
        throw new Error('OTP not found or expired');
      }

      if (otpRecord.expiresAt < Date.now()) {
        this.otpStorage.delete(otpKey);
        throw new Error('OTP expired');
      }

      if (otpRecord.attempts >= 5) {
        this.otpStorage.delete(otpKey);
        throw new Error('Too many failed attempts');
      }

      if (otpRecord.otp !== otp) {
        otpRecord.attempts++;
        throw new Error('Invalid OTP');
      }

      // OTP is valid, delete it
      this.otpStorage.delete(otpKey);

      // Create or update user
      const user = {
        id: crypto.randomUUID(),
        [otpRecord.method === 'sms' ? 'phone' : 'email']: identifier,
        provider: otpRecord.method,
        createdAt: new Date(),
        verificationType: 'otp'
      };

      const token = this.generateToken(user);

      logger.info(`OTP verification successful for ${identifier}`);
      return {
        user,
        token,
        provider: 'otp'
      };
    } catch (error) {
      logger.error(`OTP verification error: ${error.message}`);
      throw new Error(`OTP verification failed: ${error.message}`);
    }
  }

  /**
   * Send OTP Email
   */
  async sendOTPEmail(email, otp) {
    try {
      // In production, integrate with email service (SendGrid, AWS SES, etc)
      logger.info(`Email OTP for ${email}: ${otp}`);

      // Mock implementation
      return {
        success: true,
        messageId: crypto.randomUUID()
      };
    } catch (error) {
      logger.error(`Failed to send email OTP: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send OTP SMS
   */
  async sendOTPSMS(phone, otp) {
    try {
      // In production, integrate with SMS service (Twilio, AWS SNS, etc)
      logger.info(`SMS OTP for ${phone}: ${otp}`);

      // Mock implementation
      return {
        success: true,
        messageId: crypto.randomUUID()
      };
    } catch (error) {
      logger.error(`Failed to send SMS OTP: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate random OTP (6 digits)
   */
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate JWT Token
   */
  generateToken(user) {
    // In production, use JWT signing with secret
    const payload = {
      id: user.id,
      email: user.email || user.phone,
      name: user.name,
      provider: user.provider,
      role: user.role || 'customer',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    };

    // Mock JWT (in production, sign with secret)
    const token = Buffer.from(JSON.stringify(payload)).toString('base64');
    this.userTokens.set(token, payload);
    return token;
  }

  /**
   * Verify JWT Token
   */
  async verifyToken(token) {
    try {
      const payload = this.userTokens.get(token);
      if (!payload) {
        throw new Error('Invalid token');
      }

      if (payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }

      return payload;
    } catch (error) {
      logger.error(`Token verification error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Refresh JWT Token
   */
  async refreshToken(oldToken) {
    try {
      const payload = await this.verifyToken(oldToken);
      // Create new token with updated expiration
      payload.iat = Math.floor(Date.now() / 1000);
      payload.exp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);

      const newToken = Buffer.from(JSON.stringify(payload)).toString('base64');
      this.userTokens.set(newToken, payload);

      logger.info(`Token refreshed for user: ${payload.email}`);
      return newToken;
    } catch (error) {
      logger.error(`Token refresh error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get OAuth user by provider ID
   */
  async getOAuthUser(provider, providerId) {
    try {
      const userKey = `${provider}_${providerId}`;
      return this.oauthProviders.get(userKey);
    } catch (error) {
      logger.error(`Error getting OAuth user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Link OAuth account to existing user
   */
  async linkOAuthAccount(userId, provider, providerProfile) {
    try {
      const userKey = `${provider}_${providerProfile.id}`;
      const linkedAccount = {
        userId,
        provider,
        providerId: providerProfile.id,
        linkedAt: new Date(),
        profile: providerProfile
      };

      this.oauthProviders.set(userKey, linkedAccount);

      logger.info(`OAuth account linked for user: ${userId}`);
      return linkedAccount;
    } catch (error) {
      logger.error(`Error linking OAuth account: ${error.message}`);
      throw error;
    }
  }

  /**
   * Unlink OAuth account
   */
  async unlinkOAuthAccount(userId, provider) {
    try {
      // Find and remove the account
      for (const [key, value] of this.oauthProviders.entries()) {
        if (value.userId === userId && key.startsWith(provider)) {
          this.oauthProviders.delete(key);
          logger.info(`OAuth account unlinked for user: ${userId}`);
          return true;
        }
      }
      return false;
    } catch (error) {
      logger.error(`Error unlinking OAuth account: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get OTP stats
   */
  async getOTPStats() {
    try {
      const stats = {
        totalOTPs: this.otpStorage.size,
        totalTokens: this.userTokens.size,
        oauthProviders: this.oauthProviders.size,
        createdAt: new Date()
      };

      return stats;
    } catch (error) {
      logger.error(`Error getting OTP stats: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new OAuthService();

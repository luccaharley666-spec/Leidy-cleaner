/**
 * OAuth Controller
 * Handles OAuth authentication endpoints
 */

const express = require('express');
const OAuthService = require('../services/OAuthService');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Google OAuth callback
 *     description: Handle Google OAuth 2.0 authentication callback
 *     tags:
 *       - OAuth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               email:
 *                 type: string
 *               displayName:
 *                 type: string
 *               photos:
 *                 type: array
 *     responses:
 *       200:
 *         description: Google OAuth successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                 provider:
 *                   type: string
 *       400:
 *         description: OAuth failed
 */
router.post('/google', async (req, res) => {
  try {
    const googleProfile = req.body;
    const result = await OAuthService.[REDACTED_TOKEN](googleProfile);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error(`Google OAuth error: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /auth/facebook:
 *   post:
 *     summary: Facebook OAuth callback
 *     description: Handle Facebook OAuth 2.0 authentication callback
 *     tags:
 *       - OAuth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               email:
 *                 type: string
 *               displayName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Facebook OAuth successful
 *       400:
 *         description: OAuth failed
 */
router.post('/facebook', async (req, res) => {
  try {
    const facebookProfile = req.body;
    const result = await OAuthService.[REDACTED_TOKEN](facebookProfile);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error(`Facebook OAuth error: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /auth/whatsapp:
 *   post:
 *     summary: WhatsApp OAuth callback
 *     description: Handle WhatsApp Business API authentication
 *     tags:
 *       - OAuth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               displayName:
 *                 type: string
 *     responses:
 *       200:
 *         description: WhatsApp OAuth successful
 *       400:
 *         description: OAuth failed
 */
router.post('/whatsapp', async (req, res) => {
  try {
    const whatsappProfile = req.body;
    const result = await OAuthService.[REDACTED_TOKEN](whatsappProfile);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error(`WhatsApp OAuth error: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /auth/otp/send:
 *   post:
 *     summary: Send OTP
 *     description: Send OTP via email or SMS for authentication
 *     tags:
 *       - OAuth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['identifier', 'method']
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email or phone number
 *               method:
 *                 type: string
 *                 enum: ['email', 'sms']
 *                 description: Delivery method
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 method:
 *                   type: string
 *                 expiresIn:
 *                   type: integer
 *       400:
 *         description: Failed to send OTP
 */
router.post('/otp/send', async (req, res) => {
  try {
    const { identifier, method = 'email' } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        error: 'Identifier (email or phone) is required'
      });
    }

    const result = await OAuthService.sendOTP(identifier, method);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error(`OTP send error: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /auth/otp/verify:
 *   post:
 *     summary: Verify OTP
 *     description: Verify OTP token and authenticate user
 *     tags:
 *       - OAuth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['identifier', 'otp']
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email or phone number
 *               otp:
 *                 type: string
 *                 description: 6-digit OTP
 *     responses:
 *       200:
 *         description: OTP verification successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *       400:
 *         description: OTP verification failed
 */
router.post('/otp/verify', async (req, res) => {
  try {
    const { identifier, otp } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Identifier and OTP are required'
      });
    }

    const result = await OAuthService.verifyOTP(identifier, otp);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error(`OTP verification error: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /auth/token/refresh:
 *   post:
 *     summary: Refresh JWT token
 *     description: Generate a new JWT token using refresh token
 *     tags:
 *       - OAuth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['token']
 *             properties:
 *               token:
 *                 type: string
 *                 description: Current JWT token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *       400:
 *         description: Token refresh failed
 */
router.post('/token/refresh', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }

    const newToken = await OAuthService.refreshToken(token);

    res.status(200).json({
      success: true,
      token: newToken,
      expiresIn: 7 * 24 * 60 * 60 // 7 days in seconds
    });
  } catch (error) {
    logger.error(`Token refresh error: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /auth/otp/stats:
 *   get:
 *     summary: Get OTP statistics
 *     description: Get current OTP and token statistics (admin only)
 *     tags:
 *       - OAuth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OTP statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalOTPs:
 *                   type: integer
 *                 totalTokens:
 *                   type: integer
 *                 oauthProviders:
 *                   type: integer
 *       400:
 *         description: Error retrieving stats
 */
router.get('/otp/stats', async (req, res) => {
  try {
    const stats = await OAuthService.getOTPStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error(`OTP stats error: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

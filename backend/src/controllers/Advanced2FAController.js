/**
 * Advanced 2FA Controller
 * Biometric, WebAuthn, Recovery Codes, Trusted Devices, TOTP management
 */

const express = require('express');
const twoFAService = require('../services/Advanced2FAService');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * POST /2fa/biometric/register
 * Register biometric
 * @swagger
 * /2fa/biometric/register:
 *   post:
 *     summary: Register biometric authentication
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *               biometricType: { type: string, enum: ['face_id', 'touch_id', 'fingerprint'] }
 *               biometricData: { type: object }
 *     responses:
 *       201:
 *         description: Biometric registered
 */
router.post('/biometric/register', async (req, res) => {
  try {
    const { userId, biometricType, biometricData } = req.body;

    if (!userId || !biometricType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const registration = await twoFAService.registerBiometric(userId, biometricType, biometricData);

    res.status(201).json({ success: true, data: registration });
  } catch (error) {
    logger.error(`Biometric registration error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /2fa/biometric/verify
 * Verify biometric
 * @swagger
 * /2fa/biometric/verify:
 *   post:
 *     summary: Verify biometric authentication
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *               biometricId: { type: string }
 *               biometricSample: { type: object }
 *     responses:
 *       200:
 *         description: Biometric verified
 */
router.post('/biometric/verify', async (req, res) => {
  try {
    const { userId, biometricId, biometricSample } = req.body;

    if (!userId || !biometricId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await twoFAService.verifyBiometric(userId, biometricId, biometricSample);

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error(`Biometric verification error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /2fa/recovery-codes/generate
 * Generate recovery codes
 * @swagger
 * /2fa/recovery-codes/generate:
 *   post:
 *     summary: Generate recovery codes
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *               count: { type: integer, default: 10 }
 *     responses:
 *       201:
 *         description: Recovery codes generated
 */
router.post('/recovery-codes/generate', async (req, res) => {
  try {
    const { userId, count = 10 } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const codes = await twoFAService.[REDACTED_TOKEN](userId, count);

    res.status(201).json({ success: true, data: codes });
  } catch (error) {
    logger.error(`Generate recovery codes error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /2fa/recovery-codes/use
 * Use recovery code
 * @swagger
 * /2fa/recovery-codes/use:
 *   post:
 *     summary: Use recovery code for authentication
 *     tags: [2FA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *               code: { type: string }
 *     responses:
 *       200:
 *         description: Recovery code used
 */
router.post('/recovery-codes/use', async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await twoFAService.useRecoveryCode(userId, code);

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error(`Use recovery code error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /2fa/webauthn/setup
 * Setup WebAuthn credential
 * @swagger
 * /2fa/webauthn/setup:
 *   post:
 *     summary: Setup WebAuthn credential
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *               credentialOptions: { type: object }
 *     responses:
 *       201:
 *         description: WebAuthn credential registered
 */
router.post('/webauthn/setup', async (req, res) => {
  try {
    const { userId, credentialOptions } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const credential = await twoFAService.setupWebAuthn(userId, credentialOptions);

    res.status(201).json({ success: true, data: credential });
  } catch (error) {
    logger.error(`WebAuthn setup error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /2fa/webauthn/verify
 * Verify WebAuthn assertion
 * @swagger
 * /2fa/webauthn/verify:
 *   post:
 *     summary: Verify WebAuthn assertion
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *               credentialId: { type: string }
 *               assertion: { type: object }
 *     responses:
 *       200:
 *         description: WebAuthn verified
 */
router.post('/webauthn/verify', async (req, res) => {
  try {
    const { userId, credentialId, assertion } = req.body;

    if (!userId || !credentialId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await twoFAService.[REDACTED_TOKEN](userId, credentialId, assertion);

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error(`WebAuthn verification error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /2fa/totp/setup
 * Setup TOTP
 * @swagger
 * /2fa/totp/setup:
 *   post:
 *     summary: Setup TOTP authentication
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *     responses:
 *       201:
 *         description: TOTP setup initiated
 */
router.post('/totp/setup', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const totp = await twoFAService.setupTOTP(userId);

    res.status(201).json({ success: true, data: totp });
  } catch (error) {
    logger.error(`TOTP setup error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /2fa/totp/verify
 * Verify TOTP
 * @swagger
 * /2fa/totp/verify:
 *   post:
 *     summary: Verify TOTP token
 *     tags: [2FA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *               token: { type: string }
 *     responses:
 *       200:
 *         description: TOTP verified
 */
router.post('/totp/verify', async (req, res) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await twoFAService.verifyTOTP(userId, token);

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error(`TOTP verification error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /2fa/trusted-devices/trust
 * Trust device
 * @swagger
 * /2fa/trusted-devices/trust:
 *   post:
 *     summary: Trust a device
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *               deviceFingerprint: { type: string }
 *               deviceInfo: { type: object }
 *     responses:
 *       201:
 *         description: Device trusted
 */
router.post('/trusted-devices/trust', async (req, res) => {
  try {
    const { userId, deviceFingerprint, deviceInfo } = req.body;

    if (!userId || !deviceFingerprint) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const device = await twoFAService.trustDevice(userId, deviceFingerprint, deviceInfo);

    res.status(201).json({ success: true, data: device });
  } catch (error) {
    logger.error(`Trust device error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /2fa/trusted-devices
 * Get trusted devices
 * @swagger
 * /2fa/trusted-devices:
 *   get:
 *     summary: Get user's trusted devices
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of trusted devices
 */
router.get('/trusted-devices', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const devices = await twoFAService.getTrustedDevices(userId);

    res.json({ success: true, data: devices });
  } catch (error) {
    logger.error(`Get trusted devices error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /2fa/trusted-devices/:deviceId
 * Revoke trusted device
 * @swagger
 * /2fa/trusted-devices/{deviceId}:
 *   delete:
 *     summary: Revoke trusted device
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Device revoked
 */
router.delete('/trusted-devices/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const result = await twoFAService.revokeTrustedDevice(userId, deviceId);

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error(`Revoke device error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /2fa/status
 * Get 2FA status
 * @swagger
 * /2fa/status:
 *   get:
 *     summary: Get all 2FA methods status
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: 2FA status
 */
router.get('/status', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const status = await twoFAService.get2FAStatus(userId);

    res.json({ success: true, data: status });
  } catch (error) {
    logger.error(`Get 2FA status error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

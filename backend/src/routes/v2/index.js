/**
 * API V2 Routes (Current)
 * Nova arquitetura com DTOs, melhor error handling, Swagger docs
 */

const express = require('express');
const router = express.Router();
const {
  ApiResponse,
  dtoMiddleware,
  [REDACTED_TOKEN]
} = require('../../dto');
const { asyncHandler } = require('../../middleware/globalErrorHandler');
const { authenticateToken, authorizeRole } = require('../../middleware/auth');
const mainRoutes = require('../api');

/**
 * V2 enhancements:
 * - DTOs para validação consistente
 * - Resposta padronizada (ApiResponse)
 * - Melhor error handling
 * - Documentação Swagger
 */

/**
 * @swagger
 * /api/v2/pix/create:
 *   post:
 *     summary: Create a PIX payment
 *     tags: [PIX - V2]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: integer
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Payment created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/pix/create',
  authenticateToken,
  dtoMiddleware([REDACTED_TOKEN]),
  asyncHandler(async (req, res) => {
    const PixPaymentService = require('../../services/PixPaymentService');
    const { metrics } = require('../../config/prometheus');

    const result = await PixPaymentService.createPixPayment(req.dto);
    metrics.recordPixPayment(req.dto.amount, 'created');

    res.status(201).json(ApiResponse.ok(result, 'PIX payment created'));
  })
);

/**
 * @swagger
 * /api/v2/health:
 *   get:
 *     summary: Health check (public)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 */
router.get('/health', (req, res) => {
  res.json(ApiResponse.ok({ status: 'OK', timestamp: new Date() }));
});

/**
 * Importar rotas principais (compatível com v1 também)
 */
router.use('/', mainRoutes);

module.exports = router;

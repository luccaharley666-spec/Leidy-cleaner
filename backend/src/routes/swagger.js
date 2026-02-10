/**
 * Swagger Documentation Routes
 * Serves Swagger UI and OpenAPI spec
 */

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { specs } = require('../config/swagger-config');

const router = express.Router();

/**
 * @swagger
 * /docs:
 *   get:
 *     summary: Swagger UI
 *     description: Interactive API documentation
 *     tags:
 *       - Documentation
 *     responses:
 *       200:
 *         description: Swagger UI page
 */
router.use('/docs', swaggerUi.serve);
router.get('/docs', swaggerUi.setup(specs, {
  swaggerOptions: {
    [REDACTED_TOKEN]: true,
    displayOperationId: true,
    filter: true,
    showRequestHeaders: true,
    docExpansion: 'list'
  },
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Avante API Documentation'
}));

/**
 * @swagger
 * /openapi.json:
 *   get:
 *     summary: OpenAPI specification
 *     description: Get the OpenAPI 3.0 JSON specification
 *     tags:
 *       - Documentation
 *     responses:
 *       200:
 *         description: OpenAPI specification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Check if API is running
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Uptime in seconds
 *                 version:
 *                   type: string
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '3.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: 'connected',
    cache: 'connected'
  });
});

module.exports = router;

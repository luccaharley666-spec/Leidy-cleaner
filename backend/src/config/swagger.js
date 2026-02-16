/**
 * Swagger/OpenAPI Configuration
 * Auto-documenta todos endpoints da API
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

/**
 * Definição básica do Swagger
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Leidy Cleaner API',
      version: '2.0.0',
      description: 'API para plataforma de agendamento de limpeza com pagamento PIX',
      contact: {
        name: 'Leidy Cleaner Support',
        email: 'support@leidycleaner.com'
      },
      license: {
        name: 'MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development Server'
      },
      {
        url: 'https://staging-api.leidycleaner.com',
        description: 'Staging Server'
      },
      {
        url: 'https://api.leidycleaner.com',
        description: 'Production Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Token (Authorization: Bearer <token>)'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            code: { type: 'string' },
            errorId: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['user', 'professional', 'admin'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            userId: { type: 'integer' },
            professionalId: { type: 'integer' },
            date: { type: 'string', format: 'date' },
            time: { type: 'string' },
            service: { type: 'string' },
            amount: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'completed', 'cancelled'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            transactionId: { type: 'string' },
            bookingId: { type: 'integer' },
            amount: { type: 'number' },
            paymentMethod: { type: 'string', enum: ['pix', 'card', 'transfer'] },
            status: { type: 'string', enum: ['pending', 'confirmed', 'failed', 'refunded'] },
            qrCode: { type: 'string' },
            expiresAt: { type: 'string', format: 'date-time' },
            paidAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/**/*.js', './src/controllers/**/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * Inicializa Swagger UI
 */
function initializeSwagger(app) {
  // Swagger UI em /api/docs
  app.use('/api/docs', swaggerUi.serveFiles(swaggerSpec), swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Leidy Cleaner API'
  }));

  // JSON spec em /api/docs/swagger.json
  app.get('/api/docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

module.exports = {
  initializeSwagger,
  swaggerSpec
};

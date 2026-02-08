/**
 * Swagger/OpenAPI Configuration
 * Documentação completa de todos os 130+ endpoints
 */

const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Leidy Cleaner API',
      description: 'API completa para gerenciamento de serviços de limpeza profissional',
      version: '1.0.0',
      contact: {
        name: 'Leidy Cleaner',
        email: 'api@leidycleaner.com',
        url: 'https://leidycleaner.com'
      },
      license: {
        name: 'Apache 2.0',
        url: 'https://www.apache.org/licenses/LICENSE-2.0.html'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Servidor de desenvolvimento'
      },
      {
        url: 'https://api.leidycleaner.com/api',
        description: 'Servidor de produção'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string'
            },
            email: {
              type: 'string',
              format: 'email'
            },
            phone: {
              type: 'string'
            },
            avatar: {
              type: 'string',
              format: 'uri'
            },
            role: {
              type: 'string',
              enum: ['customer', 'professional', 'admin']
            },
            verified: {
              type: 'boolean'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Booking: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            userId: {
              type: 'string',
              format: 'uuid'
            },
            serviceId: {
              type: 'string',
              format: 'uuid'
            },
            professionalId: {
              type: 'string',
              format: 'uuid'
            },
            startTime: {
              type: 'string',
              format: 'date-time'
            },
            endTime: {
              type: 'string',
              format: 'date-time'
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'completed', 'cancelled']
            },
            totalPrice: {
              type: 'number',
              format: 'float'
            },
            notes: {
              type: 'string'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Service: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            category: {
              type: 'string'
            },
            basePrice: {
              type: 'number',
              format: 'float'
            },
            duration: {
              type: 'integer',
              description: 'Duração em minutos'
            },
            rating: {
              type: 'number',
              format: 'float',
              minimum: 0,
              maximum: 5
            },
            reviewCount: {
              type: 'integer'
            },
            active: {
              type: 'boolean'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string'
            },
            message: {
              type: 'string'
            },
            code: {
              type: 'string'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      { name: 'Auth', description: 'Autenticação e Autorização' },
      { name: 'Users', description: 'Gerenciamento de Usuários' },
      { name: 'Bookings', description: 'Agendamentos' },
      { name: 'Services', description: 'Serviços disponíveis' },
      { name: 'Chat', description: 'Chat em tempo real com criptografia' },
      { name: 'Payments', description: 'Processamento de pagamentos' },
      { name: 'Reviews', description: 'Avaliações e comentários' },
      { name: 'Analytics', description: 'Analytics e Relatórios' },
      { name: 'Admin', description: 'Painel administrativo' },
      { name: 'Health', description: 'Health checks e status' }
    ]
  },
  apis: [
    './src/controllers/*.js',
    './src/routes/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;

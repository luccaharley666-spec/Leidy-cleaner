/**
 * Rate Limit Configuration
 * Defines per-endpoint rate limiting rules
 */

module.exports = {
  // Authentication endpoints
  auth: {
    login: {
      windowMs: 15 * 60 * 1000,  // 15 minutes
      max: 5,                     // 5 attempts
      message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
      standardHeaders: false,
      legacyHeaders: false,
    },
    register: {
      windowMs: 60 * 60 * 1000,   // 1 hour
      max: 10,                    // 10 attempts
      message: 'Muitas tentativas de registro. Tente novamente em 1 hora.',
    },
    resetPassword: {
      windowMs: 60 * 60 * 1000,   // 1 hour
      max: 3,                     // 3 attempts
      message: 'Muitas tentativas de reset. Tente novamente em 1 hora.',
    },
  },

  // API endpoints
  api: {
    read: {
      windowMs: 60 * 1000,        // 1 minute
      max: 100,                   // 100 requests
      message: 'Limite de requisições de leitura excedido.',
    },
    write: {
      windowMs: 60 * 1000,        // 1 minute
      max: 50,                    // 50 requests (more conservative)
      message: 'Limite de requisições de escrita excedido.',
    },
    search: {
      windowMs: 60 * 1000,        // 1 minute
      max: 30,                    // 30 searches
      message: 'Limite de buscas excedido. Aguarde um pouco.',
    },
  },

  // Payment endpoints (MOST strict)
  payment: {
    checkout: {
      windowMs: 60 * 1000,        // 1 minute
      max: 10,                    // 10 checkouts
      message: 'Muitas tentativas de checkout. Tente novamente em 1 minuto.',
    },
    webhook: {
      windowMs: 60 * 1000,        // 1 minute
      max: 1000,                  // Webhooks não devem ser limitados muito
      message: 'Webhook rejeitado - limite excedido.',
    },
  },

  // Admin endpoints (MODERATELY strict)
  admin: {
    general: {
      windowMs: 60 * 1000,        // 1 minute
      max: 200,                   // 200 requests for admins
      message: 'Limite de requisições de admin excedido.',
    },
  },

  // Public endpoints (LEAST strict)
  public: {
    general: {
      windowMs: 60 * 1000,        // 1 minute
      max: 1000,                  // 1000 requests for public
      message: 'Limite de requisições excedido.',
    },
  },
};

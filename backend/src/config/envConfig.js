/**
 * Configuração de Ambiente - Backend (Node.js)
 * Gerencia CORS, URLs, segurança por estágio (dev/staging/prod)
 */

const fs = require('fs');
const nodeEnv = process.env.NODE_ENV || 'development';

function readSecret(name) {
  // Prefer explicit env var
  if (process.env[name]) return process.env[name];
  // Allow {VAR}_FILE pointing to a path
  const fileEnv = process.env[name + '_FILE'];
  if (fileEnv && fs.existsSync(fileEnv)) return fs.readFileSync(fileEnv, 'utf8').trim();
  // Docker secrets are mounted at /run/secrets/<name> (lowercase)
  const secretPath = `/run/secrets/${name.toLowerCase()}`;
  if (fs.existsSync(secretPath)) return fs.readFileSync(secretPath, 'utf8').trim();
  return undefined;
}

const configs = {
  development: {
    apiBaseUrl: 'http://localhost:3001',
    frontendUrl: 'http://localhost:3000',
    corsOrigins: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ],
    secureCookies: false,
    allowCredentials: true,
    jwtSecret: readSecret('JWT_SECRET') || process.env.JWT_SECRET, // ✅ Sem fallback inseguro
    emailService: {
      enabled: true,
      verifyEmail: false // Skip email verification in dev
    },
    rateLimit: {
      enabled: false // Desabilitar rate limit em dev para facilitar testes
    },
    logging: {
      level: 'debug',
      verbose: true
    }
  },

  staging: {
    apiBaseUrl: process.env.API_BASE_URL || 'https://api-staging.leidycleaner.com.br',
    frontendUrl: process.env.FRONTEND_URL || 'https://staging.leidycleaner.com.br',
    corsOrigins: [
      'https://staging.leidycleaner.com.br',
      'https://api-staging.leidycleaner.com.br'
    ],
    secureCookies: true,
    allowCredentials: true,
    jwtSecret: readSecret('JWT_SECRET') || process.env.JWT_SECRET, // ✅ OBRIGATÓRIO em staging
    emailService: {
      enabled: true,
      verifyEmail: true
    },
    rateLimit: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 min
      maxRequests: 100
    },
    logging: {
      level: 'info',
      verbose: false
    }
  },

  production: {
    apiBaseUrl: process.env.API_BASE_URL || 'https://api.leidycleaner.com.br',
    frontendUrl: process.env.FRONTEND_URL || 'https://www.leidycleaner.com.br',
    corsOrigins: [
      'https://www.leidycleaner.com.br',
      'https://leidycleaner.com.br',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    secureCookies: true,
    allowCredentials: true,
    jwtSecret: readSecret('JWT_SECRET') || process.env.JWT_SECRET, // OBRIGATÓRIO em prod
    emailService: {
      enabled: true,
      verifyEmail: true,
      provider: process.env.EMAIL_PROVIDER || 'sendgrid'
    },
    rateLimit: {
      enabled: true,
      windowMs: 15 * 60 * 1000,
      maxRequests: 50 // Mais rigoroso em prod
    },
    logging: {
      level: 'warn',
      verbose: false
    }
  }
}

const selectedConfig = configs[nodeEnv] || configs.development;

// Validações de segurança
if (nodeEnv === 'production') {
  if (!selectedConfig.jwtSecret || selectedConfig.jwtSecret === 'change-me-in-env') {
    throw new Error('❌ JWT_SECRET não configurado em produção! Defina a variável de ambiente JWT_SECRET');
  }

  if (!process.env.API_BASE_URL) {
    console.warn('⚠️ API_BASE_URL não definida. Usando valor padrão.');
  }

  if (!process.env.DATABASE_URL && !process.env.DB_PATH) {
    throw new Error('❌ DATABASE_URL ou DB_PATH não configurados em produção!');
  }
}

/**
 * Validar origem CORS dinamicamente
 * @param {string} origin - Origin header da requisição
 * @returns {boolean} true se origem está permitida
 */
function validateOrigin(origin) {
  if (!origin) return true; // Requisições sem origin (ex: mobile, curl)
  
  // Em desenvolvimento, aceitar localhost com qualquer porta
  if (nodeEnv === 'development') {
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return true;
    }
  }

  return selectedConfig.corsOrigins.includes(origin);
}

module.exports = {
  // Configuração ativa
  ...selectedConfig,

  // Informações de ambiente
  nodeEnv,
  isDevelopment: nodeEnv === 'development',
  isStaging: nodeEnv === 'staging',
  isProduction: nodeEnv === 'production',

  // Funções utilitárias
  validateOrigin,

  // Headers de segurança recomendados
  getSecurityHeaders: () => ({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': selectedConfig.secureCookies ? 'max-age=31536000; includeSubDomains' : undefined,
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
    'Referrer-Policy': 'no-referrer'
  }),

  // Config para fetch/axios no browser
  getClientConfig: () => ({
    apiBaseUrl: selectedConfig.apiBaseUrl,
    corsOrigins: selectedConfig.corsOrigins,
    secureCookies: selectedConfig.secureCookies
  })
};

/**
 * CORS Configuration - Ambiente Seguro
 * Configurações de ambiente e segurança por stage
 */

const environments = {
  development: {
    apiBaseUrl: 'http://localhost:3001',
    frontendUrl: 'http://localhost:3000',
    corsOrigins: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
    allowCredentials: true,
    secureCookies: false },
  staging: {
    apiBaseUrl: 'https://api-staging.leidycleaner.com.br',
    frontendUrl: 'https://staging.leidycleaner.com.br',
    corsOrigins: ['https://staging.leidycleaner.com.br', 'https://api-staging.leidycleaner.com.br'],
    allowCredentials: true,
    secureCookies: true },
  production: {
    apiBaseUrl: 'https://api.leidycleaner.com.br',
    frontendUrl: 'https://www.leidycleaner.com.br',
    corsOrigins: ['https://www.leidycleaner.com.br', 'https://leidycleaner.com.br'],
    allowCredentials: true,
    secureCookies: true } };

const currentEnv = process.env.NODE_ENV || 'development';
module.exports = environments[currentEnv] || environments.development;

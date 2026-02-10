/**
 * Sentry Configuration
 * Error tracking e performance monitoring
 */

const Sentry = require('@sentry/node');
const { [REDACTED_TOKEN] } = require('@sentry/profiling-node');
const logger = require('../utils/logger');

function initializeSentry(app) {
  const sentryDsn = process.env.SENTRY_DSN;
  const environment = process.env.NODE_ENV || 'development';

  if (!sentryDsn) {
    logger.warn('⚠️  Sentry DSN não configurado. Error tracking desabilitado.');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.OnUncaughtException(),
      new Sentry.Integrations.[REDACTED_TOKEN](),
      new [REDACTED_TOKEN](),
    ],
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% em prod, 100% em dev
    profilesSampleRate: environment === 'production' ? 0.1 : 1.0,
    maxBreadcrumbs: 50,
    attachStacktrace: true,
    serverName: `leidy-cleaner-${environment}`,
    dist: process.env.APP_VERSION || '1.0.0',
    beforeSend(event, hint) {
      // Filtrar eventos sensíveis
      if (event.request) {
        // Remover dados sensíveis de cookies/headers
        if (event.request.cookies) {
          event.request.cookies = '[REDACTED]';
        }
        if (event.request.headers && event.request.headers['authorization']) {
          event.request.headers['authorization'] = '[REDACTED]';
        }
      }

      // Ignorar erros específicos
      if (
        hint.originalException &&
        (hint.originalException.message?.includes('ENotFound') ||
          hint.originalException.message?.includes('ECONNREFUSED'))
      ) {
        logger.warn('⚠️  Ignorando erro esperado:', hint.originalException.message);
        return null;
      }

      return event;
    },
    denyUrls: [
      // Browser extensions
      /extensions\//i,
      /^chrome:\/\//i,
      // Third-party scripts
      /graph\.instagram\.com/i,
      /connect\.facebook\.net/i,
      /api\.segment\.com/i,
    ],
  });

  // Middleware de request para Sentry
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());

  // Middleware de erro para Sentry
  app.use(Sentry.Handlers.errorHandler());

  logger.info('✅ Sentry inicializado com sucesso (DSN: ' + (sentryDsn.split('@')[0] || '') + '...)');
  return Sentry;
}

function captureException(error, context = {}) {
  if (!process.env.SENTRY_DSN) return;

  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
  });
}

function captureMessage(message, level = 'info', context = {}) {
  if (!process.env.SENTRY_DSN) return;

  Sentry.captureMessage(message, level);
}

function startTransaction(name, op = 'http.request') {
  if (!process.env.SENTRY_DSN) return null;

  return Sentry.startTransaction({
    name,
    op,
  });
}

module.exports = {
  initializeSentry,
  captureException,
  captureMessage,
  startTransaction,
  Sentry,
};

/**
 * 🔍 Monitoring Service - Integração com Sentry e NewRelic
 * 
 * Responsabilidades:
 * - Rastreamento de erros (Sentry)
 * - Monitoramento de performance (NewRelic)
 * - Métricas customizadas
 * - Health checks
 * 
 * @module services/MonitoringService
 */

const Sentry = require('@sentry/node');
let newrelic = null;
try {
  if (process.env.NEW_RELIC_ENABLED === 'true' || process.env.NEW_RELIC_LICENSE_KEY) {
    newrelic = require('newrelic');
  }
} catch (error) {
  // New Relic is optional
}
const logger = require('../utils/logger');

class MonitoringService {
  constructor() {
    this.initialized = false;
    this.sentryEnabled = process.env.SENTRY_DSN !== undefined;
    this.newrelicEnabled = newrelic !== null && process.env.NEW_RELIC_APP_NAME !== undefined;
  }

  /**
   * 🚀 Inicializa serviços de monitoramento
   */
  init(app) {
    try {
      // Sentry - Error tracking
      if (this.sentryEnabled) {
        Sentry.init({
          dsn: process.env.SENTRY_DSN,
          environment: process.env.NODE_ENV || 'development',
          tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
          integrations: [
            new Sentry.Integrations.Http({ tracing: true }),
            new Sentry.Integrations.Express({
              app: true,
              request: true,
              serverName: false,
            }),
          ],
        });

        app.use(Sentry.Handlers.requestHandler());
        app.use(Sentry.Handlers.tracingHandler());

        logger.info('✅ Sentry inicializado');
      }

      // NewRelic - APM
      if (this.newrelicEnabled) {
        logger.info('✅ NewRelic inicializado');
      }

      this.initialized = true;
      return true;
    } catch (error) {
      logger.error('❌ Erro ao inicializar monitoramento:', error);
      return false;
    }
  }

  /**
   * 🚨 Adiciona middleware de erro (deve ser o último)
   */
  setupErrorHandler(app) {
    if (this.sentryEnabled) {
      app.use(Sentry.Handlers.errorHandler());
    }

    // Middleware de erro customizado
    app.use((err, req, res, next) => {
      this.captureError(err, req);

      const statusCode = err.statusCode || 500;
      const message = err.message || 'Internal Server Error';

      res.status(statusCode).json({
        error: {
          message,
          code: err.code || 'INTERNAL_ERROR',
          ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
      });
    });
  }

  /**
   * 🔴 Captura erro para Sentry
   */
  captureError(error, context = {}) {
    try {
      if (!this.sentryEnabled) return;

      Sentry.captureException(error, {
        contexts: {
          custom: context,
        },
      });

      logger.error('🔴 Erro capturado pelo Sentry:', error.message);
    } catch (err) {
      logger.error('Erro ao capturar exception:', err);
    }
  }

  /**
   * 📊 Registra métrica customizada
   */
  recordMetric(name, value, tags = {}) {
    try {
      if (this.newrelicEnabled) {
        newrelic.recordMetric(name, value);
      }

      Sentry.captureMessage(`Métrica: ${name}=${value}`, 'info', {
        tags,
      });

      logger.debug(`📊 Métrica registrada: ${name}=${value}`);
    } catch (error) {
      logger.warn('Erro ao registrar métrica:', error);
    }
  }

  /**
   * ⏱️ Rastreia operação
   */
  async trackOperation(name, operation, tags = {}) {
    const startTime = Date.now();

    if (this.sentryEnabled) {
      const transaction = Sentry.startTransaction({
        name,
        op: 'operation',
      });

      try {
        const result = await operation();
        transaction.finish();
        return result;
      } catch (error) {
        transaction.setStatus('error');
        transaction.finish();
        throw error;
      }
    } else {
      return await operation();
    }
  }

  /**
   * 📍 Registra breadcrumb
   */
  addBreadcrumb(message, category = 'user-action', data = {}) {
    try {
      if (!this.sentryEnabled) return;

      Sentry.addBreadcrumb({
        message,
        category,
        data,
        level: 'info',
      });
    } catch (error) {
      logger.warn('Erro ao adicionar breadcrumb:', error);
    }
  }

  /**
   * 🔐 Registra evento de autenticação
   */
  trackAuthEvent(eventType, userId, metadata = {}) {
    this.addBreadcrumb(
      `Autenticação: ${eventType}`,
      'auth',
      { userId, ...metadata }
    );

    this.recordMetric(`auth.${eventType}`, 1, { userId });
  }

  /**
   * 💳 Registra evento de pagamento
   */
  trackPaymentEvent(eventType, amount, currency, metadata = {}) {
    this.addBreadcrumb(
      `Pagamento: ${eventType}`,
      'payment',
      { amount, currency, ...metadata }
    );

    this.recordMetric(`payment.${eventType}`, amount);
  }

  /**
   * 📅 Registra evento de agendamento
   */
  trackBookingEvent(eventType, bookingId, userId, metadata = {}) {
    this.addBreadcrumb(
      `Agendamento: ${eventType}`,
      'booking',
      { bookingId, userId, ...metadata }
    );

    this.recordMetric(`booking.${eventType}`, 1, { bookingId });
  }

  /**
   * 🔍 Registra busca
   */
  trackSearch(query, resultsCount, filters = {}) {
    this.addBreadcrumb(
      'Busca realizada',
      'search',
      { query, resultsCount, filters }
    );

    this.recordMetric('search.performed', 1, { query });
  }

  /**
   * 🏥 Health check
   */
  healthCheck() {
    return {
      sentry: this.sentryEnabled ? 'enabled' : 'disabled',
      newrelic: this.newrelicEnabled ? 'enabled' : 'disabled',
      initialized: this.initialized,
    };
  }

  /**
   * 🧹 Cleanup
   */
  async shutdown() {
    try {
      if (this.sentryEnabled) {
        await Sentry.close(2000);
        logger.info('Sentry fechado');
      }

      logger.info('Serviço de monitoramento encerrado');
    } catch (error) {
      logger.error('Erro ao encerrar monitoramento:', error);
    }
  }
}

const monitoringService = new MonitoringService();

module.exports = monitoringService;

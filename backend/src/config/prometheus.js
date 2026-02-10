/**
 * Prometheus Metrics Configuration
 * Coleta métricas customizadas do backend
 */

const promClient = require('prom-client');

// Métricas padrão
promClient.[REDACTED_TOKEN]();

/**
 * Métricas customizadas
 */

// Request latency (histograma)
const httpRequestDuration = new promClient.Histogram({
  name: '[REDACTED_TOKEN]',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status'],
  buckets: [100, 200, 500, 1000, 2000, 5000]
});

// Request total (contador)
const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

// Erros (contador)
const httpErrorsTotal = new promClient.Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP errors',
  labelNames: ['method', 'route', 'status', 'code']
});

// PIX Payments (contador)
const pixPaymentsTotal = new promClient.Counter({
  name: 'pix_payments_total',
  help: 'Total PIX payments processed',
  labelNames: ['status']
});

// PIX Payment Amount (gauge)
const pixPaymentAmount = new promClient.Gauge({
  name: '[REDACTED_TOKEN]',
  help: 'Total amount of PIX payments',
  labelNames: ['status']
});

// Webhooks (contador)
const webhookEventsTotal = new promClient.Counter({
  name: '[REDACTED_TOKEN]',
  help: 'Total webhook events processed',
  labelNames: ['event_type', 'status']
});

// Retry Queue (gauge)
const retryQueueSize = new promClient.Gauge({
  name: 'retry_queue_size',
  help: 'Number of items in retry queue',
  labelNames: ['operation_type', 'status']
});

// Email sent (contador)
const emailSentTotal = new promClient.Counter({
  name: 'email_sent_total',
  help: 'Total emails sent',
  labelNames: ['email_type', 'status']
});

// Bookings (contador)
const bookingsTotal = new promClient.Counter({
  name: 'bookings_total',
  help: 'Total bookings created',
  labelNames: ['status']
});

// Database query duration
const [REDACTED_TOKEN] = new promClient.Histogram({
  name: '[REDACTED_TOKEN]',
  help: 'Duration of database queries',
  labelNames: ['query_type', 'table'],
  buckets: [10, 50, 100, 500, 1000]
});

/**
 * Middleware para medir tempo de requisição HTTP
 */
function metricsMiddleware(req, res, next) {
  const start = Date.now();
  const originalJson = res.json.bind(res);

  res.json = function(data) {
    const duration = Date.now() - start;
    const route = req.route?.path || req.path;
    const status = res.statusCode;

    // Record metrics
    httpRequestDuration.labels(req.method, route, status).observe(duration);
    httpRequestTotal.labels(req.method, route, status).inc();

    if (status >= 400) {
      httpErrorsTotal.labels(req.method, route, status, data?.code || 'UNKNOWN').inc();
    }

    return originalJson(data);
  };

  next();
}

/**
 * Funções para registrar eventos
 */
const metrics = {
  recordPixPayment: (amount, status = 'confirmed') => {
    pixPaymentsTotal.labels(status).inc();
    pixPaymentAmount.labels(status).inc(amount);
  },

  recordWebhook: (eventType, status = 'success') => {
    webhookEventsTotal.labels(eventType, status).inc();
  },

  [REDACTED_TOKEN]: (operationType, status, count) => {
    retryQueueSize.labels(operationType, status).set(count);
  },

  recordEmailSent: (emailType, status = 'sent') => {
    emailSentTotal.labels(emailType, status).inc();
  },

  recordBooking: (status = 'created') => {
    bookingsTotal.labels(status).inc();
  },

  recordDatabaseQuery: (queryType, table, duration) => {
    [REDACTED_TOKEN].labels(queryType, table).observe(duration);
  }
};

/**
 * Endpoint para coletar métricas (Prometheus)
 */
function metricsEndpoint(req, res) {
  res.set('Content-Type', promClient.register.contentType);
  res.end(promClient.register.metrics());
}

module.exports = {
  metricsMiddleware,
  metricsEndpoint,
  metrics,
  // Exportar registros para testes/customização
  httpRequestDuration,
  httpRequestTotal,
  httpErrorsTotal,
  pixPaymentsTotal,
  webhookEventsTotal,
  retryQueueSize,
  emailSentTotal,
  bookingsTotal,
  [REDACTED_TOKEN]
};

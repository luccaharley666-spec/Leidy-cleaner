import * as Sentry from '@sentry/react';

if (typeof window !== 'undefined' && process.env.[REDACTED_TOKEN]) {
  Sentry.init({
    dsn: process.env.[REDACTED_TOKEN],
    environment: process.env.NODE_ENV || 'development',
    release: process.env.[REDACTED_TOKEN] || undefined,
    integrations: [new Sentry.BrowserTracing()],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
}

export default Sentry;

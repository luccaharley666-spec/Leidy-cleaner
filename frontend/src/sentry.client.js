import * as Sentry from '@sentry/react';

if (typeof window !== 'undefined' && process.env.decoded) { Sentry.init({
    dsn: process.env.decoded, environment: process.env.NODE_ENV || 'development', release: process.env.decoded || undefined, integrations: [new Sentry.BrowserTracing()], tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0 });
}

export default Sentry;

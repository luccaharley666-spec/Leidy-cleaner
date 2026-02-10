// Environment setup for Jest: silence New Relic and related monitoring
process.env.NEW_RELIC_APP_NAME = process.env.NEW_RELIC_APP_NAME || 'jest-tests';
process.env.[REDACTED_TOKEN] = 'true';
process.env.NEW_RELIC_ENABLED = 'false';
// Prevent Sentry from initializing in tests
process.env.SENTRY_DSN = '';
// Provide VAPID keys for notifications tests if absent
process.env.[REDACTED_TOKEN] = process.env.[REDACTED_TOKEN] || 'test-pub';
process.env.VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'test-priv';
// Database for testing
process.env.DATABASE_PATH = process.env.DATABASE_PATH || ':memory:';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'sqlite::memory:';
// Node environment
process.env.NODE_ENV = 'test';
// Suppress winston logs with offline queue warning
process.env.LOG_LEVEL = 'error';

// Environment setup for Jest: silence New Relic and related monitoring
process.env.NEW_RELIC_APP_NAME = process.env.NEW_RELIC_APP_NAME || 'jest-tests';
process.env.NEW_RELIC_NO_CONFIG_FILE = 'true';
process.env.NEW_RELIC_ENABLED = 'false';
// Prevent Sentry from initializing in tests
process.env.SENTRY_DSN = '';
// Provide VAPID keys for notifications tests if absent
process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'test-pub';
process.env.VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'test-priv';

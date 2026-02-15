const { execSync } = require('child_process');

module.exports = async () => {
  try {
    // Run migrations to ensure test DB schema exists
    execSync('node src/db/runMigrations.js', { stdio: 'inherit' });
  } catch (err) {
    // Log and continue; tests may still mock DB but migration failures should be visible
    // eslint-disable-next-line no-console
    console.error('jest.globalSetup: migrations failed', err && err.message ? err.message : err);
  }
};

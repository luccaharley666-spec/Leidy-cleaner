// Jest setup after environment is ready.
// Place global mocks or test utilities here.
jest.setTimeout(30000);

const { Pool } = require('pg');
const { execSync } = require('child_process');
const path = require('path');

const pool = new Pool({
	host: process.env.DB_HOST || 'localhost',
	port: parseInt(process.env.DB_PORT || '5432'),
	database: process.env.DB_NAME || 'vammos_test',
	user: process.env.DB_USER || 'postgres',
	password: process.env.DB_PASSWORD || 'postgres',
});

beforeAll(async () => {
	try {
		// Ensure a clean state once per worker (do not remove data between tests in same file)
		await pool.query('TRUNCATE TABLE bookings, reviews, services, users RESTART IDENTITY CASCADE');
		// Reseed default data
		const cwd = path.join(__dirname, './src/db');
		execSync('SKIP_ADMIN_SEED=true npx tsx seed.ts', { cwd, stdio: 'inherit' });
	} catch (err) {
		console.error('Error in beforeAll:', err.message);
		throw err;
	}});

afterAll(async () => {
	await pool.end();
});
import { query } from '../utils/database';
async function check() {
  try {
    const s = await query('SELECT COUNT(*) as cnt FROM services');
    const u = await query('SELECT COUNT(*) as cnt FROM users');
    const c = await query('SELECT COUNT(*) as cnt FROM company_info');
    console.log('services:', s[0]);
    console.log('users:', u[0]);
    console.log('company_info:', c[0]);
    process.exit(0);
  } catch (err) {
    console.error('error', err);
    process.exit(1);
  }
}

if (require.main === module) check();

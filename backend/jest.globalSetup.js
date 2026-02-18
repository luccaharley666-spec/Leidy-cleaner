const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

module.exports = async () => {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'vammos_test',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    console.log('🔄 Database setup: Reading migration files...');
    
    // Read all migration files
    const migrationsDir = path.join(__dirname, './migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files`);

    // Read all SQL and combine
    let combinedSQL = '';
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');
      combinedSQL += sql + '\n';
    }

    // Remove SQL comments and split by semicolon
    const lines = combinedSQL.split('\n');
    const cleanedLines = lines
      .map(line => {
        // Remove SQL line comments
        const commentIndex = line.indexOf('--');
        return commentIndex >= 0 ? line.substring(0, commentIndex) : line;
      })
      .filter(line => line.trim()); // Remove empty lines
    
    const cleanedSQL = cleanedLines.join('\n');

    console.log('Executing all migrations...');
    
    // Split by semicolon and execute
    const statements = cleanedSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      try {
        const stmt = statements[i];
        await pool.query(stmt);
        console.log(`✓ Statement ${i + 1}/${statements.length}`);
      } catch (err) {
        // Only log critical errors, ignore "already exists"
        if (!err.message.includes('already exists')) {
          console.error(`❌ Error at statement ${i + 1}:`, err.message);
          console.error('Statement:', statements[i].substring(0, 100) + '...');
          throw err;
        } else {
          console.log(`⚠️  Statement ${i + 1} (already exists, skipping)`);
        }
      }
    }

    console.log('✅ All migrations executed successfully!');
  } catch (err) {
    console.error('❌ Database setup failed:', err.message);
    throw err;
  } finally {
    await pool.end();
  }
};

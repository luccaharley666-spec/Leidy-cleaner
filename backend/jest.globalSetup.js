const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

module.exports = async () => {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'postgres', // Use postgres instead of vammos_test
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  // Helper to run Postgres migrations
  const runPostgresMigrations = async () => {
    console.log('🔄 Database setup: Reading migration files...');

    // First, drop all tables to ensure clean state
    console.log('🧹 Dropping existing tables...');
    try {
      await pool.query(`
        DROP TABLE IF EXISTS reviews CASCADE;
        DROP TABLE IF EXISTS bookings CASCADE;
        DROP TABLE IF EXISTS services CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
        DROP TABLE IF EXISTS company_info CASCADE;
        DROP TABLE IF EXISTS staff_availability CASCADE;
      `);
      console.log('✅ Existing tables dropped');
    } catch (dropErr) {
      console.error('❌ Error dropping tables:', dropErr.message);
      console.error('Stack:', dropErr.stack);
      // Continue anyway
    }

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
        if (!err.message || !err.message.includes('already exists')) {
          console.error(`❌ Error at statement ${i + 1}:`, err.message || err);
          console.error('Statement:', statements[i].substring(0, 100) + '...');
          throw err;
        } else {
          console.log(`⚠️  Statement ${i + 1} (already exists, skipping)`);
        }
      }
    }

    console.log('✅ All migrations executed successfully!');
    // Ensure users role constraint includes 'staff' (handles legacy/changed role names)
    try {
      await pool.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
      await pool.query('ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN (\'user\',\'customer\',\'admin\',\'staff\',\'provider\'))');
      console.log('✅ users_role_check constraint ensured');
    } catch (e) {
      console.warn('Could not ensure users_role_check constraint:', e.message || e);
    }
  };

  // Fallback: if Postgres unavailable, set up SQLite test DB and write .env.test for jest to pick up
  const runSqliteMigrations = async () => {
    console.log('ℹ️  Falling back to SQLite for tests');
    const sqlite3 = require('sqlite3');
    const sqlite = sqlite3.verbose();
    const dbPath = path.join(__dirname, 'test.sqlite');
    // remove existing file
    try { fs.unlinkSync(dbPath); } catch (e) {}
    const db = new sqlite.Database(dbPath);

    try {
      const migrationsDir = path.join(__dirname, './migrations_sqlite');
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

      console.log(`Found ${migrationFiles.length} SQLite migration files`);

      for (const file of migrationFiles) {
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
        // Preprocess SQL for SQLite compatibility: remove line comments and
        // translate some Postgres-specific clauses (e.g., IF NOT EXISTS in ALTER)
        let cleanedSql = sql
          .split('\n')
          .map(l => l.replace(/--.*$/, ''))
          .filter(l => l.trim().length > 0)
          .join('\n');

        cleanedSql = cleanedSql.replace(/ADD COLUMN IF NOT EXISTS/gi, 'ADD COLUMN');
        cleanedSql = cleanedSql.replace(/DROP COLUMN IF EXISTS/gi, 'DROP COLUMN');

        let statements = cleanedSql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0);

        // Normalize ALTER TABLE statements that add multiple columns separated by comma
        const expandedStatements = [];
        for (const stmt of statements) {
          const alterMatch = stmt.match(/^ALTER\s+TABLE\s+(\w+)\s+ADD\s+COLUMN\s+/i);
          if (alterMatch && stmt.match(/,\s*ADD\s+COLUMN/i)) {
            // split after each ", ADD COLUMN" and rebuild individual ALTER TABLE statements
            const parts = stmt.split(/,\s*ADD\s+COLUMN/i);
            const tableName = alterMatch[1];
            // first part already contains 'ALTER TABLE <name> ADD COLUMN <firstcol>'
            expandedStatements.push(parts[0]);
            for (let p = 1; p < parts.length; p++) {
              const colDef = parts[p].trim();
              expandedStatements.push(`ALTER TABLE ${tableName} ADD COLUMN ${colDef}`);
            }
          } else {
            expandedStatements.push(stmt);
          }
        }

        for (let i = 0; i < expandedStatements.length; i++) {
          const stmt = expandedStatements[i];
          try {
            await new Promise((resolve, reject) => {
              db.run(stmt, (err) => err ? reject(err) : resolve(null));
            });
          } catch (e) {
            console.error(`❌ Error executing ${file} expanded statement ${i + 1}:`, (e && e.message) || e);
            console.error('Statement preview:', stmt.substring(0, 200));
            throw e;
          }
        }

        console.log(`✓ Executed ${file}`);
      }

      // write .env.test so jest.env.js will load the SQLite settings for test processes
      const envContent = `DB_TYPE=sqlite\nDATABASE_LOCAL=${dbPath}\n`;
      fs.writeFileSync(path.join(__dirname, '.env.test'), envContent, 'utf-8');
      console.log('✅ Wrote .env.test for SQLite tests');
    } finally {
      db.close();
    }
  };

  try {
    await runPostgresMigrations();
  } catch (err) {
    // If Postgres fails (e.g., ECONNREFUSED), fallback to sqlite migrations and write .env.test
    console.error('❌ Postgres migrations failed, attempting SQLite fallback:', err && err.message);
    try {
      await runSqliteMigrations();
    } catch (sqliteErr) {
      console.error('❌ SQLite fallback also failed:', sqliteErr && sqliteErr.message);
      throw sqliteErr;
    }
  } finally {
    try { await pool.end(); } catch (e) {}
  }
};

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const MIGRATIONS_PATH = path.join(__dirname, 'migrations.sql');

// Use o mesmo DB path que sqlite.js
const candidatePaths = [
  path.join(__dirname, '..', '..', 'backend_data', 'database.sqlite'),
  path.join(__dirname, '..', 'backend_data', 'database.sqlite'),
  path.join(__dirname, '..', '..', '..', 'backend_data', 'database.sqlite'),
  path.join(__dirname, '..', '..', 'backend_data', 'limpeza.db'),
  path.join(__dirname, '..', 'backend_data', 'limpeza.db')
];

let DB_PATH = candidatePaths.find(p => fs.existsSync(p));
if (!DB_PATH) {
  DB_PATH = candidatePaths[0];
}

// Ensure directory exists
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

async function runMigrations() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Erro ao conectar ao banco:', err);
        reject(err);
        return;
      }

      const sql = fs.readFileSync(MIGRATIONS_PATH, 'utf8');

      // Split SQL by semicolons, remove inline comments and empty statements
      const statements = sql
        .split(';')
        .map(s => {
          // Remove leading comments but keep the statement if it exists
          const lines = s.trim().split('\n');
          const cleaned = lines
            .filter(l => !l.trim().startsWith('--'))
            .join('\n')
            .trim();
          return cleaned;
        })
        .filter(s => s.length > 0);


      let completed = 0;
      const errors = [];

      // Execute statements sequentially
      const executeNext = (index) => {
        if (index >= statements.length) {
          db.close((closeErr) => {
            if (closeErr) {
              console.error('Erro ao fechar DB:', closeErr);
              reject(closeErr);
            } else {
              if (errors.length > 0) {
                errors.forEach(e => console.warn(`  - ${e}`));
              }
              resolve();
            }
          });
          return;
        }

        const statement = statements[index];
        db.run(statement, (runErr) => {
          if (runErr) {
            // Ignore "already exists" errors (idempotent migrations)
            if (!runErr.message.includes('already exists') && 
                !runErr.message.includes('duplicate column')) {
              errors.push(`Statement ${index + 1}: ${runErr.message.slice(0, 80)}`);
            }
          } else {
            completed++;
          }
          executeNext(index + 1);
        });
      };

      executeNext(0);
    });
  });
}

module.exports = { runMigrations };

// Executa migrations quando o script for chamado diretamente
if (require.main === module) {
  runMigrations().catch(err => {
    console.error('Erro ao executar migrations diretamente:', err);
    process.exit(1);
  });
}

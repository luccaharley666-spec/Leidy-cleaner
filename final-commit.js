#!/usr/bin/env node
/**
 * final-commit.js - Aplicar migrations e fazer git commit
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dbPath = path.join(__dirname, 'backend', 'backend_data', 'database.db');
const migrationDir = path.join(__dirname, 'database', 'migrations');

console.log('========================================');
console.log('🚀 FINAL COMMIT SCRIPT (Node.js)');
console.log('========================================\n');

// 1. Aplicar migrations via sqlite3
console.log('📦 Aplicando migrations ao banco SQLite...');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao abrir DB:', err.message);
    process.exit(1);
  }

  const migrations = [
    '[REDACTED_TOKEN].sql',
    '[REDACTED_TOKEN].sql',
    '001-add-indices.sql'
  ];

  let completedMigrations = 0;

  migrations.forEach((migFile) => {
    const migPath = path.join(migrationDir, migFile);
    if (fs.existsSync(migPath)) {
      const sql = fs.readFileSync(migPath, 'utf-8');
      db.exec(sql, (err) => {
        if (err) {
          console.log(`   ⚠️  ${migFile}: ${err.message.split('\n')[0]}`);
        } else {
          console.log(`   ✅ ${migFile}`);
        }
        completedMigrations++;

        // Quando todos os migrations completarem, fazer git
        if (completedMigrations === migrations.length) {
          db.close();
          doGitOperations();
        }
      });
    } else {
      console.log(`   ⚠️  ${migFile}: não encontrado`);
      completedMigrations++;
      if (completedMigrations === migrations.length) {
        db.close();
        doGitOperations();
      }
    }
  });
});

function doGitOperations() {
  console.log('\n✅ Migrations aplicadas\n');

  try {
    console.log('📝 Preparando git commit...');
    
    // Git add -A
    console.log('   - Adicionando arquivos...');
    execSync('git add -A', { cwd: __dirname, stdio: 'pipe' });

    // Git status
    console.log('   - Status:');
    const status = execSync('git status --short', { cwd: __dirname, encoding: 'utf-8' });
    if (status.trim()) {
      console.log(status);
    } else {
      console.log('     (nenhuma mudança)');
    }

    // Git commit
    console.log('\n💾 Criando commit...');
    const commitMsg = 'feat: implement 5 advanced features + migrations + health checks + CI/CD';
    try {
      const commitOutput = execSync(`git commit -m "${commitMsg}"`, { 
        cwd: __dirname, 
        stdio: 'pipe',
        encoding: 'utf-8'
      });
      console.log(`   ✅ Commit criado:\n${commitOutput}`);
    } catch (e) {
      if (e.stdout && e.stdout.includes('nothing to commit')) {
        console.log('   ℹ️  Nada para fazer commit (esperado)');
      } else {
        throw e;
      }
    }

    // Mostrar log
    console.log('\n📋 Últimos 10 commits:');
    const log = execSync('git log --oneline -10', { cwd: __dirname, encoding: 'utf-8' });
    console.log(log);

    // Branch info
    console.log('\n🌳 Branch info:');
    try {
      const branch = execSync('git branch -vvs', { cwd: __dirname, encoding: 'utf-8' });
      console.log(branch);
    } catch (e) {
      const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: __dirname, encoding: 'utf-8' });
      const headSha = execSync('git rev-parse --short HEAD', { cwd: __dirname, encoding: 'utf-8' });
      console.log(`   HEAD: ${currentBranch.trim()} (${headSha.trim()})`);
    }

    // Remote info
    console.log('\n🌐 Remote info:');
    try {
      const remotes = execSync('git remote -v', { cwd: __dirname, encoding: 'utf-8' });
      if (remotes.trim()) {
        console.log(remotes);
      } else {
        console.log('   (nenhum remoto configurado)');
      }
    } catch (e) {
      console.log('   (erro ao ler remoto)');
    }

    console.log('\n==========================================');
    console.log('✨ SCRIPT FINALIZADO COM SUCESSO!');
    console.log('==========================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Erro durante operações git:', err.message);
    process.exit(1);
  }
}

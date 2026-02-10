#!/usr/bin/env node

/**
 * Script para atualizar senha do admin
 * Uso: node scripts/[REDACTED_TOKEN].js <nova_senha>
 * 
 * Exemplo:
 *   node scripts/[REDACTED_TOKEN].js "r!1QrE&McMzT2$zu"
 * 
 * ⚠️  IMPORTANTE: Não commitar este script com senhas reais!
 */

const path = require('path');
const fs = require('fs');

// Adicionar backend/node_modules ao path de require
const modulesPath = path.join(__dirname, '../backend/node_modules');
if (!require.resolve.paths('sqlite3').includes(modulesPath)) {
  module.paths.push(modulesPath);
}

const sqlite3 = require('sqlite3').verbose();

// Tentar importar bcrypt (se não existir, usar crypto simples)
let bcrypt;
try {
  bcrypt = require('bcryptjs');
} catch (e) {
  console.error('⚠️  bcryptjs não instalado. Tentando com crypto...');
  bcrypt = null;
}

// Validar argumento
const newPassword = process.argv[2];
if (!newPassword) {
  console.error('❌ Erro: Senha não fornecida');
  console.error('Uso: node scripts/[REDACTED_TOKEN].js <nova_senha>');
  process.exit(1);
}

if (newPassword.length < 8) {
  console.error('❌ Erro: Senha deve ter mínimo 8 caracteres');
  process.exit(1);
}

async function updateAdminPassword() {
  try {
    // Conectar ao banco
    const dbPath = path.join(__dirname, '../backend_data/database.db');
    
    if (!fs.existsSync(dbPath)) {
      console.error(`❌ Erro: Banco de dados não encontrado em ${dbPath}`);
      process.exit(1);
    }

    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Erro ao conectar:', err);
        process.exit(1);
      }
    });
    
    console.log('📚 Conectado ao banco de dados...');

    // Hash da nova senha
    let hashedPassword;
    if (bcrypt) {
      console.log('🔐 Gerando hash com bcryptjs...');
      hashedPassword = await bcrypt.hash(newPassword, 10);
    } else {
      // Fallback: usar crypto simples (não ideal, mas funciona para dev)
      const crypto = require('crypto');
      console.log('⚠️  Usando hash crypto simples...');
      hashedPassword = crypto
        .createHash('sha256')
        .update(newPassword)
        .digest('hex');
    }

    console.log(`🔐 Hash gerado (primeiros 20 chars): ${hashedPassword.substring(0, 20)}...`);

    // Buscar admin user (email = fransmalifra@gmail.com)
    db.get(
      `SELECT id, email FROM users WHERE email = ? OR role = ? LIMIT 1`,
      ['fransmalifra@gmail.com', 'admin'],
      async (err, admin) => {
        if (err) {
          console.error('❌ Erro ao buscar admin:', err);
          db.close();
          process.exit(1);
        }

        if (!admin) {
          console.error('❌ Erro: Usuário admin não encontrado');
          console.log('   Procurando por: fransmalifra@gmail.com');
          
          // Listar todos os usuários
          db.all('SELECT id, email, role FROM users', (err, rows) => {
            if (rows && rows.length > 0) {
              console.log('\n📋 Usuários encontrados no banco:');
              rows.forEach(u => {
                console.log(`   [${u.id}] ${u.email} (${u.role})`);
              });
            }
            db.close();
            process.exit(1);
          });
          return;
        }

        console.log(`✅ Admin encontrado: [${admin.id}] ${admin.email}`);

        // Atualizar senha
        db.run(
          `UPDATE users SET password = ?, updated_at = datetime('now') WHERE id = ?`,
          [hashedPassword, admin.id],
          (err) => {
            if (err) {
              console.error('❌ Erro ao atualizar senha:', err);
              db.close();
              process.exit(1);
            }

            console.log('✅ Senha atualizada com sucesso!');
            console.log(`\n📝 Nova credencial:`);
            console.log(`   Email: ${admin.email}`);
            console.log(`   Senha: ${newPassword}`);
            console.log(`\n⚠️  GUARDAR ESTA INFORMAÇÃO EM LUGAR SEGURO!`);
            console.log(`   Não compartilhar por email/chat/git`);
            
            db.close();
            process.exit(0);
          }
        );
      }
    );
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

updateAdminPassword();

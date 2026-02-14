#!/bin/bash

# ============================================================================
# CRIAR ADMIN SEGURO
# ============================================================================
# Script para gerar admin com senha aleatória e hash bcrypt
# Usage: node create-admin.js --email=admin@domain.com

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Gerar senha aleatória forte
function generateSecurePassword() {
  return crypto.randomBytes(16).toString('hex').slice(0, 32);
}

// Hash com bcrypt
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Arquivo de banco de dados
const dbPath = path.join(__dirname, '../backend_data/database.sqlite');
const sqlite3 = require('sqlite3').verbose();

async function createAdmin(email) {
  if (!email) {
    console.error('❌ Email é obrigatório: node create-admin.js admin@domain.com');
    process.exit(1);
  }

  try {
    const password = generateSecurePassword();
    const hashedPassword = await hashPassword(password);

    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Erro ao conectar ao banco:', err.message);
        process.exit(1);
      }
    });

    // Inserir admin
    db.run(
      'INSERT OR REPLACE INTO users (email, password, name, phone, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
      [email, hashedPassword, 'Administrador', '+55 51 98030-3740', 'admin'],
      function(err) {
        if (err) {
          console.error('❌ Erro ao criar admin:', err.message);
          process.exit(1);
        }

        console.log('\n');
        console.log('╔════════════════════════════════════════════════════════╗');
        console.log('║         🎉 ADMIN CRIADO COM SUCESSO 🎉                ║');
        console.log('╚════════════════════════════════════════════════════════╝');
        console.log('\n');
        console.log('📧 Email:', email);
        console.log('🔑 Senha:', password);
        console.log('🔐 Hash:', hashedPassword);
        console.log('\n');
        console.log('✅ Guarde a senha em lugar seguro (gerenciador de senhas)');
        console.log('✅ Na primeira login, será solicitado trocar a senha');
        console.log('✅ Disable este script após criar o admin');
        console.log('\n');

        // Salvar senha em arquivo local (deletar após guardar)
        const tempFile = path.join(__dirname, '.admin_temp.txt');
        fs.writeFileSync(tempFile, `Email: ${email}\nSenha: ${password}\n`);
        console.log(`📄 Senha salva em: ${tempFile}`);
        console.log('   Deletar este arquivo após guardar a senha seguramente\n');

        db.close();
      }
    );
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

// Parser de argumentos
const args = process.argv.slice(2);
let email = args[0];

if (email && email.startsWith('--email=')) {
  email = email.replace('--email=', '');
}

createAdmin(email);

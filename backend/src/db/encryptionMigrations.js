/**
 * Database encryption migrations
 * Adiciona coluna para armazenar dados criptografados
 */

const db = require('./index');

const [REDACTED_TOKEN] = `
-- Tabela de rastreamento de criptografia
CREATE TABLE IF NOT EXISTS encryption_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  column_name TEXT NOT NULL,
  encrypted_count INTEGER DEFAULT 0,
  last_encrypted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar coluna encrypted a users (se não existir)
CREATE TABLE IF NOT EXISTS users_backup AS SELECT * FROM users;

-- Migração: CPF e birth_date para encrypted in users
ALTER TABLE users ADD COLUMN cpf_encrypted TEXT;
ALTER TABLE users ADD COLUMN [REDACTED_TOKEN] TEXT;

-- Índices para busca por CPF (hash)
CREATE INDEX IF NOT EXISTS idx_users_cpf_hash ON users(cpf_hash);

-- Tabela de Bookings com endereco criptografado
ALTER TABLE bookings ADD COLUMN address_encrypted TEXT;
ALTER TABLE bookings ADD COLUMN notes_encrypted TEXT;

-- Tabela de Payments com card token
ALTER TABLE payments ADD COLUMN [REDACTED_TOKEN] TEXT;

-- Índice de performance
CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON encryption_audit(table_name);
`;

async function [REDACTED_TOKEN]() {
  try {
    const logger = require('../utils/logger');
    logger.info('Running encryption migrations...');
    const statements = [REDACTED_TOKEN].split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    for (const statement of statements) {
      try {
        db.run(statement);
        logger.info(`✓ ${statement.substring(0, 50)}...`);
      } catch (err) {
        if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
          logger.warn(`⚠ ${err.message}`);
        }
      }
    }

    logger.info('✅ Encryption migrations completed');
  } catch (error) {
    console.error('Encryption migrations failed:', error);
  }
}

module.exports = { [REDACTED_TOKEN] };

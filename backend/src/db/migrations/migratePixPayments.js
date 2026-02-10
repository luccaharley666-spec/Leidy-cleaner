/**
 * Migration para PIX Payment
 * 
 * Adiciona suporte completo para pagamentos PIX na tabela payments
 * Executa alterações na estrutura do banco de dados
 */

const path = require('path');
const fs = require('fs');

async function migratePixPayments(db) {
  try {
    console.log('🔄 Iniciando migration PIX Payments...');

    // Verificar quais colunas já existem
    const tableInfo = await db.all(`PRAGMA table_info(payments)`);
    const existingColumns = tableInfo.map(col => col.name);

    const columnsToAdd = [
      { name: 'transaction_id', type: 'TEXT UNIQUE' },
      { name: 'qr_code', type: 'LONGTEXT' },
      { name: 'br_code', type: 'VARCHAR(255)' },
      { name: 'pix_key', type: 'VARCHAR(100)' },
      { name: 'webhook_response', type: 'LONGTEXT' },
      { name: 'confirmed_at', type: 'DATETIME' },
      { name: 'expires_at', type: 'DATETIME' },
      { name: 'user_id', type: 'INTEGER' },
      { name: '[REDACTED_TOKEN]', type: 'DATETIME' }
    ];

    // Adicionar colunas que não existem
    for (const column of columnsToAdd) {
      if (!existingColumns.includes(column.name)) {
        const sql = `ALTER TABLE payments ADD COLUMN ${column.name} ${column.type}`;
        console.log(`  ➕ Adicionando coluna: ${column.name}`);
        await db.run(sql);
      } else {
        console.log(`  ✓ Coluna já existe: ${column.name}`);
      }
    }

    // Criar índices para melhor performance
    const indicesToCreate = [
      { name: '[REDACTED_TOKEN]', column: 'transaction_id' },
      { name: 'idx_payments_user', column: 'user_id' },
      { name: '[REDACTED_TOKEN]', column: 'booking_id' },
      { name: 'idx_payments_status', column: 'status' },
      { name: 'idx_payments_method', column: 'method' }
    ];

    for (const index of indicesToCreate) {
      try {
        const sql = `CREATE INDEX IF NOT EXISTS ${index.name} ON payments(${index.column})`;
        await db.run(sql);
        console.log(`  📊 Índice criado: ${index.name}`);
      } catch (error) {
        console.log(`  ⚠️  Índice já existe ou erro: ${index.name}`);
      }
    }

    console.log('✅ Migration PIX Payments concluída com sucesso!');
    return { success: true, message: 'PIX migration completed' };
  } catch (error) {
    console.error('❌ Erro durante migration PIX:', error);
    throw error;
  }
}

module.exports = migratePixPayments;

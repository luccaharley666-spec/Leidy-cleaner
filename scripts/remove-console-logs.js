#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob').sync;

/**
 * Remove console.logs de produção mantendo apenas console.error críticos
 * Preserva: console.error (erros), e comentários
 * Remove: console.log, console.warn, console.debug (debug)
 */

const BACKEND_PATHS = [
  'backend/src/**/*.js',
  '!backend/src/**/*.test.js',
  '!backend/src/**/__tests__/**'
];

const KEEP_PATTERNS = [
  // Manter console.error em produção
  /console\.error\(/,
  // Manter logger calls
  /logger\.(error|warn|info)\(/
];

const REMOVE_PATTERNS = [
  // Remover console.log
  /\s*console\.log\([^)]*\);\n/g,
  // Remover console.warn (não crítico)
  /\s*console\.warn\([^)]*\);\n/g,
  // Remover console.debug
  /\s*console\.debug\([^)]*\);\n/g
];

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalLength = content.length;

    // Remove console.log, console.warn, console.debug
    content = content.replace(/\s*console\.log\([^)]*\);\n?/g, '');
    content = content.replace(/\s*console\.warn\([^)]*\);\n?/g, '');
    content = content.replace(/\s*console\.debug\([^)]*\);\n?/g, '');

    // Manter console.error e logger
    if (content.length !== originalLength) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return false;
  }
}

// Processar arquivos
console.log('🔍 Removendo console.logs de produção...\n');
let totalFiles = 0;
let modifiedFiles = 0;

for (const pattern of BACKEND_PATHS) {
  const files = glob(pattern, { cwd: process.cwd() });
  
  for (const file of files) {
    totalFiles++;
    if (processFile(file)) {
      modifiedFiles++;
      console.log(`✅ ${file}`);
    }
  }
}

console.log(`\n✨ Concluído!`);
console.log(`📊 Total: ${totalFiles} arquivos`);
console.log(`✏️  Modificados: ${modifiedFiles} arquivos`);

#!/usr/bin/env node
/**
 * 🔧 Script: Corrigir console.log/error em todos os arquivos
 * Substitui console.* por logger.* de forma segura
 */

const fs = require('fs');
const path = require('path');

// Diretórios a processar
const DIRS = [
  '/workspaces/avan-o/backend/src/controllers',
  '/workspaces/avan-o/backend/src/middleware',
  '/workspaces/avan-o/backend/src/routes'
];

let totalFixed = 0;
let filesProcessed = 0;

function getFiles(dir) {
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.js'))
    .map(f => path.join(dir, f));
}

function fixConsoleLogsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    // Garantir que logger está importado
    if (!content.includes("const logger = require") && !content.includes("const logger =")) {
      // Adicionar após os primeiros requires
      const firstRequireLine = content.search(/^const .* = require/m);
      if (firstRequireLine !== -1) {
        const beforeFirstRequire = content.substring(0, firstRequireLine);
        const afterFirstRequireStart = content.substring(firstRequireLine);
        content = beforeFirstRequire + "const logger = require('../utils/logger');\n" + afterFirstRequireStart;
      }
    }
    
    // Substituições
    const fixes = [
      // console.error → logger.error
      [/console\.error\(/g, 'logger.error('],
      // console.log → logger.info  
      [/console\.log\(/g, 'logger.info('],
      // console.warn → logger.warn
      [/console\.warn\(/g, 'logger.warn('],
      // console.info → logger.info
      [/console\.info\(/g, 'logger.info(']
    ];
    
    let fixCount = 0;
    fixes.forEach(([regex, replacement]) => {
      const matches = content.match(regex);
      if (matches) {
        fixCount += matches.length;
        content = content.replace(regex, replacement);
      }
    });
    
    // Salvar se houve mudança
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      filesProcessed++;
      totalFixed += fixCount;
      console.log(`✅ ${path.basename(filePath)}: ${fixCount} substituições`);
    }
  } catch (error) {
    console.error(`❌ Erro em ${filePath}:`, error.message);
  }
}

// Executar
console.log('🔄 Corrigindo console.log/error...\n');

DIRS.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`📁 Processando ${path.basename(dir)}/`);
    getFiles(dir).forEach(fixConsoleLogsInFile);
    console.log('');
  }
});

console.log(`\n✅ COMPLETO!`);
console.log(`   Files: ${filesProcessed}`);
console.log(`   Fixes: ${totalFixed}`);

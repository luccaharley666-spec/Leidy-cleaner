const fs = require('fs');
const path = require('path');

const testsDir = path.resolve(__dirname, 'backend/src/__tests__');
if (!fs.existsSync(testsDir)) {
  console.error('Tests directory not found:', testsDir);
  process.exit(1);
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (/\.js$/.test(ent.name)) cleanFile(p);
  }
}

function cleanFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  // Remove lines that contain [CLEANED_PLACEHOLDER]
  content = content.split('\n').filter(l => !l.includes('[CLEANED_PLACEHOLDER]')).join('\n');
  // Remove lines that are exactly single-line comments with PLACEHOLDER markers
  content = content.split('\n').filter(l => !/^\s*\/\/\s*PLACEHOLDER/.test(l)).join('\n');
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Cleaned', file);
  }
}

walk(testsDir);
console.log('Done cleaning placeholders.');

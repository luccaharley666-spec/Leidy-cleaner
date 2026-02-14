const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const testsDir = path.join(__dirname, '..', 'src', '__tests__');
if (!fs.existsSync(testsDir)) {
  console.error('Tests directory not found:', testsDir);
  process.exit(1);
}

const files = walk(testsDir).filter(f => f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.ts'));
let patched = 0;
files.forEach(file => {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('TODO_PLACEHOLDER')) {
      // comment this line
      lines[i] = '// [CLEANED_PLACEHOLDER] ' + lines[i].replace(/TODO_PLACEHOLDER/g, '');
      // also comment following block lines up to 6 lines if they look like callback or closing
      for (let j = 1; j <= 6 && i + j < lines.length; j++) {
        const l = lines[i + j].trim();
        if (l === '});' || l.startsWith('callback(') || l.startsWith('callback ') || l.startsWith('callback(') || l.includes('callback(') || l.includes('callback ')) {
          lines[i + j] = '// [CLEANED_PLACEHOLDER] ' + lines[i + j];
        }
      }
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
    patched++;
    console.log('Patched', file);
  }
});
console.log('Done. Files patched:', patched);

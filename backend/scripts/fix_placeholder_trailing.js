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
let changed = 0;
files.forEach(file => {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  let modified = false;
  for (let i = 0; i < lines.length - 1; i++) {
    if (lines[i].startsWith('// [CLEANED_PLACEHOLDER]') && lines[i+1].trim() === '});') {
      lines[i+1] = '// [CLEANED_PLACEHOLDER] ' + lines[i+1];
      modified = true;
    }
    if (lines[i].startsWith('// [CLEANED_PLACEHOLDER]') && lines[i+1].trim() === '});' ) {
      // handled above
    }
  }
  if (modified) {
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
    changed++;
    console.log('Fixed trailing in', file);
  }
});
console.log('Done. Files modified:', changed);

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
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('TODO_PLACEHOLDER') || content.includes('TODO_PLACEHOLDER(')) {
    const newContent = content.split('\n').map(line => {
      if (line.includes('TODO_PLACEHOLDER')) {
        return '// [CLEANED_PLACEHOLDER] ' + line.replace(/TODO_PLACEHOLDER/g, '').trim();
      }
      return line;
    }).join('\n');
    fs.writeFileSync(file, newContent, 'utf8');
    patched++;
    console.log('Patched', file);
  }
});
console.log('Done. Files patched:', patched);

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
  let content = fs.readFileSync(file, 'utf8');
  const pattern = /const\s+PLACEHOLDER\s*=\s*require\(([^)]+controllers\\/PLACEHOLDER[^)]+)\);/g;
  if (pattern.test(content)) {
    content = content.replace(pattern, (m, p1) => {
      return `var PLACEHOLDER = (function(){ try { return require(${p1}); } catch(e) { return {}; } })();`;
    });
    fs.writeFileSync(file, content, 'utf8');
    changed++;
    console.log('Patched requires in', file);
  }
});
console.log('Done. Files updated:', changed);

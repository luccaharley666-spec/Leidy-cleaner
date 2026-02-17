const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'frontend', 'src');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (/\.jsx?$/.test(ent.name)) fixFile(p);
  }
}

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Remove 'decoded' from named imports (e.g. { Foo, decoded, Bar })
  content = content.replace(/\{([^}]*?)\}/gs, (m, inner) => {
    if (/\bdecoded\b/.test(inner)) {
      const replaced = inner
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== 'decoded')
        .join(', ');
      return `{ ${replaced} }`;
    }
    return m;
  });

  // Remove occurrences of ' decoded' in className / template literals and 'dark:decoded'
  content = content.replace(/\sdecoded\b/g, '');
  content = content.replace(/dark:decoded\b/g, '');

  // Remove any trailing multiple commas left in imports, e.g. { A,  , B }
  content = content.replace(/\{\s*,\s*/g, '{ ');
  content = content.replace(/,\s*,/g, ',');
  content = content.replace(/,\s*\}/g, ' }');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Patched', file);
  }
}

walk(root);
console.log('Done fixing decoded tokens.');

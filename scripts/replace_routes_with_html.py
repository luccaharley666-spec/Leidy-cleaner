#!/usr/bin/env python3
from pathlib import Path
import re

# make ROOT relative to the repository so scripts run anywhere
ROOT = Path(__file__).resolve().parents[1] / 'frontend' / 'public_html'
if not ROOT.exists():
    # fallback to current working directory (CI / dev shells)
    ROOT = Path.cwd() / 'frontend' / 'public_html'
if not ROOT.exists():
    print('public_html not found at', ROOT); raise SystemExit(1)

html_files = list(ROOT.rglob('*.html'))
changed = []

pattern = re.compile(r'(["\'])(/([A-Za-z0-9_\-\/]+))(#[^"\']*)?(["\'])')

for f in html_files:
    txt = f.read_text(encoding='utf-8', errors='ignore')
    new = txt
    for m in pattern.finditer(txt):
        full = m.group(2)  # like /servicos or /folder/page
        path = m.group(3)  # servicos or folder/page
        frag = m.group(4) or ''
        # ignore root /
        if path == '':
            continue
        # ignore paths containing a dot (likely files with extension)
        if '.' in path:
            continue
        candidate = ROOT / (path + '.html')
        # if candidate exists, replace occurrence of "/path[frag]"
        if candidate.exists():
            orig = m.group(1) + full + (frag or '') + m.group(5)
            replacement = m.group(1) + '/' + path + '.html' + (frag or '') + m.group(5)
            new = new.replace(orig, replacement)
    if new != txt:
        f.write_text(new, encoding='utf-8')
        changed.append(str(f.relative_to(ROOT)))

print('Files updated:', len(changed))
for c in changed:
    print('- ' + c)

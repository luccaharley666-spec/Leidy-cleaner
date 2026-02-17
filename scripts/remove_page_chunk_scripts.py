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

targets = ['contato-leidy', 'sobre-leidy']
pattern = re.compile(r'<script[^>]+/(_?next|\\-next)/static/chunks/pages/([^"\']+)["\'][^>]*>\s*</script>', re.IGNORECASE)
modified = []

for f in ROOT.rglob('*.html'):
    txt = f.read_text(encoding='utf-8', errors='ignore')
    new = txt
    for t in targets:
        # remove any script src that contains /_next/static/chunks/pages/<t>
        new = re.sub(r"<script[^>]+src=[\'\"][^\'\"]*/_next/static/chunks/pages/" + re.escape(t) + r"[^\'\"]*[\'\"][^>]*>\s*</script>", '', new, flags=re.IGNORECASE)
        new = re.sub(r"<script[^>]+src=[\'\"][^\'\"]*/-next/static/chunks/pages/" + re.escape(t) + r"[^\'\"]*[\'\"][^>]*>\s*</script>", '', new, flags=re.IGNORECASE)
    if new != txt:
        # backup
        bak = f.with_suffix(f.suffix + '.bak2')
        bak.write_text(txt, encoding='utf-8')
        f.write_text(new, encoding='utf-8')
        modified.append(str(f.relative_to(ROOT)))

print('Files modified:', len(modified))
for m in modified:
    print('- ' + m)

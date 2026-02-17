#!/usr/bin/env python3
import sys
from pathlib import Path

# make ROOT relative to the repository so scripts run anywhere
ROOT = Path(__file__).resolve().parents[1] / 'frontend' / 'public_html'
if not ROOT.exists():
    # fallback to current working directory (CI / dev shells)
    ROOT = Path.cwd() / 'frontend' / 'public_html'
if not ROOT.exists():
    print('public_html not found at', ROOT)
    sys.exit(1)

changed = []
for p in ROOT.rglob('*.html'):
    text = p.read_text(encoding='utf-8')
    new = text.replace('/-next/static', '/_next/static')
    # Also fix any repeated artifacts like /-next/ that missed the "static" part
    new = new.replace('/-next/', '/_next/')
    # Normalize common HTML entity for single quotes inside inline style url(...) which some scanners mis-handle
    if "&#x27;" in new:
        new = new.replace('&#x27;', "'")
    if new != text:
        p.write_text(new, encoding='utf-8')
        changed.append(str(p.relative_to(ROOT)))

print('Files updated:', len(changed))
for f in changed:
    print('- ' + f)

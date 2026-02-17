#!/usr/bin/env python3
import re
from pathlib import Path
# make ROOT relative to the repository so scripts run anywhere
ROOT = Path(__file__).resolve().parents[1] / 'frontend' / 'public_html'
if not ROOT.exists():
    # fallback to current working directory (CI / dev shells)
    ROOT = Path.cwd() / 'frontend' / 'public_html'
if not ROOT.exists():
    print('public_html not found at', ROOT); raise SystemExit(1)

KEYWORDS = [
    'cupom', 'cupons', 'ofertas especiais', 'meus cupons',
    'plano', 'planos', 'assinatura', 'assinaturas'
]

html_files = list(ROOT.rglob('*.html'))
modified = []

def contains_keyword(txt):
    low = txt.lower()
    return any(k in low for k in KEYWORDS)

for f in html_files:
    txt = f.read_text(encoding='utf-8', errors='ignore')
    if not contains_keyword(txt):
        continue
    # backup original
    bak = f.with_suffix(f.suffix + '.bak')
    bak.write_text(txt, encoding='utf-8')

    new = txt
    # Remove <section> blocks that contain any keyword
    new = re.sub(r'<section[\s\S]*?>[\s\S]*?(?:' + '|'.join(re.escape(k) for k in KEYWORDS) + ')[\s\S]*?</section>', '', new, flags=re.IGNORECASE)
    # Remove common coupon div blocks with headings
    new = re.sub(r'<div[\s\S]*?>[\s\S]*?(?:cupom|cupons|ofertas|promo)[\s\S]*?</div>', '', new, flags=re.IGNORECASE)
    # Remove small standalone headings mentioning coupons/plans
    new = re.sub(r'<h[1-6][^>]*>[^<]*(?:' + '|'.join(re.escape(k) for k in KEYWORDS) + ')[^<]*</h[1-6]>', '', new, flags=re.IGNORECASE)

    # If changed, write
    if new != txt:
        f.write_text(new, encoding='utf-8')
        modified.append(str(f.relative_to(ROOT)))

print('Files modified:', len(modified))
for m in modified:
    print('- ' + m)

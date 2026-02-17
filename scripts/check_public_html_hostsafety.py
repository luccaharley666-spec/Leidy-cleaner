#!/usr/bin/env python3
import re
from pathlib import Path
# make ROOT relative to the repository so scripts run anywhere
ROOT = Path(__file__).resolve().parents[1] / 'frontend' / 'public_html'
if not ROOT.exists():
    # fallback to current working directory (CI / dev shells)
    ROOT = Path.cwd() / 'frontend' / 'public_html'
if not ROOT.exists():
    print('ERROR: public_html not found at', ROOT)
    raise SystemExit(1)

win_abs_pattern = re.compile(r'([A-Za-z]:\\|file:///|file://|\\\\)')
refs = []
missing = []
win_paths = []
htaccess_issues = False

for p in ROOT.rglob('*.html'):
    txt = p.read_text(encoding='utf-8', errors='ignore')
    # find src, href, url(...) occurrences
    for m in re.finditer(r'(?:src|href)=["\']([^"\']+)["\']', txt, re.IGNORECASE):
        refs.append((p.relative_to(ROOT), m.group(1)))
    for m in re.finditer(r'url\(([^)]+)\)', txt, re.IGNORECASE):
        refs.append((p.relative_to(ROOT), m.group(1).strip(' "\'')))

for f, ref in refs:
    # detect windows absolute
    if win_abs_pattern.search(ref):
        win_paths.append((str(f), ref))
        continue
    # ignore external http(s) and mailto and tel and anchors
    if re.match(r'^(https?:|mailto:|tel:|//|#)', ref):
        continue
    # strip query
    ref_clean = ref.split('?')[0].split('#')[0]
    # if starts with / it's relative to public_html
    if ref_clean.startswith('/'):
        target = ROOT.joinpath(ref_clean.lstrip('/'))
    else:
        target = (ROOT.joinpath(f).parent / ref_clean).resolve()
    # check existence
    if not target.exists():
        missing.append((str(f), ref, str(target)))

# inspect .htaccess
ht = ROOT / '.htaccess'
if ht.exists():
    content = ht.read_text(encoding='utf-8', errors='ignore')
    if re.search(r'deny from all|require all denied|deny all', content, re.IGNORECASE):
        htaccess_issues = True

print('Summary for', ROOT)
print('HTML files scanned:', len(list(ROOT.rglob('*.html'))))
print('Total references found:', len(refs))
print('Windows absolute path refs:', len(win_paths))
for w in win_paths[:10]:
    print('-', w[0], '->', w[1])
print('Missing file references (sample up to 20):', len(missing))
for m in missing[:20]:
    print('-', m[0], 'references', m[1], '-> expected', m[2])
print('.htaccess present:', ht.exists())
if ht.exists():
    print('.htaccess contains deny/require deny patterns:', htaccess_issues)

if len(missing)==0 and len(win_paths)==0 and not htaccess_issues:
    print('No immediate hosting-blocking issues detected.')
else:
    print('Fixes recommended for the issues above.')

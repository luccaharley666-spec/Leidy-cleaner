#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PATTERNS=(
  "\b[A-Za-z0-9_\-]{20,}\b" # long tokens
  "sk_live_[A-Za-z0-9_\-]+"
  "pk_live_[A-Za-z0-9_\-]+"
  "whsec_[A-Za-z0-9_\-]+"
  "SENTRY_DSN=|sentry.io/"
  "[REDACTED_TOKEN]|[REDACTED_TOKEN]"
  "[REDACTED_TOKEN]"
)

echo "Scanning repository for potential secrets..."
for p in "${PATTERNS[@]}"; do
  echo "--- Pattern: $p ---"
  grep -RIn --exclude-dir={node_modules,.git} -E "$p" "$REPO_ROOT" || true
done

echo
echo "Done. To mask or remove found secrets, review results above and run with --mask"

if [[ "${1:-}" == "--mask" ]]; then
  echo "Masking found secrets (creating backups *.bak)..."
  for p in "${PATTERNS[@]}"; do
    grep -RIl --exclude-dir={node_modules,.git} -E "$p" "$REPO_ROOT" | while read -r file; do
        cp "$file" "$file.bak"
        # safer masking: replace exact matches found by grep to avoid sed regex delimiter issues
        grep -o -E "$p" "$file" | sort -u | while read -r match; do
          # escape sed delimiters and ampersands
          esc=$(printf '%s' "$match" | sed 's/[\/&|]/\\&/g') || esc="$match"
          sed -i "s|$esc|[REDACTED_TOKEN]|g" "$file" || true
        done
        echo "Patched: $file"
      done
  done
  echo "Masking complete. Review .bak files as needed."
fi

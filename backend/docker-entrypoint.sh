#!/usr/bin/env bash
set -euo pipefail

DB_HOST=${DB_HOST:-db}
DB_PORT=${DB_PORT:-5432}
MAX_WAIT=${MAX_WAIT:-60}

echo "⏳ Waiting for database ${DB_HOST}:${DB_PORT} (max ${MAX_WAIT}s)"
start_ts=$(date +%s)
while true; do
  # try TCP connect
  if (echo > /dev/tcp/${DB_HOST}/${DB_PORT}) >/dev/null 2>&1; then
    echo "✅ Database reachable"
    break
  fi
  now_ts=$(date +%s)
  if [ $((now_ts - start_ts)) -ge ${MAX_WAIT} ]; then
    echo "❌ Timeout waiting for database" >&2
    exit 1
  fi
  sleep 1
done

# Run migrations if compiled JS exists
if [ -f ./dist/db/runMigrations.js ]; then
  echo "➡️ Running migrations: node ./dist/db/runMigrations.js"
  node ./dist/db/runMigrations.js || echo "warning: migrations exited with non-zero status"
else
  echo "ℹ️ No compiled migrations found (./dist/db/runMigrations.js)"
fi

if [ -f ./dist/db/seed.js ]; then
  echo "➡️ Running seed: node ./dist/db/seed.js"
  node ./dist/db/seed.js || echo "warning: seed exited with non-zero status"
else
  echo "ℹ️ No compiled seed found (./dist/db/seed.js)"
fi

echo "▶️ Starting backend: exec node ./dist/main.js"
exec node ./dist/main.js

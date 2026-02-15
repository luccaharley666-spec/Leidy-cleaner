#!/bin/bash

###############################################################################
# 🔴 Redis Setup + Testing (5 min install + 5 min testing)
###############################################################################

set -e

echo "🔴 ======================================"
echo "    REDIS SETUP + TESTING"
echo "======================================"
echo ""

# Check if Redis is already installed
if command -v redis-server &> /dev/null; then
  echo "✅ Redis already installed!"
  REDIS_VERSION=$(redis-server --version)
  echo "   Version: $REDIS_VERSION"
else
  echo "⏳ Installing Redis..."
  
  # Try apt first (Linux)
  if command -v apt-get &> /dev/null; then
    echo "   Using apt-get..."
    sudo apt-get update -qq
    sudo apt-get install -y redis-server > /dev/null 2>&1
    echo "✅ Redis installed via apt-get"
  
  # Try brew (macOS)
  elif command -v brew &> /dev/null; then
    echo "   Using brew..."
    brew install redis > /dev/null 2>&1
    echo "✅ Redis installed via brew"
  
  else
    echo "❌ Cannot install Redis automatically"
    echo "   Please install manually:"
    echo "   → Linux: sudo apt-get install redis-server"
    echo "   → macOS: brew install redis"
    echo "   → Docker: docker run -d -p 6379:6379 redis:latest"
    exit 1
  fi
fi

echo ""

# Check if Redis is running
if redis-cli ping > /dev/null 2>&1; then
  echo "✅ Redis server is running!"
else
  echo "⏳ Starting Redis server..."
  
  # Try different ways to start
  if command -v systemctl &> /dev/null; then
    sudo systemctl start redis-server > /dev/null 2>&1 && echo "✅ Started via systemctl"
  elif command -v brew &> /dev/null; then
    redis-server --daemonize yes > /dev/null 2>&1 && echo "✅ Started via brew"
  else
    redis-server --daemonize yes > /dev/null 2>&1 && echo "✅ Started manually"
  fi
  
  # Wait for Redis to start
  sleep 1
fi

# Verify Redis is running
echo ""
echo "🧪 Testing Redis Connection"
echo "──────────────────────────"
echo ""

# Test basic ping
PING=$(redis-cli ping)
if [ "$PING" == "PONG" ]; then
  echo "✅ Redis PING: PONG"
else
  echo "❌ Redis PING failed"
  exit 1
fi

# Test set/get
redis-cli SET test_key "test_value" > /dev/null
VALUE=$(redis-cli GET test_key)
if [ "$VALUE" == "test_value" ]; then
  echo "✅ Redis SET/GET: Working"
else
  echo "❌ Redis SET/GET failed"
  exit 1
fi

# Clean up test key
redis-cli DEL test_key > /dev/null

echo ""
echo "📊 Redis Information"
echo "───────────────────"
echo ""

# Display Redis stats
redis-cli INFO server | head -10 | grep -E "redis_version|redis_mode|process_id" | while read line; do
  echo "   $line"
done

echo ""

# Display memory usage
echo "Memory Usage:"
MEMORY=$(redis-cli INFO memory | grep used_memory_human | cut -d':' -f2)
echo "   Used: $MEMORY"

echo ""

# Display connected clients
CLIENTS=$(redis-cli INFO clients | grep connected_clients | cut -d':' -f2)
echo "Clients Connected: $CLIENTS"

echo ""

# Display key stats
echo "Keyspace:"
redis-cli INFO keyspace | while read line; do
  [ ! -z "$line" ] && echo "   $line"
done

echo ""

# Test cache with TTL
echo "🧪 Testing Cache with TTL"
echo "─────────────────────────"
echo ""

redis-cli SET cache_test "Cache value" EX 5 > /dev/null
CACHE_VALUE=$(redis-cli GET cache_test)
echo "✅ Set cache key with 5s TTL: $CACHE_VALUE"

TTL=$(redis-cli TTL cache_test)
echo "✅ TTL remaining: ${TTL}s"

# Test increment
echo ""
echo "Testing Counters"
redis-cli SET counter 0 > /dev/null
redis-cli INCR counter > /dev/null
COUNTER=$(redis-cli GET counter)
echo "✅ Counter value: $COUNTER"

echo ""
echo "═════════════════════════════════════════════════════════════════════"
echo "✅ REDIS SETUP COMPLETE"
echo "═════════════════════════════════════════════════════════════════════"
echo ""
echo "Redis is NOW READY for:"
echo "   • Cache storage"
echo "   • Session management"
echo "   • Rate limiting"
echo "   • Queue management"
echo ""
echo "Start using in your app:"
echo "   const redis = require('redis');"
echo "   const client = redis.createClient();"
echo "   await client.connect();"
echo ""
echo "Connection string:"
echo "   redis://localhost:6379"
echo ""

cat << 'EOF'

NEXT STEPS
══════════

1. Update backend/.env:
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_URL=redis://localhost:6379

2. Test integration:
   bash scripts/integration-test.sh

3. Monitor Redis:
   redis-cli monitor

4. Flush if needed (WARNING - deletes all):
   redis-cli FLUSHALL

EOF

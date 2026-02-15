#!/bin/bash

###############################################################################
# Monitor Rate Limits in Redis
###############################################################################

echo "📊 Rate Limit Stats (from Redis):"
echo ""

# Check if Redis is running
if ! redis-cli ping >/dev/null 2>&1; then
  echo "❌ Redis not running. Start with: redis-server"
  exit 1
fi

# Get all rate limit keys
echo "🔍 Active rate limit buckets:"
for key in $(redis-cli keys "rl_*"); do
  COUNT=$(redis-cli GET "$key" | head -1)
  TTL=$(redis-cli TTL "$key")
  echo "   $key: $COUNT requests (expires in ${TTL}s)"
done

echo ""
echo "💾 Total Redis memory used:"
redis-cli info memory | grep used_memory_human

echo ""
echo "📈 Redis stats:"
redis-cli info stats | grep -E "total_commands_processed|total_connections_received|total_net_input_bytes"

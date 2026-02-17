#!/bin/bash

###############################################################################
# Test Rate Limits
###############################################################################

BASE_URL="${BASE_URL:-http://localhost:3001}"
ENDPOINT="${1:-/api/auth/login}"
REQUESTS="${2:-10}"

echo "🧪 Testing rate limits..."
echo "   Endpoint: $ENDPOINT"
echo "   Requests: $REQUESTS"
echo ""

for i in $(seq 1 $REQUESTS); do
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$ENDPOINT" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test123"}')
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)
  
  if [ "$HTTP_CODE" == "429" ]; then
    echo "❌ Request $i: RATE LIMITED ($HTTP_CODE)"
    echo "   Response: $BODY"
    break
  else
    echo "✅ Request $i: OK ($HTTP_CODE)"
  fi
  
  sleep 0.1
done

echo ""
echo "✅ Rate limit test completed"

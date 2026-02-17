#!/bin/bash

###############################################################################
# Test 2FA Setup
###############################################################################

BASE_URL="${BASE_URL:-http://localhost:3001}"

echo "🧪 Testing 2FA Setup..."
echo ""

# Step 1: Generate 2FA secret
echo "1️⃣ Generating 2FA secret..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/2fa/setup" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE")

SECRET=$(echo "$RESPONSE" | grep -o '"manual_entry_key":"[^"]*' | cut -d'"' -f4)

if [ -z "$SECRET" ]; then
  echo "❌ Failed to generate secret"
  echo "Response: $RESPONSE"
  exit 1
fi

echo "✅ Secret generated: $SECRET"
echo ""

# Step 2: Get test codes
echo "2️⃣ Getting test TOTP codes..."
TEST_CODES=$(curl -s -X POST "$BASE_URL/api/2fa/test" \
  -H "Content-Type: application/json" \
  -d "{\"secret\":\"$SECRET\"}")

CURRENT_CODE=$(echo "$TEST_CODES" | grep -o '"code":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$CURRENT_CODE" ]; then
  echo "❌ Failed to generate test codes"
  echo "Response: $TEST_CODES"
  exit 1
fi

echo "✅ Current TOTP code: $CURRENT_CODE"
echo ""

# Step 3: Verify token
echo "3️⃣ Verifying TOTP code..."
VERIFY_RESPONSE=$(curl -s -X POST "$BASE_URL/api/2fa/verify" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$CURRENT_CODE\"}")

if echo "$VERIFY_RESPONSE" | grep -q '"success":true'; then
  echo "✅ 2FA verification successful!"
else
  echo "❌ 2FA verification failed"
  echo "Response: $VERIFY_RESPONSE"
fi

echo ""
echo "✅ 2FA testing completed"

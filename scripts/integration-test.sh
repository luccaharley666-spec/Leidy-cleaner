#!/bin/bash

###############################################################################
# 🧪 INTEGRATION TEST - 2FA + Rate Limiting + Complete Auth Flow
# Test suite for FASE 1 + FASE 2 implementation
###############################################################################

set -e

BASE_URL="${BASE_URL:-http://localhost:3001}"
TEST_EMAIL="test_$(date +%s)@test.com"
TEST_PASSWORD="TestPassword123!"

echo "🧪 ======================================"
echo "   INTEGRATION TEST SUITE"
echo "   Testing FASE 1 + FASE 2"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  local expected_code=$5
  local headers=$6

  echo -n "Testing: $name ... "
  
  if [ -z "$headers" ]; then
    headers="-H 'Content-Type: application/json'"
  fi

  RESPONSE=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
    $headers \
    ${data:+-d "$data"})
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)
  
  if [[ "$HTTP_CODE" =~ $expected_code ]]; then
    echo -e "${GREEN}✅ PASSED${NC} (HTTP $HTTP_CODE)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo "$BODY"
  else
    echo -e "${RED}❌ FAILED${NC} (HTTP $HTTP_CODE, expected $expected_code)"
    echo "Response: $BODY"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
  echo ""
}

###############################################################################
# PHASE 1: Register User
###############################################################################

echo "📝 PHASE 1: User Registration"
echo "──────────────────────────────────"
echo ""

REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"name\": \"Test User\",
    \"phone\": \"11987654321\"
  }")

echo "Register Response: $REGISTER_RESPONSE"
echo ""

# Extract tokens from response
ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4 || echo "")
if [ -z "$ACCESS_TOKEN" ]; then
  ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4 || echo "")
fi

if [ -z "$ACCESS_TOKEN" ]; then
  echo -e "${RED}❌ Failed to extract access token from registration${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
else
  echo -e "${GREEN}✅ Registration successful, token extracted${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
fi
echo ""

###############################################################################
# PHASE 2: Test Rate Limiting on Login
###############################################################################

echo "🔒 PHASE 2: Rate Limiting Test (Login Brute Force)"
echo "──────────────────────────────────────────────────"
echo ""

LOGIN_ATTEMPTS=6
for i in $(seq 1 $LOGIN_ATTEMPTS); do
  echo -n "Attempt $i/6: "
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$TEST_EMAIL\",
      \"password\": \"WrongPassword123!\"
    }")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  
  if [ "$HTTP_CODE" == "429" ]; then
    echo -e "${GREEN}✅ Rate limited (HTTP 429)${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    break
  elif [ "$HTTP_CODE" == "401" ]; then
    echo -e "${YELLOW}⚠️  Wrong credentials (HTTP 401)${NC}"
  else
    echo -e "${RED}❌ Unexpected status (HTTP $HTTP_CODE)${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
done
echo ""

###############################################################################
# PHASE 3: Test 2FA Setup
###############################################################################

echo "🔐 PHASE 3: 2FA Setup Test"
echo "──────────────────────────"
echo ""

if [ -z "$ACCESS_TOKEN" ]; then
  echo -e "${RED}❌ Skipping 2FA test - no access token${NC}"
else
  # Get 2FA setup
  echo "Getting 2FA setup..."
  SETUP_RESPONSE=$(curl -s -X GET "$BASE_URL/api/2fa/setup" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json")
  
  echo "2FA Setup Response:"
  echo "$SETUP_RESPONSE" | grep -o '"manual_entry_key":"[^"]*' | head -1
  echo ""
  
  # Extract secret from response
  SECRET=$(echo "$SETUP_RESPONSE" | grep -o '"manual_entry_key":"[^"]*' | cut -d'"' -f4 || echo "")
  
  if [ -z "$SECRET" ]; then
    echo -e "${RED}❌ Failed to get 2FA secret${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  else
    echo -e "${GREEN}✅ 2FA secret obtained${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    
    # Get test TOTP codes
    echo ""
    echo "Getting test TOTP codes..."
    TEST_CODES_RESPONSE=$(curl -s -X POST "$BASE_URL/api/2fa/test" \
      -H "Content-Type: application/json" \
      -d "{\"secret\": \"$SECRET\"}")
    
    echo "TOTP Test Response:"
    echo "$TEST_CODES_RESPONSE"
    
    # Extract current code
    CURRENT_CODE=$(echo "$TEST_CODES_RESPONSE" | grep -o '"code":"[^"]*' | head -1 | cut -d'"' -f4 || echo "")
    
    if [ -z "$CURRENT_CODE" ]; then
      echo -e "${RED}❌ Failed to get TOTP code${NC}"
      TESTS_FAILED=$((TESTS_FAILED + 1))
    else
      echo -e "${GREEN}✅ TOTP code: $CURRENT_CODE${NC}"
      TESTS_PASSED=$((TESTS_PASSED + 1))
    fi
  fi
fi

echo ""

###############################################################################
# SUMMARY
###############################################################################

echo "📊 ======================================"
echo "   TEST SUMMARY"
echo "======================================"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed${NC}"
  exit 1
fi

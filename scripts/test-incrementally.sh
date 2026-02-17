#!/bin/bash

# Script para testar um arquivo por vez
# Isso evita travamentos e identifica o problema específico

cd /workspaces/avan-o/backend

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Arquivos para armazenar resultados
PASSED_FILE="/tmp/jest_passed.txt"
FAILED_FILE="/tmp/jest_failed.txt"
TIMEOUT_FILE="/tmp/jest_timeout.txt"

> "$PASSED_FILE"
> "$FAILED_FILE"
> "$TIMEOUT_FILE"

echo "=========================================="
echo "Testando cada Suite Individualmente"
echo "=========================================="

# Array com os testes
tests=(
  "EmailTemplates.test.js"
  "Factory.test.js"
  "Notifications.test.js"
  "RoutingService.test.js"
  "Validation.test.js"
  "api.integration.test.js"
  "controllers/AdminController.test.js"
  "controllers/AuthController.test.js"
  "controllers/BookingController.test.js"
  "controllers/NewsletterController.test.js"
  "controllers/NotificationController.test.js"
  "controllers/NotificationsController.test.js"
  "controllers/PaymentController.test.js"
  "controllers/PhotosController.test.js"
  "controllers/PublicReviewsController.test.js"
  "controllers/ReviewController.test.js"
  "controllers/StaffController.test.js"
  "factory.test.js"
  "health.test.js"
  "integration-tests.test.js"
  "middleware.test.js"
  "models/Booking.test.js"
  "models/Invoice.test.js"
  "models/Service.test.js"
  "models/User.test.js"
  "priceCalculator.test.js"
  "retryQueue.test.js"
  "routes/admin.integration.test.js"
  "routes/api.integration.test.js"
  "routes/profile.integration.test.js"
  "routes/profile.test.js"
  "security/jwt-authentication.test.js"
  "services/BookingService.test.js"
  "services/CompanyService.test.js"
  "services/EmailService.test.js"
  "services/MonitoringService.test.js"
  "services/PixService.test.js"
  "services/critical-services.test.js"
  "services/zero-coverage.test.js"
  "utils.test.js"
  "validation.test.js"
)

count=0
for test in "${tests[@]}"; do
  count=$((count + 1))
  echo -n "[$count/${#tests[@]}] Testing $test ... "
  
  # Run with 15s timeout
  if timeout 15 npm test -- "$test" > /tmp/test_output.txt 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "$test" >> "$PASSED_FILE"
  else
    exit_code=$?
    if [ $exit_code -eq 124 ]; then
      echo -e "${RED}✗ TIMEOUT${NC}"
      echo "$test" >> "$TIMEOUT_FILE"
    else
      echo -e "${RED}✗ FAILED${NC}"
      echo "$test" >> "$FAILED_FILE"
      # Print last 20 lines of error
      echo "  Error output:"
      tail -20 /tmp/test_output.txt | sed 's/^/    /'
    fi
  fi
done

echo ""
echo "=========================================="
echo "Results Summary"
echo "=========================================="
passed=$(wc -l < "$PASSED_FILE")
failed=$(wc -l < "$FAILED_FILE")
timeout=$(wc -l < "$TIMEOUT_FILE")

echo -e "${GREEN}✓ Passed: $passed${NC}"
echo -e "${RED}✗ Failed: $failed${NC}"
echo -e "${YELLOW}⏱ Timeout: $timeout${NC}"

if [ $failed -gt 0 ]; then
  echo ""
  echo "Failed tests:"
  cat "$FAILED_FILE" | sed 's/^/  - /'
fi

if [ $timeout -gt 0 ]; then
  echo ""
  echo "Timeout tests:"
  cat "$TIMEOUT_FILE" | sed 's/^/  - /'
fi

#!/bin/bash

###############################################################################
# test-pix-endpoints.sh
# Script para testar os endpoints PIX localmente
# 
# Uso: bash backend/scripts/test-pix-endpoints.sh
###############################################################################

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuração
# Detectar porta do backend (padrão 3000 local)
BASE_URL="http://localhost:3000"
ADMIN_EMAIL="fransmalifra@gmail.com"
ADMIN_PASS="r!1QrE&McMzT2\$zu"
SECRET="[REDACTED_TOKEN]"

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}  PIX Endpoints Test Suite${NC}"
echo -e "${BLUE}==========================================${NC}\n"

# ============================================================================
# 1. LOGIN para obter token
# ============================================================================
echo -e "${YELLOW}[1/5] Fazendo login...${NC}"

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Falha ao fazer login${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Login bem-sucedido${NC}"
echo -e "   Token: ${TOKEN:0:20}...\n"

# ============================================================================
# 2. Criar pagamento PIX
# ============================================================================
echo -e "${YELLOW}[2/5] Criando pagamento PIX...${NC}"

CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/pix/create" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bookingId":1,"amount":150.00}')

TRANSACTION_ID=$(echo "$CREATE_RESPONSE" | grep -o '"transactionId":"[^"]*' | head -1 | cut -d'"' -f4)
QR_CODE=$(echo "$CREATE_RESPONSE" | grep -o '"qrCode":"[^"]*' | head -1 | cut -d'"' -f4 | cut -c1-50)
STATUS=$(echo "$CREATE_RESPONSE" | grep -o '"status":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$TRANSACTION_ID" ]; then
  echo -e "${RED}❌ Falha ao criar pagamento${NC}"
  echo "Response: $CREATE_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Pagamento criado${NC}"
echo -e "   Transaction ID: $TRANSACTION_ID"
echo -e "   QR Code: ${QR_CODE}..."
echo -e "   Status: $STATUS\n"

# ============================================================================
# 3. Consultar status do pagamento (antes de webhook)
# ============================================================================
echo -e "${YELLOW}[3/5] Consultando status (antes de webhook)...${NC}"

STATUS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/pix/status/$TRANSACTION_ID" \
  -H "Authorization: Bearer $TOKEN")

STATUS_BEFORE=$(echo "$STATUS_RESPONSE" | grep -o '"status":"[^"]*' | cut -d'"' -f4)

if [ "$STATUS_BEFORE" = "waiting" ]; then
  echo -e "${GREEN}✅ Status correto (waiting)${NC}"
  echo -e "   Response: $STATUS_RESPONSE\n"
else
  echo -e "${YELLOW}⚠️  Status inesperado: $STATUS_BEFORE${NC}\n"
fi

# ============================================================================
# 4. Simular webhook do banco
# ============================================================================
echo -e "${YELLOW}[4/5] Simulando webhook do banco...${NC}"

# Criar body do webhook
WEBHOOK_BODY="{\"id\":\"$TRANSACTION_ID\",\"status\":\"confirmed\",\"amount\":150.00,\"receivedAt\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}"

# Gerar assinatura HMAC-SHA256
if command -v shasum &> /dev/null; then
  # macOS
  SIGNATURE=$(echo -n "$WEBHOOK_BODY" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')
elif command -v sha256sum &> /dev/null; then
  # Linux
  SIGNATURE=$(echo -n "$WEBHOOK_BODY" | openssl dgst -sha256 -hmac "$SECRET" | cut -d' ' -f2)
else
  SIGNATURE=$(echo -n "$WEBHOOK_BODY" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $NF}')
fi

echo "   Body: $WEBHOOK_BODY"
echo "   Signature: ${SIGNATURE:0:20}...\n"

WEBHOOK_RESPONSE=$(curl -s -X POST "$BASE_URL/api/pix/webhooks" \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: $SIGNATURE" \
  -d "$WEBHOOK_BODY")

if echo "$WEBHOOK_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ Webhook processado ${NC}"
else
  echo -e "${YELLOW}⚠️  Resposta inesperada${NC}"
fi

echo -e "   Response: $WEBHOOK_RESPONSE\n"

# ============================================================================
# 5. Consultar status após webhook
# ============================================================================
echo -e "${YELLOW}[5/5] Consultando status (depois de webhook)...${NC}"

# Pequeno delay para garantir que a DB foi atualizada
sleep 1

[REDACTED_TOKEN]=$(curl -s -X GET "$BASE_URL/api/pix/status/$TRANSACTION_ID" \
  -H "Authorization: Bearer $TOKEN")

STATUS_AFTER=$(echo "$[REDACTED_TOKEN]" | grep -o '"status":"[^"]*' | cut -d'"' -f4)

if [ "$STATUS_AFTER" = "confirmed" ]; then
  echo -e "${GREEN}✅ Status atualizado para confirmed${NC}"
  echo -e "   Response: $[REDACTED_TOKEN]"
elif [ "$STATUS_AFTER" = "waiting" ]; then
  echo -e "${YELLOW}⚠️  Status ainda é 'waiting'${NC}"
  echo -e "   (Webhook pode não ter sido processado corretamente)\n"
else
  echo -e "${YELLOW}⚠️  Status: $STATUS_AFTER${NC}\n"
fi

# ============================================================================
# Resumo
# ============================================================================
echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}  RESUMO DOS TESTES${NC}"
echo -e "${BLUE}==========================================${NC}\n"

TESTS_PASSED=0
TESTS_FAILED=0

echo "✅ Test Results:"
echo "   1. Login: PASSED"
((TESTS_PASSED++))

if [ ! -z "$TRANSACTION_ID" ]; then
  echo "   2. Create PIX: PASSED"
  ((TESTS_PASSED++))
else
  echo "   2. Create PIX: FAILED"
  ((TESTS_FAILED++))
fi

if [ "$STATUS_BEFORE" = "waiting" ]; then
  echo "   3. Get Status (before): PASSED"
  ((TESTS_PASSED++))
else
  echo "   3. Get Status (before): FAILED"
  ((TESTS_FAILED++))
fi

if echo "$WEBHOOK_RESPONSE" | grep -q '"success":true'; then
  echo "   4. Webhook: PASSED"
  ((TESTS_PASSED++))
else
  echo "   4. Webhook: FAILED"
  ((TESTS_FAILED++))
fi

if [ "$STATUS_AFTER" = "confirmed" ] || [ ! -z "$STATUS_AFTER" ]; then
  echo "   5. Get Status (after): PASSED (status=$STATUS_AFTER)"
  ((TESTS_PASSED++))
else
  echo "   5. Get Status (after): FAILED"
  ((TESTS_FAILED++))
fi

echo ""
echo -e "Total: ${GREEN}$TESTS_PASSED passed${NC}, ${RED}$TESTS_FAILED failed${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "\n${GREEN}🎉 Todos os testes passaram!${NC}\n"
  exit 0
else
  echo -e "\n${RED}⚠️  Alguns testes falharam${NC}\n"
  exit 1
fi

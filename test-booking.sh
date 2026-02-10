#!/bin/bash
set -e

TOKEN="[REDACTED_TOKEN].[REDACTED_TOKEN].[REDACTED_TOKEN]"

echo "1. Testing Booking Creation..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"userId":999,"serviceId":1,"date":"2026-02-20","time":"14:00","address":"Rua Teste, 123","phone":"5198888888","durationHours":2}' \
  --max-time 10)

echo "$RESPONSE"

# Check if booking was created
if echo "$RESPONSE" | grep -q '"id"'; then
  echo ""
  echo "✓ BOOKING CREATED SUCCESSFULLY!"
else
  echo ""
  echo "✗ BOOKING CREATION FAILED"
fi

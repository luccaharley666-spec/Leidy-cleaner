#!/bin/bash
# 🚀 SCRIPT: Corrigir console.log/error em todos os controllers

cd /workspaces/avan-o/backend

echo "🔄 Adicionando logger imports e substituindo console..."

# Lista de controllers com console.error
CONTROLLERS=(
  "src/controllers/BookingController.js"
  "src/controllers/AuthController.js"
  "src/controllers/AdminController.js"
  "src/controllers/NotificationController.js"
  "src/controllers/PhotosController.js"
  "src/controllers/PaymentIntegrationController.js"
  "src/controllers/PixPaymentController.js"
  "src/controllers/AdminDashboardController.js"
  "src/controllers/ReviewController.js"
  "src/controllers/StaffController.js"
  "src/controllers/NotificationsController.js"
  "src/middleware/webhookMiddleware.js"
  "src/middleware/csrf.js"
)

for file in "${CONTROLLERS[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✏️  Processando $file..."
    
    # 1. Verificar se já tem logger import
    if ! grep -q "const logger = require" "$file"; then
      # Adicionar logger import após os outros requires
      sed -i "1,/^const [a-zA-Z]/ s/^/const logger = require('..\/utils\/logger');\n/" "$file"
    fi
    
    # 2. Substituir console.error por logger.error (mantendo argumentos)
    sed -i 's/console\.error(/logger.error(/g' "$file"
    
    # 3. Substituir console.log por logger.info
    sed -i 's/console\.log(/logger.info(/g' "$file"
    
    # 4. Substituir console.warn por logger.warn
    sed -i 's/console\.warn(/logger.warn(/g' "$file"
    
    echo "    ✅ Processada"
  fi
done

echo "✅ Correção completa!"

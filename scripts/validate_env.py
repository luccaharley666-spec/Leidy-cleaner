# Validação automática de variáveis de ambiente obrigatórias

import os
import sys

# Liste aqui as variáveis obrigatórias
REQUIRED_VARS = [
    'NODE_ENV', 'PORT', 'BASE_URL', 'DATABASE_URL', 'JWT_SECRET',
    'NEXT_PUBLIC_API_URL', 'STRIPE_SECRET_KEY', 'MERCADOPAGO_TOKEN',
    'WEBHOOK_SECRET_PIX', 'REDIS_URL', 'SMTP_HOST', 'SMTP_PORT',
    'SMTP_USER', 'SMTP_PASS', 'DOMAIN'
]

missing = [var for var in REQUIRED_VARS if not os.getenv(var)]

if missing:
    print(f"[ERRO] Variáveis de ambiente faltando: {', '.join(missing)}")
    sys.exit(1)
else:
    print("[OK] Todas as variáveis obrigatórias estão presentes.")

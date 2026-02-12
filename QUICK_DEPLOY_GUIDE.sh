#!/bin/bash

# 🎫 GUIA RÁPIDO - Deploy Production (cleanerleidy.com.br)
# Tudo está pronto. Apenas siga os passos.

cat << 'EOF'

╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║             🚀 DEPLOY PRONTO - cleanerleidy.com.br                        ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝

✅ O QUE JÁ ESTÁ FEITO:

  ✓ Secrets gerados (JWT, Session, PIX Webhook)
  ✓ Senhas do Database gerado (PostgreSQL)
  ✓ Senhas do Redis gerado
  ✓ NGINX com HTTPS + Let's Encrypt
  ✓ Docker environment pronto
  ✓ Deploy script automático

═══════════════════════════════════════════════════════════════════════════════

⏭️  O QUE VOCÊ PRECISA FAZER:

PASSO 1: Editar backend/.env.production
─────────────────────────────────────────

Abra o arquivo:
  nano backend/.env.production

Procure por "CHANGE_ME" e substitua:

  ❌ STRIPE_SECRET_KEY=<SET_ME_STRIPE_SECRET>
  ✅ STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_SECRET_KEY

  ❌ STRIPE_PUBLIC_KEY=<SET_ME_STRIPE_PUBLIC>
  ✅ STRIPE_PUBLIC_KEY=pk_live_YOUR_STRIPE_PUBLIC_KEY

  ❌ STRIPE_WEBHOOK_SECRET=<SET_ME_STRIPE_WEBHOOK>
  ✅ STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

Opcional (se quiser email):
  EMAIL_USER=seu-email@gmail.com
  EMAIL_PASS=sua-app-password (gerar em https://myaccount.google.com/apppasswords)

PASSO 2: Commit das mudanças
─────────────────────────────

git add -A
git commit -m "🚀 Production ready with DB passwords"
git push origin main

PASSO 3: Deploy no Servidor
─────────────────────────────

SSH no seu servidor:
  ssh root@SEU_IP_SERVIDOR

Clone e faça deploy:
  cd /opt
  git clone https://github.com/leci45538-hue/acabamos.git
  cd acabamos
  chmod +x deploy-production.sh
  ./deploy-production.sh

Aguarde 3-5 minutos...

PRONTO! 🎉

  https://cleanerleidy.com.br

═══════════════════════════════════════════════════════════════════════════════

🔐 CREDENCIAIS GERADAS (Seguras em docker-compose.production.yml):

  Database Password:  vrlOm+ataIBbA3yvhdMvRo04Z8+0EyyTJ1d45eooPBQ=
  Redis Password:     Ov2iR99MKCW/hWzDlGUKBf5GxPMh1ejvWj5wEj3npIc=

═══════════════════════════════════════════════════════════════════════════════

💡 DEPOIS DO DEPLOY:

1. Teste o site: https://cleanerleidy.com.br
2. Configure webhooks no Stripe:
   Dashboard → Developers → Webhooks
   URL: https://cleanerleidy.com.br/api/webhooks/stripe

3. Monitore os logs:
   docker logs -f cleanerleidy-backend

4. Faça backup do banco:
   docker exec cleanerleidy-db pg_dump -U cleanerleidy cleanerleidy > backup.sql

═══════════════════════════════════════════════════════════════════════════════

✨ Tudo pronto! Qualquer dúvida, leia DEPLOYMENT_READY_COMPLETE.md

EOF

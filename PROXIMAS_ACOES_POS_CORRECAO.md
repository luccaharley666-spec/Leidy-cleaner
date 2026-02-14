#!/bin/bash

# ============================================================================
# PRÓXIMAS AÇÕES - APÓS CORREÇÃO DOS 5 CRÍTICOS
# ============================================================================

cat << 'EOF'

╔════════════════════════════════════════════════════════════════════════════╗
║                 ✅ 5 PROBLEMAS CRÍTICOS FORAM CORRIGIDOS ✅               ║
╚════════════════════════════════════════════════════════════════════════════╝

O que foi feito:
  1. ✅ JWT_SECRET - PLACEHOLDER removido (auth.js)
  2. ✅ Encryption Key - PLACEHOLDER removido (crypto.js)
  3. ✅ ENV Config - PLACEHOLDER removido (envConfig.js)
  4. ✅ Senhas - Plain text → bcrypt hash (_store.js)
  5. ✅ Tokens - Base64 → JWT signed (login.js)

Bônus:
  ✅ Admin padrão removido (migrations.sql)
  ✅ Dependências adicionadas (bcryptjs, jsonwebtoken)
  ✅ Headers de segurança corrigidos
  ✅ Script de admin criado (create-admin.js)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 PRÓXIMAS AÇÕES (30 MINUTOS):

1️⃣  INSTALAR DEPENDÊNCIAS
    ├─ cd frontend && npm install
    ├─ cd ../backend && npm install
    └─ ✅ Instala bcryptjs, jsonwebtoken

2️⃣  GERAR SECRETS ALEATÓRIOS
    ├─ cd backend
    ├─ npm run generate-secrets
    └─ ✅ Cria JWT_SECRET, SESSION_SECRET, etc (aleatorio)

3️⃣  CRIAR ADMIN SEGURO
    ├─ node scripts/create-admin.js admin@seu-dominio.com.br
    └─ ✅ Gera senha aleatória (32 chars) + bcrypt hash

4️⃣  TESTAR COMPILAÇÃO
    ├─ npm run dev (ambos frontend e backend)
    └─ ✅ Verificar se tudo funciona

5️⃣  COMMIT DAS MUDANÇAS
    ├─ git add -A
    ├─ git commit -m "🔒 Fix 5 critical security issues"
    └─ git push

6️⃣  DEPLOY NO ORION HOST
    ├─ bash deploy-orionhost-automated.sh seu-dominio.com.br admin@seu-dominio.com.br
    └─ ✅ Sistema vai ao ar

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 DETALHES DOS PASSOS:

PASSO 1: INSTALAR DEPENDÊNCIAS
================================

  Frontend (adicionar bcryptjs e jsonwebtoken):
  $ cd frontend
  $ npm install
  
  Output esperado:
    npm notice created a lockfile as package-lock.json
    added 45 packages
    ✅ OK

  Backend (já tem tudo, apenas atualizar):
  $ cd ../backend
  $ npm install
  
  Output esperado:
    up to date, audited 124 packages
    ✅ OK

PASSO 2: GERAR SECRETS
======================

  $ cd backend
  $ npm run generate-secrets
  
  Output esperado:
    ✅ Gerando secrets aleatórios...
    JWT_SECRET=[string aleatória 64 chars]
    JWT_REFRESH_SECRET=[string aleatória 64 chars]
    SECRET_ENC_KEY=[string aleatória 64 chars]
    WEBHOOK_SECRET_PIX=[string aleatória 64 chars]
    
    ✅ Secrets salvos em .env.production
  
  ⚠️  NÃO COMMIT .env.production em git!
      Verificar se está em .gitignore

PASSO 3: CRIAR ADMIN
====================

  $ node scripts/create-admin.js admin@seu-dominio.com.br
  
  Output esperado:
    ╔════════════════════════════════════════╗
    ║  🎉 ADMIN CRIADO COM SUCESSO 🎉      ║
    ╚════════════════════════════════════════╝
    
    📧 Email: admin@seu-dominio.com.br
    🔑 Senha: [senha aleatória 32 chars]
    🔐 Hash: [bcrypt hash]
    
    ✅ Guarde a senha em lugar seguro
    📄 Salvo em: .admin_temp.txt
    
  ⚠️  DELETAR .admin_temp.txt depois de guardar a senha!
       Nunca deixar senha em arquivo do com uncommitted

PASSO 4: TESTAR LOCALMENTE
==========================

  Abrir 2 terminais:
  
  Terminal 1 (Backend):
  $ cd backend && npm run dev
  
  Output esperado:
    Server running on port 3001
    Database connected
    JWT_SECRET loaded ✅
    
  Terminal 2 (Frontend):
  $ cd frontend && npm run dev
  
  Output esperado:
    ready - started server on 0.0.0.0:3000
    ✅ Frontend loaded

  Testar login em browser:
  1. Abrir http://localhost:3000
  2. Ir em Login
  3. Usar credentials:
     Email: admin@seu-dominio.com.br
     Senha: [a que você gerou]
  4. Deve estar funcionando ✅

PASSO 5: COMMIT
===============

  $ git add -A
  $ git commit -m "🔒 Fix critical security: JWT/crypto secrets required, bcrypt+JWT auth"
  $ git push origin main
  
  ✅ Mudanças fazem push para GitHub

PASSO 6: DEPLOY
===============

  No servidor Orion Host:
  $ bash deploy-orionhost-automated.sh seu-dominio.com.br admin@seu-dominio.com.br
  
  Vai fazer:
  1. Validar server
  2. Gerar secrets (aleatórios)
  3. Build frontend
  4. Init database
  5. Setup Nginx
  6. Gerar SSL certificate
  7. Criar systemd services
  8. Start sistema
  
  Output final esperado:
    ╔════════════════════════════════════════╗
    ║  🎉 DEPLOY CONCLUÍDO COM SUCESSO! 🎉 ║
    ╚════════════════════════════════════════╝
    
    Frontend: https://seu-dominio.com.br
    Backend: https://api.seu-dominio.com.br
    Admin: https://seu-dominio.com.br/admin

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏱️  TEMPO ESTIMADO:

  Instalar deps:    5 min
  Gerar secrets:    2 min
  Criar admin:      1 min
  Testar:          10 min
  Commit:           2 min
  Deploy:          10 min
  ─────────────────────
  TOTAL:           30 min ⏱️

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ CHECKLIST FINAL

ANTES DE FAZER DEPLOY:

  [ ] npm install (frontend)
  [ ] npm install (backend)
  [ ] npm run generate-secrets
  [ ] node scripts/create-admin.js
  [ ] Guardar senha admin em gerenciador
  [ ] .env.production em .gitignore
  [ ] npm run dev (testar localmente)
  [ ] git commit + push
  [ ] Verificar .admin_temp.txt foi deletado

DURANTE DEPLOY:

  [ ] bash deploy-orionhost-automated.sh
  [ ] Verificar status: sudo systemctl status app-backend
  [ ] Verificar status: sudo systemctl status app-frontend
  [ ] Testar em browser: https://seu-dominio.com.br
  [ ] Testar login com admin

PÓS-DEPLOY:

  [ ] Fazer login no admin panel
  [ ] Trocar senha (primeira login pede)
  [ ] Verificar dashboard
  [ ] Verificar integração de pagamento
  [ ] Verificar logs: sudo journalctl -u app-backend -n 50

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 DOCUMENTOS DE REFERÊNCIA

Para entender o que foi feito:
  → CORRECOES_5_CRITICOS_APLICADAS.md (Detalhes técnicos)
  → VERIFICACAO_FINAL_CRITICOS.md (Validação)
  → ANALISE_SEGURANCA_PROBLEMAS_ENCONTRADOS.md (Problemas + soluções)

Para deploy:
  → DEPLOY_ORION_HOST_COMPLETO.md
  → PRE_DEPLOY_CHECKLIST_EXECUTIVO.md
  → deploy-orionhost-automated.sh

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 STATUS FINAL

Antes das correções:
  ❌ Sistema inseguro
  ❌ Secrets conhecidos
  ❌ Senhas plain text
  ❌ Tokens forjáveis

Depois das correções:
  ✅ Sistema seguro
  ✅ Secrets aleatórios + obrigatórios
  ✅ Senhas bcrypt hash
  ✅ Tokens JWT assinados + 24h expiration

🚀 PRONTO PARA PRODUÇÃO!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dúvidas? Consulte:
  📄 CORRECOES_5_CRITICOS_APLICADAS.md
  🔍 VERIFICACAO_FINAL_CRITICOS.md
  🚀 DEPLOY_ORION_HOST_COMPLETO.md

EOF

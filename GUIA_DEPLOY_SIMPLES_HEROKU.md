# 🎯 PASSO A PASSO - DEPLOY EM 3 HORAS (Para iniciante)

> **Guia super simples, sem jargão técnico**

---

## VERSÃO MAIS FÁCIL: HEROKU (Recomendado para iniciante)

### ⏱️ TEMPO TOTAL: ~2 horas

---

## PASSO 1: Preparar Conta (15 min)

### 1.1 Criar conta no Heroku (Gratuito)

```
1. Abra: www.heroku.com
2. Click "Sign Up" (top direita)
3. Preencha:
   - Email: seu@email.com
   - Password: força forte
   - First name: Seu
   - Last name: Nome
4. Click "Create free account"
5. Verifique email (click link confirmação)
```

### 1.2 Instalar Heroku CLI (Ferramenta no computador)

**Mac:**
```bash
brew install heroku
```

**Windows:**
- Download: https://cli-assets.heroku.com/heroku-x64.exe
- Clique e instale

**Linux:**
```bash
curl https://cli-assets.heroku.com/install-ubuntu.sh | sh
```

### 1.3 Verificar instalação
```bash
heroku --version
# Esperado: heroku/7.x.x (versão)
```

### Se tudo OK → Continue próximo

---

## PASSO 2: Preparar Código (20 min)

### 2.1 Abrir a pasta do projeto

```bash
cd /workspaces/acabamos
```

### 2.2 Verificar se git funciona
```bash
git status
# Esperado: mensagem sobre branch/status
```

### 2.3 Se houver arquivos não committed
```bash
git add .
git commit -m "Preparando para deploy"
```

### Se tudo OK → Continue

---

## PASSO 3: Criar Apps no Heroku (10 min)

### 3.1 Login no Heroku

```bash
heroku login
```

Uma janela abre, clique "Log in". Vai voltar pro terminal.

### 3.2 Criar app Backend

```bash
heroku create seu-app-backend-limpeza
```

Esperado:
```
Creating seu-app-backend-limpeza... done
https://seu-app-backend-limpeza.herokuapp.com/
```

### 3.3 Criar app Frontend

```bash
heroku create seu-app-frontend-limpeza
```

Esperado similar.

### Se tudo OK → Continue

---

## PASSO 4: Banco de Dados (10 min)

### 4.1 Adicionar PostgreSQL ao Backend

```bash
heroku addons:create heroku-postgresql:standard-0 -a seu-app-backend-limpeza
```

Esperado:
```
Creating heroku-postgresql:standard-0 on seu-app-backend-limpeza... done
```

### 4.2 Verificar conexão

```bash
heroku config -a seu-app-backend-limpeza
# Vai listar variáveis, incluindo DATABASE_URL
```

### Se tem DATABASE_URL → OK

---

## PASSO 5: Variáveis de Ambiente (20 min)

### 5.1 Abrir arquivo template

```bash
cat .env.production.example
```

Você verá algo como:
```
STRIPE_SECRET_KEY=sk_live_xxxxx
PIX_WEBHOOK_SECRET=xxx
JWT_SECRET=xxx
etc...
```

### 5.2 Preencher com valores REAIS

Para cada variável importante:

```bash
# Stripe (cartão)
heroku config:set STRIPE_SECRET_KEY=sk_live_seu_valor_real -a seu-app-backend-limpeza

# JWT (autenticação)
heroku config:set JWT_SECRET=seu-secreto-super-aleatorio-com-64-caracteres -a seu-app-backend-limpeza

# Email (nodemailer)
heroku config:set EMAIL_USER=seu@email.com -a seu-app-backend-limpeza
heroku config:set EMAIL_PASSWORD=sua-senha-app -a seu-app-backend-limpeza

# Node (ambiente)
heroku config:set NODE_ENV=production -a seu-app-backend-limpeza
```

**Importante:** Use valores REAIS (suas chaves Stripe, etc). Se não tem, teste com valores de teste (comece com Stripe test depois).

### 5.3 Verificar tudo

```bash
heroku config -a seu-app-backend-limpeza
```

Você deve ver todas as variáveis listadas.

### Se tudo OK → Continue

---

## PASSO 6: Deploy Backend (30 min)

### 6.1 Adicionar remoto Heroku no Git

```bash
heroku git:remote -a seu-app-backend-limpeza -r heroku-backend
heroku git:remote -a seu-app-frontend-limpeza -r heroku-frontend
```

### 6.2 Deploy Backend

```bash
git push heroku-backend main:main
```

Você vai ver:
```
Counting objects: ...
Compressing objects: ...
Writing objects: ...
```

**Espere terminar** (pode levar 5-10 min)

Esperado final:
```
remote: -----> Launching...
remote:        Released v1
remote:        https://seu-app-backend-limpeza.herokuapp.com/ deployed
```

### 6.3 Rodar migrações do BD

```bash
heroku run npm run migrate -a seu-app-backend-limpeza
```

Esperado:
```
Running npm run migrate on seu-app-backend-limpeza... up, run.xxxx
(migrations rodando...)
Done
```

### 6.4 Verificar se backend está LIVE

```bash
curl https://seu-app-backend-limpeza.herokuapp.com/api/health
```

Esperado:
```
{"status":"ok"}
```

Se vir isso → Backend está vivo! ✅

### Se tudo OK → Continue

---

## PASSO 7: Deploy Frontend (30 min)

### 7.1 Configurar variável de ambiente Frontend

No .env da frontend, certifique que tem:
```
VITE_API_URL=https://seu-app-backend-limpeza.herokuapp.com
```

### 7.2 Deploy Frontend

```bash
git push heroku-frontend main:main
```

Espere terminar (mesma coisa anterior)

Esperado:
```
remote:        https://seu-app-frontend-limpeza.herokuapp.com/ deployed
```

### 7.3 Verificar Frontend

Abra no browser:
```
https://seu-app-frontend-limpeza.herokuapp.com
```

Esperado: Página da aplicação abre! ✅

### Se tudo OK → Sucesso!

---

## PASSO 8: Domínio Customizado (Opcional, 10 min)

### 8.1 Se quiser seu-dominio.com.br

```bash
# Comprar domínio em: namecheap.com, godaddy.com, etc

# No Heroku:
heroku domains:add seu-dominio.com.br -a seu-app-backend-limpeza
heroku domains:add seu-dominio.com.br -a seu-app-frontend-limpeza

# Vai dar um valor como: seu-app-backend-limpeza.herokuapp.com

# Na sua hospedagem domínio, configure:
# - CNAME para backend: seu-app-backend-limpeza.herokuapp.com
# - CNAME para frontend: seu-app-frontend-limpeza.herokuapp.com
```

**Espere 24-48h para DNS propagar**

### Depois que propagar:

```
https://seu-dominio.com (Frontend)
https://api.seu-dominio.com (Backend)
```

---

## CHECKLIST FINAL

```
[ ] Backend rodando?
    └─ curl https://seu-app-backend-limpeza.herokuapp.com/api/health

[ ] Frontend rodando?
    └─ Abra no browser, carrega OK?

[ ] Banco de dados criado?
    └─ Dados podem ser salvos?

[ ] Tudo conectado?
    └─ Tente fazer login no app?

[ ] Email funciona?
    └─ Recebeu email confirmação?

SE TUDO VERDE ✅
└─ WEBSITE ESTÁ LIVE!
```

---

## 🎉 PRONTO! SITE LIVE!

Seu app agora está disponível em:
- Frontend: `https://seu-app-frontend-limpeza.herokuapp.com`
- Backend: `https://seu-app-backend-limpeza.herokuapp.com`

### Próximos passos:

1. **Convide 10 amigos para testar** (beta)
2. **Colete feedback** (o que não funciona?)
3. **Corrija bugs urgentes** (hoje mesmo)
4. **Reclame com mais usuários** (semana próxima)
5. **Scale up** (próximo mês)

---

## 🆘 PROBLEMAS COMUNS

### Erro: "Cannot find module 'express'"

**Solução:**
```bash
heroku run npm install -a seu-app-backend-limpeza
```

### Erro: ".env variables are undefined"

**Solução:**
- Verifique: `heroku config -a seu-app-backend-limpeza`
- Se faltar variável: `heroku config:set MISSING_VAR=value`

### Erro: "Application error / H10"

**Solução:**
```bash
heroku logs --tail -a seu-app-backend-limpeza
# Vai mostrar qual é o erro real
```

### Erro: "Cannot connect to database"

**Solução:**
```bash
heroku run npm run migrate -a seu-app-backend-limpeza
# Re-rodar migrações
```

### Frontend não conecta no Backend

**Solução:**
- Verificar: `echo $VITE_API_URL`
- Deve ser: `https://seu-app-backend-limpeza.herokuapp.com`
- Se errado: Editar `.env` no frontend e fazer `git push heroku-frontend main`

---

## RESUMO: O QUE VOCÊ FEZ

```
✅ Criou conta Heroku
✅ Instalou Heroku CLI
✅ Preparou código (git)
✅ Criou 2 apps (backend + frontend)
✅ Adicionou banco de dados
✅ Configurou variáveis
✅ Fez deploy backend
✅ Fez deploy frontend
✅ Website LIVE! 🎉

TEMPO TOTAL: 2 horas
CUSTO: Gratuito (até 5 apps)
```

---

**Pronto! Seu sistema de limpeza está no ar! 🚀**


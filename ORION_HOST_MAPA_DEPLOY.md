# 🗺️ MAPA DE DEPLOY - COMO TUDO SE CONECTA

**Data:** 14 de Fevereiro de 2026  
**Status:** Guia visual de fluxo  

---

## 📊 ARQUITETURA DO DEPLOY

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                          SEU COMPUTADOR                                   ║
║                                                                           ║
║  1. Baixa o repositório                                                  ║
║     └→ ./deploy-orionhost-automated.sh                                   ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
                                    ↓
                           Via SCP/Git Clone
                                    ↓
╔═══════════════════════════════════════════════════════════════════════════╗
║                         ORION HOST - SERVIDOR                             ║
║                                                                           ║
║  /home/seu_usuario/projetos/meu-site/                                    ║
║  ├── backend/                       ← Node.js API (porta 3000)           ║
║  │   ├── src/                                                             ║
║  │   ├── package.json                                                    ║
║  │   └── npm install / npm start                                         ║
║  │                                                                       ║
║  ├── frontend/                      ← Next.js SPA (porta 3001)           ║
║  │   ├── src/                                                             ║
║  │   ├── package.json                                                    ║
║  │   ├── npm install / npm build / npm start                             ║
║  │   └── .next/ (gerado pelo build)                                      ║
║  │                                                                       ║
║  ├── backend_data/                                                        ║
║  │   └── database.sqlite             ← Banco de dados                    ║
║  │                                                                       ║
║  ├── .env.production                 ← Variáveis de ambiente             ║
║  │                                                                       ║
║  └── deploy-orionhost-automated.sh   ← Script que orquestra tudo         ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
                                    ↓
                        Via Nginx Reverso Proxy
                                    ↓
╔═══════════════════════════════════════════════════════════════════════════╗
║                         NGINX (portas 80/443)                             ║
║                                                                           ║
║  /etc/nginx/sites-available/seu-dominio.com.br                           ║
║  ├─ HTTP 80         → HTTPS 443 (redireciona)                            ║
║  │                                                                       ║
║  ├─ HTTPS 443 (seu-dominio.com.br)                                       ║
║  │  └→ :3001 (Frontend Next.js)                                          ║
║  │                                                                       ║
║  └─ HTTPS 443 (api.seu-dominio.com.br)                                   ║
║     └→ :3000 (Backend Express API)                                       ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
                                    ↓
                   SSL/TLS (Let's Encrypt + Certbot)
                                    ↓
╔═══════════════════════════════════════════════════════════════════════════╗
║                     CERTIFICADOS SSL AUTOMÁTICOS                          ║
║                                                                           ║
║  /etc/letsencrypt/live/seu-dominio.com.br/                               ║
║  ├── fullchain.pem  (certificado completo)                               ║
║  ├── privkey.pem    (chave privada)                                      ║
║  └── Renova automaticamente a cada 90 dias (certbot.timer)               ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
                                    ↓
                        Systemd Services (Linux)
                                    ↓
╔═══════════════════════════════════════════════════════════════════════════╗
║                    SERVICES QUE RODAM NO BOOT                             ║
║                                                                           ║
║  /etc/systemd/system/seu-dominio-backend.service                         ║
║  └─ Inicia automaticamente → npm start em backend/                       ║
║                                                                           ║
║  /etc/systemd/system/seu-dominio-frontend.service                        ║
║  └─ Inicia automaticamente → npm start em frontend/                      ║
║                                                                           ║
║  Gerencie com:                                                            ║
║  • systemctl start/stop/restart seu-dominio-*                            ║
║  • systemctl status seu-dominio-*                                        ║
║  • journalctl -u seu-dominio-* -f (logs)                                 ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 🔄 FLUXO DE REQUISIÇÃO DO USUÁRIO

```
1️⃣  Usuário acessa https://seu-dominio.com.br
                          ↓
2️⃣  Navegador conecta ao Nginx (porta 443 HTTPS)
                          ↓
3️⃣  Nginx valida certificado SSL (Let's Encrypt)
                          ↓
4️⃣  Nginx roteia para :3001 (Frontend Next.js)
                          ↓
5️⃣  Frontend retorna página HTML + JavaScript
                          ↓
6️⃣  JavaScript carrega no navegador
                          ↓
7️⃣  Scripts fazem chamadas AJAX para:
    https://api.seu-dominio.com.br/api/...
                          ↓
8️⃣  Nginx roteia para :3000 (Backend Express)
                          ↓
9️⃣  Backend processa requisição
    ├─ Valida JWT token
    ├─ Consulta banco SQLite
    ├─ Retorna JSON
    └─ 200 OK
                          ↓
🔟  Frontend recebe dados e renderiza UI
                          ↓
✅  Usuário vê página atualizada
```

---

## 📁 ESTRUTURA DE ARQUIVOS NO DEPLOY

```
/home/seu_usuario/
├── projetos/
│   └── meu-site/                    ← Seu projeto clonado
│       ├── backend/
│       │   ├── src/
│       │   │   ├── config/
│       │   │   ├── controllers/
│       │   │   ├── db/
│       │   │   │   ├── migrations.sql
│       │   │   │   └── runMigrations.js
│       │   │   ├── middleware/
│       │   │   ├── routes/
│       │   │   ├── services/
│       │   │   │   ├── PaymentService.js
│       │   │   │   ├── EmailService.js
│       │   │   │   └── PixService.js
│       │   │   └── index.js          ← Express server init
│       │   ├── package.json
│       │   └── node_modules/         ← npm install aqui
│       │
│       ├── frontend/
│       │   ├── src/
│       │   │   ├── pages/            ← 24+ páginas
│       │   │   ├── components/       ← 30+ componentes
│       │   │   ├── styles/
│       │   │   ├── services/
│       │   │   └── utils/
│       │   ├── public/               ← Assets estáticos
│       │   ├── .next/                ← Build output (gerado)
│       │   ├── next.config.js
│       │   ├── package.json
│       │   └── node_modules/         ← npm install aqui
│       │
│       ├── backend_data/
│       │   └── database.sqlite       ← Banco SQLite
│       │
│       ├── .env.production           ← Variáveis de ambiente
│       ├── .env.orionhost            ← Template original
│       ├── deploy-orionhost-automated.sh
│       ├── package.json              ← Root (opcional)
│       └── README.md
│
```

---

## ⚙️ COMO O SCRIPT AUTOMÁTICO FAZ TUDO

```
bash deploy-orionhost-automated.sh seu-dominio.com.br seu-email@seu-dominio.com.br

1. VALIDAÇÃO
   ├─ Verifica estrutura: backend/, frontend/, package.json
   ├─ Verifica comandos: node, npm, git, sqlite3
   └─ Valida argumentos

2. GERAR SECRETS
   ├─ JWT_SECRET = 32 bytes aleatórios
   ├─ SESSION_SECRET = 32 bytes aleatórios
   └─ WEBHOOK_SECRET_PIX = 32 bytes aleatórios

3. PREPARAR .env
   ├─ Copia .env.orionhost → .env.production
   ├─ Substitui domínios
   ├─ Insere secrets gerados
   └─ chmod 600 (protege arquivo)

4. INSTALAR DEPENDÊNCIAS
   ├─ cd backend && npm install
   ├─ cd frontend && npm install
   └─ Aguarda completar

5. BUILD FRONTEND
   ├─ cd frontend
   ├─ npm run build
   └─ Gera pasta .next/

6. CRIAR BANCO DE DADOS
   ├─ mkdir backend_data/
   ├─ sqlite3 database.sqlite < migrations.sql
   └─ Todas as tabelas prontas

7. CRIAR SYSTEMD SERVICES
   ├─ /etc/systemd/system/seu-dominio-backend.service
   ├─ /etc/systemd/system/seu-dominio-frontend.service
   └─ systemctl daemon-reload

8. CONFIGURAR NGINX
   ├─ /etc/nginx/sites-available/seu-dominio.com.br
   ├─ Ativa site
   ├─ nginx -t (testa sintaxe)
   └─ systemctl reload nginx

9. GERAR SSL
   ├─ certbot certonly --nginx
   ├─ Certificado em /etc/letsencrypt/live/
   └─ Habilita auto-renovação

10. RESUMO FINAL
    ├─ Mostra tudo pronto
    ├─ Próximos comandos
    └─ Documentação a consultar
```

---

## 🔐 FLUXO DE AUTENTICAÇÃO

```
1. Usuário submete login (email + senha)
   └→ POST https://api.seu-dominio.com.br/api/auth/login

2. Backend (Express) recebe
   ├─ Valida email existe no database
   ├─ Compara senha com bcrypt hash
   └─ Gera JWT token

3. Frontend armazena token
   └→ localStorage ou sessionStorage

4. Próximas requisições
   └→ Header: Authorization: Bearer {JWT_TOKEN}

5. Backend valida token
   ├─ Decodifica JWT
   ├─ Valida assinatura
   └─ Permite/nega acesso

6. Se token expirou
   └→ Frontend redireciona para /login
```

---

## 📊 COMUNICAÇÃO FRONTEND ↔ BACKEND

```
┌─────────────────────────────────────────────────────────┐
│                    NAVEGADOR DO USUÁRIO                 │
│                                                        │
│  Frontend (React/Next.js) em https://seu-dominio...   │
│                                                        │
│  1. Usuário clica em "Novo Agendamento"               │
│  2. Component carrega form                             │
│  3. Usuário preenche dados                             │
│  4. Click em "Agendar"                                 │
│                                                        │
│  5. JavaScript envia:                                  │
│     POST /api/bookings/create                          │
│     {                                                  │
│       service_id: 123,                                 │
│       date: "2026-02-20",                              │
│       time: "14:00",                                   │
│       ...                                              │
│     }                                                  │
└─────────────────────────────────────────────────────────┘
                          ↓ HTTPS
┌─────────────────────────────────────────────────────────┐
│                      NGINX REVERSO                      │
│                                                        │
│  Recebe em: https://api.seu-dominio.com.br            │
│  Roteia para: http://localhost:3000                    │
│                                                        │
│  (SSL/TLS termina aqui - decripta a requisição)       │
└─────────────────────────────────────────────────────────┘
                          ↓ HTTP (local)
┌─────────────────────────────────────────────────────────┐
│                   BACKEND (EXPRESS)                     │
│                   Porta 3000 localhost                  │
│                                                        │
│  1. Recebe requisição POST /api/bookings/create       │
│  2. Middleware validação JWT                           │
│  3. Controller: createBooking()                         │
│  4. Service: validar dados                             │
│  5. Database: INSERT INTO bookings                      │
│  6. Retorna: 200 OK + booking_id                        │
│                                                        │
│  Response:                                              │
│  {                                                      │
│    success: true,                                       │
│    booking_id: 5678,                                    │
│    message: "Agendamento criado"                        │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
                          ↓ HTTPS
┌─────────────────────────────────────────────────────────┐
│                      NGINX REVERSO                      │
│                                                        │
│  Recebe resposta: 200 OK + JSON                        │
│  Encripta com SSL/TLS                                  │
│  Retorna ao frontend                                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   NAVEGADOR DO USUÁRIO                  │
│                                                        │
│  6. Frontend recebe resposta JSON                       │
│  7. Valida sucesso                                     │
│  8. Exibe mensagem: "Agendamento confirmado!"          │
│  9. Atualiza lista de agendamentos                      │
│ 10. Redireciona para dashboard                          │
│                                                        │
│  ✅ Usuário vê tudo funcionando em tempo real          │
└─────────────────────────────────────────────────────────┘
```

---

## 🗺️ MAPA VISUAL COMPLETO

```
                         INTERNET
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
    Port 80 (HTTP)                         Port 443 (HTTPS)
        ↓                                       ↓
   Redireciona ─────────────────────────────→ Nginx
   para 443                                     ↓
                              Valida SSL/TLS Certificate
                             (Let's Encrypt/Certbot)
                                      ↓
                    ┌───────────────────┴───────────────────┐
                    ↓                                       ↓
          seu-dominio.com.br                  api.seu-dominio.com.br
         (Frontend traffic)                    (Backend traffic)
                    ↓                                       ↓
                localhost:3001                         localhost:3000
               (Next.js Server)                      (Express Server)
                    ↓                                       ↓
          Frontend render                   Backend API
          (24 páginas)                       (11+ endpoints)
          (React components)                 (Lógica negócio)
                    ↓                                       ↓
          Usuário vê UI                    Processa dados
          Interage com app                 Consulta BD
                    ↓                                       ↓
                    ←───────────────────────────────────────┘
                    
                    Comunicação bidirecional
                    via REST API (JSON)
```

---

## 🚀 SEQUÊNCIA DE INICIALIZAÇÃO (Boot)

```
1. Servidor Orion Host liga
   ↓

2. Systemd carrega services
   ├─ seu-dominio-backend.service
   ├─ seu-dominio-frontend.service
   └─ Manda iniciar

3. Script backend inicia
   ├─ Lê .env.production
   ├─ Conecta ao banco SQLite
   ├─ Inicia Express server
   └─ Ouve porta 3000

4. Script frontend inicia
   ├─ Lê .env.production
   ├─ Inicia Next.js server
   └─ Ouve porta 3001

5. Nginx já está rodando
   ├─ Valida certificado SSL
   ├─ Aguarda requisições
   └─ Roteia para :3000 e :3001

6. Certbot timer aguardando
   ├─ A cada 90 dias
   └─ Renova certificado automaticamente

✅ SISTEMA 100% PRONTO PARA RECEBER USUÁRIOS
```

---

## 📞 COMO GERENCIAR DEPOIS

```
Ver status de tudo:
  sudo systemctl status seu-dominio-backend.service
  sudo systemctl status seu-dominio-frontend.service
  sudo systemctl status nginx
  sudo systemctl status certbot.timer

Parar tudo:
  sudo systemctl stop seu-dominio-backend.service
  sudo systemctl stop seu-dominio-frontend.service
  sudo systemctl stop nginx

Reiniciar tudo:
  sudo systemctl restart seu-dominio-backend.service
  sudo systemctl restart seu-dominio-frontend.service
  sudo nginx -t && sudo systemctl reload nginx

Ver logs em tempo real:
  sudo journalctl -u seu-dominio-backend.service -f
  sudo journalctl -u seu-dominio-frontend.service -f
  sudo journalctl -u nginx -f

Limpeza:
  # Remover certificado (se for mudar domínio)
  sudo certbot delete --cert-name seu-dominio.com.br
  
  # Parar de auto-renovar
  sudo systemctl disable certbot.timer
  sudo systemctl stop certbot.timer
```

---

## ✅ VALIDAÇÃO PASSO-A-PASSO

```
1. SSH conectado? 
   → ssh seu_usuario@seu-dominio.com.br ✅

2. Node.js instalado?
   → node -v (se não: nvm install 20) ✅

3. Repositório clonado?
   → ls ~/projetos/meu-site/backend ✅

4. .env.production criado?
   → cat .env.production | head ✅

5. Backend instalado?
   → cd backend && npm list express ✅

6. Frontend instalado?
   → cd frontend && npm list next ✅

7. Database criado?
   → sqlite3 backend_data/database.sqlite ".tables" ✅

8. Build frontend pronto?
   → ls frontend/.next/server ✅

9. SSL certificate gerado?
   → sudo certbot certificates ✅

10. Nginx configurado?
    → sudo nginx -t ✅

11. Services criados?
    → sudo systemctl list-unit-files | grep seu-dominio ✅

12. Tudo rodando?
    → curl -I https://seu-dominio.com.br ✅
    → curl https://api.seu-dominio.com.br/api/health ✅

✅ TUDO VALIDADO - SITE AO VIVO!
```

---

**Status:** ✅ Mapa completo de deploy  
**Última atualização:** 14 de Fevereiro de 2026  
**Versão:** 1.0  

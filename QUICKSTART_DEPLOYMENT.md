# 🚀 Quick Start - Deployment Limpeza Pro

Guia rápido de 5 minutos para colocar a aplicação rodando.

---

## ⚡ 5-Minute Setup (Docker)

### Pré-requisitos Mínimos
- Docker & Docker Compose instalados
- Git
- Porta 3000, 3001, 6379 disponíveis

### Passo 1: Clonar & Configurar

```bash
git clone https://github.com/seu-usuario/limpeza-pro.git
cd limpeza-pro

# Copiar .env exemplo
cp .env.example .env

# Gerar secrets (Linux/Mac)
sed -i 's/JWT_SECRET=.*/JWT_SECRET='$(openssl rand -base64 32)'/' .env
sed -i 's/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET='$(openssl rand -base64 32)'/' .env
```

### Passo 2: Iniciar Stack

```bash
docker-compose up -d
```

### Passo 3: Setup Banco de Dados

```bash
# Aguarde ~10 segundos para o backend iniciar
sleep 10

# Executar migrations
docker-compose exec backend npm run migrate
```

### Passo 4: Verify Saúde

```bash
# Check todos os serviços
docker-compose ps

# Test Backend
curl http://localhost:3001/health

# Test Frontend
curl -I http://localhost:3000

# Test Swagger
open http://localhost:3001/api/docs
```

✅ **Feito!** Sua aplicação está rodando!

---

## 📍 Acessar a Aplicação

| Componente | URL | Usuário/Senha |
|-----------|-----|---------------|
| **Frontend** | http://localhost:3000 | (criar conta) |
| **Backend** | http://localhost:3001 | (API) |
| **Swagger Docs** | http://localhost:3001/api/docs | (público) |
| **Redis Commander** | http://localhost:8081 | (visualizar queue) |

---

## 🧪 Testar Endpoints

### 1. Health Checks

```bash
# Backend health
curl http://localhost:3001/health

# Frontend health
curl -I http://localhost:3000

# Database health
curl http://localhost:3001/api/health/db

# Queue health
curl http://localhost:3001/api/health/queue
```

### 2. Autenticação

```bash
# Registrar novo usuário
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Fazer login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Copiar o token retornado e usar em:
TOKEN="seu-token-aqui"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/auth/verify
```

### 3. Cache

```bash
# Obter dados cacheados
curl http://localhost:3001/api/cache/sample

# Ver estatísticas de cache (requer token admin)
curl -H "Authorization: Bearer admin-token" \
  http://localhost:3001/api/cache/stats
```

### 4. Email Queue

```bash
# Enviar email de teste
curl -X POST http://localhost:3001/api/notifications/send-test \
  -H "Authorization: Bearer admin-token" \
  -H "Content-Type: application/json" \
  -d '{"recipient": "test@example.com"}'

# Ver stats da queue
docker-compose exec backend npm run queue:stats
```

---

## 📝 Configuração Customizada

### Mudar Porta Frontend

```bash
# .env
NEXT_PUBLIC_API_URL=http://localhost:3001
FRONTEND_PORT=3000  # Novo
```

### Mudar Porta Backend

```bash
# .env
PORT=3002  # Novo
```

### Usar PostgreSQL

```bash
# docker-compose.yml - descomentar postgres service
```

### Ativar Redis Persistência

```bash
# Já está habilitada via appendonly yes
# Dados salvos em ./data/redis/
```

---

## 🔍 Debugging

### Ver Logs

```bash
# Todos os serviços
docker-compose logs -f --tail=100

# Apenas backend
docker-compose logs -f backend

# Apenas frontend
docker-compose logs -f frontend

# Redis
docker-compose logs -f redis
```

### Entrar no Container

```bash
# Backend shell
docker-compose exec backend sh

# Frontend shell
docker-compose exec frontend sh

# Database shell
docker-compose exec postgres psql -U postgres
```

### Limpar & Resetar

```bash
# Parar tudo
docker-compose down

# Apagar volumes (⚠️ deleta dados!)
docker-compose down -v

# Reconstruir imagens
docker-compose build --no-cache

# Reiniciar limpo
docker-compose up -d
```

---

## 🚢 Deploy em Produção

### 1. Setup no Servidor

```bash
# SSH no servidor
ssh user@seu-servidor.com

# Clonar repo
git clone https://github.com/seu-usuario/limpeza-pro.git /app
cd /app

# Configurar .env em produção
nano .env
# Editar valores: DB, Redis, API_URL, secrets, etc
```

### 2. Configurar SSL (Let's Encrypt)

```bash
# Instalar certbot (Ubuntu/Debian)
sudo apt install certbot [REDACTED_TOKEN]

# Criar certificado
sudo certbot certonly --standalone \
  -d seu-dominio.com \
  -d www.seu-dominio.com

# Copiar para app
sudo cp /etc/letsencrypt/live/seu-dominio.com/* app/certs/
sudo chown -R $(id -u):$(id -g) app/certs/
```

### 3. Iniciar com Nginx

```bash
# Usar docker-compose.prod.yml
docker-compose -f docker-compose.yml up -d

# Ou usar Nginx como reverse proxy (ver DEPLOYMENT.md)
```

### 4. Configurar Auto-Deploy (GitHub Actions)

```bash
# Add secrets ao GitHub
Settings > Secrets and variables > Actions

DEPLOY_HOST: seu-servidor.com
DEPLOY_USER: deploy-user
DEPLOY_KEY: (SSH private key)
```

Agora a cada push em `main`, o deploy é automático!

---

## ✅ Checklist de Setup

- [ ] Docker & Docker Compose instalados
- [ ] `.env` configurado com secrets
- [ ] `docker-compose up -d` executado com sucesso
- [ ] Migrations rodadas: `npm run migrate`
- [ ] Backend respondendo em http://localhost:3001/health
- [ ] Frontend carregando em http://localhost:3000
- [ ] Swagger docs acessíveis em http://localhost:3001/api/docs
- [ ] Usuário de teste criado e login funcionando
- [ ] Email queue iniciado sem erros

---

## 🐛 Problemas Comuns

### Porta já em uso
```bash
# Encontrar processo
lsof -i :3000  # ou :3001, :6379

# Kill processo
kill -9 <PID>

# Ou usar portas diferentes em .env
```

### "docker-compose: command not found"
```bash
# Instale Docker Compose v2
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Ou use
docker compose up -d  # (docker compose, não docker-compose)
```

### Banco de dados não conecta
```bash
# Aguarde mais tempo na inicialização
sleep 30

# Test conexão
docker-compose exec postgres psql -U postgres -c "SELECT 1"

# Limpe e reinicie
docker-compose down -v
docker-compose up -d
sleep 30
docker-compose exec backend npm run migrate
```

### Frontend mostra blank page
```bash
# Check logs
docker-compose logs frontend

# Verificar se backend está respondendo
curl http://localhost:3001/api/health

# Limpar cache Next.js
docker-compose exec frontend rm -rf .next
docker-compose restart frontend
```

---

## 📚 Próximas Leituras

1. **Deployment Completo:** [DEPLOYMENT.md](./DEPLOYMENT.md)
2. **Resumo de Implementação:** [[REDACTED_TOKEN].md](./[REDACTED_TOKEN].md)
3. **Arquitetura:** [ARCHITECTURE_MAP.md](./ARCHITECTURE_MAP.md)
4. **API Docs:** http://localhost:3001/api/docs

---

## 💡 Dicas Pro

### Usar Docker volumes para dev

```bash
# docker-compose.override.yml
version: '3.8'
services:
  backend:
    volumes:
      - ./backend/src:/app/src
    command: npm run dev  # Hot reload
```

### Monitorar em tempo real

```bash
# Terminal 1: Logs
docker-compose logs -f

# Terminal 2: Stats
watch 'docker stats --no-stream'
```

### Exportar banco de dados

```bash
# Backup
docker-compose exec postgres pg_dump -U postgres limpeza_pro > backup.sql

# Restore
docker-compose exec -T postgres psql -U postgres < backup.sql
```

---

**Sucesso! 🎉 Sua aplicação Limpeza Pro está rodando em produção-ready!**

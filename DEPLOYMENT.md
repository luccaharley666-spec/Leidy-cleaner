# 🚀 Guia de Deployment - Limpeza Pro

Instruções passo-a-passo para fazer deploy da aplicação em produção.

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Git configurado
- Domínio configurado com DNS
- Servidor com pelo menos 2GB de RAM e 2 CPUs
- Certificado SSL/TLS (Let's Encrypt ou outro)

## 🏗️ Estrutura de Deployment

```
┌─────────────────────────────────────────┐
│  GitHub (main branch)                   │
│  └─ CI/CD Workflow (lint, test, build)  │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Docker Registry (ghcr.io)              │
│  ├─ backend:latest                      │
│  └─ frontend:latest                     │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Production Server (Docker Compose)     │
│  ├─ Backend (Node.js/Express)           │
│  ├─ Frontend (Next.js)                  │
│  ├─ Redis                               │
│  ├─ PostgreSQL                          │
│  └─ Nginx (reverse proxy)               │
└─────────────────────────────────────────┘
```

## 🔧 Setup Inicial no Servidor

### 1. Conectar ao servidor

```bash
ssh user@your-server.com
cd /app
```

### 2. Clonar repositório

```bash
git clone https://github.com/seu-usuario/limpeza-pro.git .
```

### 3. Criar arquivo `.env.production`

```bash
cat > .env << 'EOF'
# Environment
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.seu-dominio.com

# Database (PostgreSQL)
DATABASE_URL=postgres://user:password@postgres:5432/limpeza_pro

# Redis
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=[REDACTED_TOKEN]

# JWT Secrets (GERE NOVOS!)
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Integrations
STRIPE_SECRET_KEY=[REDACTED_TOKEN]
[REDACTED_TOKEN]=[REDACTED_TOKEN]

# Email (Nodemailer)
SMTP_HOST=smtp.seu-provedor.com
SMTP_PORT=587
SMTP_USER=seu-email@seu-dominio.com
SMTP_PASS=sua-senha-email

# Social Login
[REDACTED_TOKEN]=[REDACTED_TOKEN]
[REDACTED_TOKEN]=seu-facebook-app-id

# Sentry (Erro tracking)
SENTRY_DSN=sua-sentry-dsn

# New Relic (Monitoramento)
[REDACTED_TOKEN]=seu-new-relic-key
NEW_RELIC_APP_NAME=limpeza-pro-prod

# CORS
CORS_ORIGIN=https://seu-dominio.com

# Storage (S3 ou local)
[REDACTED_TOKEN]=
[REDACTED_TOKEN]=
AWS_S3_BUCKET=
EOF
```

### 4. Configurar Docker Compose para produção

```bash
# Criar diretório para volumes persistentes
mkdir -p data/postgres data/redis

# Iniciar serviços
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 📦 Docker Compose para Produção

Crie `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    restart: always
    environment:
      - NODE_ENV=production
    healthcheck:
      start_period: 60s

  frontend:
    restart: always
    healthcheck:
      start_period: 60s

  postgres:
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    restart: always

  redis:
    volumes:
      - ./data/redis:/data
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    restart: always

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - backend
      - frontend
    networks:
      - vamos-network
```

## 🔐 Configurar Nginx (Reverse Proxy)

Crie `nginx.conf`:

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
  worker_connections 1024;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                  '$status $body_bytes_sent "$http_referer" '
                  '"$http_user_agent" "$[REDACTED_TOKEN]"';

  access_log /var/log/nginx/access.log main;

  sendfile on;
  tcp_nopush on;
  tcp_nodelay on;
  keepalive_timeout 65;
  types_hash_max_size 2048;
  [REDACTED_TOKEN] 20M;

  # Gzip compression
  gzip on;
  gzip_types text/plain text/css text/javascript application/json;
  gzip_min_length 1000;

  # Rate limiting
  limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
  limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;

  upstream backend {
    server backend:3001;
  }

  upstream frontend {
    server frontend:3000;
  }

  # Redirecionar HTTP para HTTPS
  server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    return 301 https://$server_name$request_uri;
  }

  # HTTPS
  server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;

    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    [REDACTED_TOKEN] on;

    # Security headers
    add_header [REDACTED_TOKEN] "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header [REDACTED_TOKEN] "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API
    location /api/ {
      limit_req zone=general burst=20 nodelay;
      proxy_pass http://backend;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $[REDACTED_TOKEN];
      proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Auth endpoints com rate limit mais rigoroso
    location /api/auth/login {
      limit_req zone=auth burst=3;
      proxy_pass http://backend;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $[REDACTED_TOKEN];
      proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend
    location / {
      proxy_pass http://frontend;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $[REDACTED_TOKEN];
      proxy_set_header X-Forwarded-Proto $scheme;

      # Next.js specific
      proxy_http_version 1.1;
      proxy_set_header Connection "";
    }

    # Health checks (sem rate limit)
    location /health {
      access_log off;
      proxy_pass http://backend;
    }
  }
}
```

## 🔒 Setup SSL com Let's Encrypt

```bash
# Instalar certbot
sudo apt-get install certbot [REDACTED_TOKEN] -y

# Gerar certificado
sudo certbot certonly --standalone -d seu-dominio.com -d www.seu-dominio.com

# Copiar para Docker
mkdir -p certs
sudo cp /etc/letsencrypt/live/seu-dominio.com/fullchain.pem certs/
sudo cp /etc/letsencrypt/live/seu-dominio.com/privkey.pem certs/
sudo chown -R $(whoami):$(whoami) certs/

# Criar script de renovação automática
cat > /etc/cron.d/letsencrypt << EOF
0 3 * * * root certbot renew --quiet && docker-compose -f /app/docker-compose.yml restart nginx
EOF
```

## 📊 Monitoramento

### Ver logs

```bash
# Todos os serviços
docker-compose logs -f

# Apenas backend
docker-compose logs -f backend

# Apenas frontend
docker-compose logs -f frontend
```

### Health checks

```bash
# Backend
curl https://seu-dominio.com/api/health

# Frontend
curl -I https://seu-dominio.com/
```

## 🛠️ Manutenção

### Backup do banco de dados

```bash
# Backup automático diário
0 2 * * * docker-compose exec postgres pg_dump -U user limpeza_pro > /backups/db-$(date +\%Y\%m\%d).sql
```

### Update da aplicação

```bash
# Puxar últimas imagens
docker-compose pull

# Reiniciar serviços
docker-compose up -d

# Verificar status
docker-compose ps
```

### Limpar volumes não utilizados

```bash
docker system prune -a --volumes
```

## 📈 Escalabilidade

Para suportar mais usuários:

1. **Adicionar mais workers**
   ```bash
   # Aumentar replicas no docker-compose
   ```

2. **Usar load balancer** (Nginx, HAProxy)

3. **Cache distribuído** (Redis melhorado)

4. **CDN** para assets (CloudFlare, AWS CloudFront)

5. **Database scaling** (Read replicas PostgreSQL)

## 🆘 Troubleshooting

### Backend não inicia

```bash
# Ver logs detalhados
docker-compose logs backend

# Verificar variáveis de ambiente
docker-compose exec backend env | grep DATABASE_URL

# Testar migration
docker-compose exec backend npm run migrate
```

### Frontend com erro 502

```bash
# Verificar se backend está rodando
docker-compose exec frontend curl http://backend:3001/health

# Reiniciar frontend
docker-compose restart frontend
```

### PostgreSQL não conecta

```bash
# Verificar se está rodando
docker-compose ps postgres

# Ver logs
docker-compose logs postgres

# Resetar volume (⚠️ Deleta dados!)
docker-compose down -v && docker-compose up -d postgres
```

## 📞 Suporte

Em caso de problemas:
1. Verificar logs: `docker-compose logs -f`
2. Consultar documentação: [GitHub Wiki](https://github.com/seu-usuario/limpeza-pro/wiki)
3. Abrir issue: [GitHub Issues](https://github.com/seu-usuario/limpeza-pro/issues)

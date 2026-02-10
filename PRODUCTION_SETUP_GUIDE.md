# 🚀 PRODUCTION SETUP GUIDE - PASSO A PASSO

**Versão:** PROD SECURE v3  
**Data:** 10 de Fevereiro de 2026  
**Tempo estimado:** 30-45 minutos

---

## 📋 Pré-requisitos

- [ ] Servidor Linux (Ubuntu 20.04+)
- [ ] Docker e Docker Compose instalados
- [ ] Domínio apontando para o servidor
- [ ] Acesso SSH como root ou sudo
- [ ] Conta Sentry (https://sentry.io)
- [ ] Credenciais AWS (opcional, para backups S3)
- [ ] Certificado SSL (Let's Encrypt/Certbot)

---

## 🔑 Step 1: Gerar JWT_SECRET & Configurar .env.production

```bash
# Gerar nova JWT_SECRET
JWT_SECRET=$(openssl rand -hex 32)
echo "Sua JWT_SECRET: $JWT_SECRET"

# Copiar .env.example para .env.production
cp .env.production.example .env.production

# Editar variáveis críticas
nano .env.production
```

**Variáveis OBRIGATÓRIAS:**
```env
JWT_SECRET=[REDACTED_TOKEN]
DATABASE_URL=postgresql://usuario:senha@postgres:5432/seu_banco
REDIS_URL=redis://:senha@redis:6379
[REDACTED_TOKEN]=[REDACTED_TOKEN]
[REDACTED_TOKEN]=[REDACTED_TOKEN]
SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## 💾 Step 2: Preparar PostgreSQL & Importar BD

### Opção A: Local (Desenvolvimento)

```bash
# Criar BD PostgreSQL localmente
createdb limpeza_pro

# Executar schema
psql limpeza_pro < scripts/schema_sqlite.sql

# Importar dados de CSVs (gerados anteriormente)
python3 scripts/sqlite_to_postgres.py \
  backend/backend_data/database.sqlite \
  /tmp/export_sql
```

### Opção B: Docker Compose (Recomendado)

```bash
# Usar docker-compose.full.yml que já include PostgreSQL
docker-compose -f docker-compose.full.yml up -d postgres

# Aguardar inicialização
sleep 10

# Executar migrations
docker-compose -f docker-compose.full.yml exec postgres psql \
  -U postgres -d limpeza_pro \
  -f /[REDACTED_TOKEN].d/01-init.sql
```

---

## 🔐 Step 3: Configurar SSL/HTTPS com Let's Encrypt

```bash
# Tornar script executável
chmod +x scripts/setup-ssl.sh

# Executar setup SSL
./scripts/setup-ssl.sh seu-dominio.com admin@seu-dominio.com
```

**O que o script faz:**
✅ Instala Certbot  
✅ Gera certificado SSL  
✅ Configura renovação automática  
✅ Atualiza .env.production  
✅ Cria hooks para NGINX  

**Verificar certificado:**
```bash
openssl x509 -in /etc/letsencrypt/live/seu-dominio.com/fullchain.pem -text -noout
```

---

## 🔔 Step 4: Ativar Sentry para Error Tracking

```bash
# Executar setup Sentry
chmod +x scripts/setup-sentry.sh
./scripts/setup-sentry.sh https://xxx@sentry.io/xxxxxx
```

**Configurações recomendadas no Sentry:**

1. **Performance Monitoring**
   ```
   Sentry → Settings → Performance
   ├─ Enable Performance Monitoring: ON
   └─ Sample Rate: 10-20%
   ```

2. **Alertas**
   ```
   Sentry → Alerts
   ├─ Create Alert Rule
   ├─ Condition: Issue Frequency > 10 in 1 hour
   └─ Action: Send to Slack/PagerDuty
   ```

3. **Source Maps**
   ```bash
   npm run build
   # Upload source maps durante deploy
   ```

---

## 💾 Step 5: Setup Backups Automáticos

### Local Backups

```bash
# Executar backup manual
chmod +x scripts/backup-database.sh
./scripts/backup-database.sh

# Agendar com cron (2:00 AM diariamente)
0 2 * * * /home/app/limpeza-pro/scripts/backup-database.sh >> /var/log/backup.log 2>&1
```

### AWS S3 Backups (Opcional)

```bash
# Instalar AWS CLI
apt-get install awscli

# Configurar credenciais
aws configure
# Entrar:
# AWS Access Key ID: seu-key
# AWS Secret Access Key: sua-secret
# Default region: sa-east-1

# Criar bucket S3
aws s3 mb s3://seu-bucket-backups --region sa-east-1

# Script já envia para S3 se AWS_S3_BUCKET estiver definido
export AWS_S3_BUCKET=seu-bucket-backups
```

**Testar restauração:**
```bash
# Download do S3
aws s3 cp s3://seu-bucket-backups/database/db_backup_XXXXX.sql.gz .

# Restaurar
createdb limpeza_pro_test
gunzip < db_backup_XXXXX.sql.gz | psql limpeza_pro_test
```

---

## 🔴 Step 6: Configurar Redis para Filas Persistentes

```bash
# Docker (recomendado)
docker-compose -f docker-compose.full.yml up -d redis

# Verificar status
docker-compose -f docker-compose.full.yml exec redis redis-cli ping
# Resposta: PONG ✅

# Configurar persistência
docker-compose -f docker-compose.full.yml exec redis redis-cli config set appendonly yes

# Ou manualmente (sem Docker)
apt-get install redis-server

# Edit /etc/redis/redis.conf
sudo nano /etc/redis/redis.conf
# Descomentar:
# appendonly yes
# requirepass sua-senha-forte

sudo systemctl restart redis-server
```

**Testar Redis:**
```bash
redis-cli -a sua-senha-forte
> ping
PONG
> exit
```

---

## 🐳 Step 7: Deploy com Docker Compose

```bash
# Garantir permissões corretas
chmod +x scripts/*.sh

# Criar .env.docker
cat > .env.docker << 'EOF'
# Database
DB_USER=postgres
DB_PASSWORD=$(openssl rand -hex 16)
DB_NAME=limpeza_pro

# Redis
REDIS_PASSWORD=$(openssl rand -hex 16)

# App
JWT_SECRET=$(openssl rand -hex 32)
[REDACTED_TOKEN]=[REDACTED_TOKEN]
[REDACTED_TOKEN]=[REDACTED_TOKEN]
SENTRY_DSN=https://xxx@sentry.io/xxx

# URLs
NEXT_PUBLIC_API_URL=https://seu-dominio.com/api
NEXT_PUBLIC_WS_URL=wss://seu-dominio.com
EOF

# Substituir valores
nano .env.docker

# Deploy
docker-compose -f docker-compose.full.yml up -d

# Verificar status
docker-compose -f docker-compose.full.yml ps
```

---

## ✅ Step 8: Validação & Testes

### Health Checks

```bash
# Backend health
curl https://seu-dominio.com/api/health

# Resposta esperada
{
  "status": "healthy",
  "services": {
    "database": "✅ healthy",
    "emailQueue": "✅ healthy",
    "cache": "✅ healthy",
    "system": "✅ healthy"
  }
}
```

### Testes de Funcionalidade

```bash
# 1. Login
curl -X POST https://seu-dominio.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"123456"}'

# 2. Pricing
curl https://seu-dominio.com/api/pricing/default

# 3. Services
curl https://seu-dominio.com/api/services

# 4. Logs (se Sentry ativado)
# Verificar: https://sentry.io/organizations/seu-org/issues/
```

### Performance Tests

```bash
# Instalar k6 (load testing)
apt-get install k6

# Executar teste básico
k6 run scripts/load-test.js
```

---

## 📊 Step 9: Monitoramento & Observabilidade

### Prometheus + Grafana

```bash
# Prometheus já incluído em docker-compose.full.yml
# URL: http://localhost:9090

# Grafana já incluído
# URL: http://localhost:3002
# Login: admin / ${GRAFANA_PASSWORD}

# Criar dashboard
1. Data Source → Prometheus
2. Import Dashboard ID: 1860 (Node Exporter)
3. Customizar para seu app
```

### Logs Centralizados

```bash
# Usar ELK Stack ou Datadog
# Backend já usa Winston com JSON logging

# Exemplo: enviar logs para Datadog
npm install @datadog/browser-logs
```

### Alertas

```bash
# Sentry (já configurado)
# ✅ Erros críticos → Slack/PagerDuty

# Prometheus Alertmanager
docker-compose up -d alertmanager

# Configurar alertas
nano deploy/prometheus.yml
# Editar: alert_rules_file
```

---

## 🔐 Step 10: Hardening & Segurança Final

### Firewall

```bash
# UFW (Ubuntu)
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir apenas portas necessárias
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3001/tcp  # Backend (acesso interno)

sudo ufw enable
```

### Secrets Management

```bash
# ❌ NUNCA commitar .env.production
echo ".env.production" >> .gitignore
git add .gitignore
git commit -m "chore: ignore production env"

# ✅ Usar AWS Secrets Manager ou similar
aws secretsmanager create-secret \
  --name limpeza-pro/prod \
  --secret-string file://.env.production
```

### SSL/TLS Hardening

```bash
# HSTS Header (já em nginx.conf)
add_header [REDACTED_TOKEN] "max-age=31536000; includeSubDomains" always;

# CSP Header
add_header [REDACTED_TOKEN] "default-src 'self'; script-src 'self' 'unsafe-inline';" always;

# X-Frame-Options
add_header X-Frame-Options "SAMEORIGIN" always;

# Verificar score
https://www.ssllabs.com/ssltest/analyze.html?d=seu-dominio.com
```

---

## 🔄 Step 11: Renovação Automática SSL

```bash
# Certbot renewal (configurado automaticamente)
# Verificar:
sudo certbot renew --dry-run

# Agendar:
0 3 * * * certbot renew

# Ou usar systemd timer
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## 📝 Step 12: Documentação & Runbooks

Criar runbooks para:

1. **Incident Response**
   ```
   docs/runbooks/incident-response.md
   - Como responder a alertas Sentry
   - Como rollback de deploy
   - Contatos de escalação
   ```

2. **Operações Diárias**
   ```
   docs/runbooks/daily-operations.md
   - Monitorar Prometheus/Grafana
   - Verificar logs
   - Health checks
   ```

3. **Disaster Recovery**
   ```
   docs/runbooks/disaster-recovery.md
   - Restaurar BD do backup
   - Restaurar from snapshot
   - Failover procedures
   ```

---

## ✨ Checklist Final

```
✅ JWT_SECRET gerada e configurada
✅ PostgreSQL iniciado e BD importada
✅ Redis configurado com persistência
✅ SSL/HTTPS certificado obtido
✅ Renovação automática SSL ativada
✅ Sentry integrado e testado
✅ Backups automáticos agendados
✅ Backups restauráveis (testado)
✅ Docker Compose deployado
✅ Health checks passando
✅ Testes de funcionalidade OK
✅ Prometheus/Grafana rodando
✅ Alertas configurados
✅ Firewall ativado
✅ Secrets gerenciados corretamente
✅ Documentação completa
```

---

## 🆘 Troubleshooting

### "Port already in use"
```bash
lsof -i :3001
kill -9 <PID>
```

### "Database connection refused"
```bash
docker-compose logs postgres
# Verificar credenciais em .env.production
```

### "SSL certificate not found"
```bash
ls -la /etc/letsencrypt/live/seu-dominio.com/
certbot renew --force-renewal
```

### "Redis connection refused"
```bash
redis-cli -a senha-redis ping
docker-compose logs redis
```

---

## 📞 Suporte

- **Documentação:** Ver [EXPORT_INSTRUCTIONS.md](EXPORT_INSTRUCTIONS.md)
- **Segurança:** Ver [SECURITY_FIXES.md](SECURITY_FIXES.md)
- **Análise:** Ver [[REDACTED_TOKEN].md]([REDACTED_TOKEN].md)
- **Issues:** https://github.com/seu-repo/issues

---

**Versão:** PROD SECURE v3  
**Última atualização:** 10 de Fevereiro de 2026  
**Status:** ✅ PRONTO PARA PRODUÇÃO

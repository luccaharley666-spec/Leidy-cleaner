# 🚀 PRÉ-DEPLOY ORION HOST - CHECKLIST EXECUTIVO

**Domínio:** cleanerleidy.com.br  
**Plataforma:** Orion Host  
**Data Alvo:** Semana de 17-21 Fevereiro  
**Status:** 95% Pronto  

---

## 📋 CHECKLIST PRÉ-REQUISITOS

### A. Informações Necessárias

Antes de começar, tenha pronta:

```
Domínio Principal: cleanerleidy.com.br ✅
Domínio Backend: api.cleanerleidy.com.br (criar se não tiver)
Domínio Frontend: app.cleanerleidy.com.br (ou mesmo principal)

Acesso Orion Host:
  [ ] Host/IP: __________________
  [ ] Usuário SSH: __________________
  [ ] Senha/Chave SSH: __________________
  [ ] Porta SSH (padrão 22): __________________

Email para SSL:
  [ ] admin@cleanerleidy.com.br

Credenciais Externas:
  [ ] E-mail SMTP: __________________
      Host: __________________
      Porta: __________________
      Usuário: __________________
      Senha: __________________
  
  [ ] Stripe Keys:
      Publishable: __________________
      Secret: __________________
  
  [ ] PIX Provider (Asaas/PagBank):
      API Key: __________________

Opcional:
  [ ] Google Analytics ID (se tiver)
  [ ] Sentry DSN (se usar)
```

---

## 🔧 CHECKLIST NO SEU COMPUTADOR

### 1. Código Pronto
```
✅ Backend compilado: npm run build
✅ Frontend otimizado: npm run build (Next.js)
✅ Migrações atualizadas: backend/src/db/migrations.sql
✅ .env.production em .gitignore
✅ Sem console.log em produção (verificar)
✅ Sem credenciais em código
```

### 2. Repositório Git Limpo
```bash
# Verificar status
git status

# Deve estar vazio ou só mostrar arquivos não-git
# Se vir .env.production, ele deve estar em .gitignore

# Verificar últimos commits
git log --oneline -5

# Verificar branch
git branch
# Deve estar em 'main' ou 'production'
```

### 3. Testes Locais
```bash
# Backend testes
cd backend
npm test
# Esperado: todos passando ou SKIP permitidos

# Frontend testes
cd ../frontend
npm test
# Esperado: todos passando ou SKIP permitidos

# Build production
npm run build
# Esperado: BUILD SUCCESSFUL
```

### 4. Arquivo de Deployment
```bash
# Verificar se está na raiz
ls -la ACOES_RAPIDAS_5_CRITICOS.md
ls -la DEPLOY_ORION_HOST_COMPLETO.md
ls -la deploy-orionhost-automated.sh

# Dar permissão de execução
chmod +x deploy-orionhost-automated.sh
```

---

## 🖥️ CHECKLIST NO SERVIDOR ORION HOST

### 1. Conexão & Acesso

```bash
# Conectar via SSH
ssh usuario@seu.dominio.com.br

# Se usar chave:
ssh -i ~/.ssh/chave.pem usuario@seu.dominio.com.br

# Se usar porta customizada (ex 2222):
ssh -p 2222 usuario@seu.dominio.com.br
```

Depois que conectado:

```bash
# Verificar acesso root
sudo whoami
# Esperado: root

# Se pedir senha, insira a senha do servidor

# Verificar sistema operacional
uname -a
# Esperado: Linux ... Ubuntu ...
```

### 2. Verificar Softwares Instalados

```bash
# Node.js
node --version
# Esperado: v20.x.x

# npm
npm --version
# Esperado: 10.x.x

# Git
git --version
# Esperado: git version 2.x.x

# SQLite3
sqlite3 --version
# Esperado: 3.x.x

# Nginx
nginx -v
# Esperado: nginx/1.x.x

# Certbot (para SSL)
certbot --version
# Esperado: certbot 2.x.x
```

**Se algo falta, avisar antes de começar!**

### 3. Espaço em Disco

```bash
# Verificar espaço disponível
df -h /

# Esperado: mínimo 5GB livre
# Saída tipo:
# Filesystem      Size  Used Avail Use% Mounted on
# /dev/sda1       50G   10G  40G  20%  /

# Espaço em /home
df -h /home/

# Esperado: mínimo 10GB disponível
```

### 4. Portas Disponíveis

```bash
# Verificar se portas 80, 443 estão livres
sudo netstat -tlnp | grep -E ':80|:443|:3000|:3001'

# Se nada aparecer = OK
# Se aparecer alguma coisa = problema, investigar
```

### 5. Firewall Status

```bash
# Verificar UFW
sudo ufw status

# Se "inactive", não há problema ainda
# Vamos ativar durante o deploy

# Ver regras atuais
sudo ufw show added
# Pode estar vazio
```

---

## 📦 CHECKLIST DE DEPLOYMENT

### Passo 1: Download do Código

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/seu-repo-name.git seu-site
cd seu-site

# Ou atualizar se já existe
git pull origin main
```

**⏱️ Tempo: 2-5 min**

### Passo 2: Executar Script de Deploy

```bash
# Tornar executável
chmod +x deploy-orionhost-automated.sh

# Executar
bash deploy-orionhost-automated.sh cleanerleidy.com.br admin@cleanerleidy.com.br

# Processo vai:
# 1. Validar estrutura do projeto
# 2. Gerar secrets (JWT, SESSION, WEBHOOK)
# 3. Criar .env.production
# 4. Instalar dependências backend
# 5. Build frontend
# 6. Inicializar banco de dados
# 7. Configurar Nginx
# 8. Gerar certificado SSL
# 9. Criar serviços systemd
```

**⏱️ Tempo: 15-25 min** (depende conexão internet)

### Passo 3: Verificar Status

```bash
# Ver se serviços estão rodando
sudo systemctl status app-backend
sudo systemctl status app-frontend

# Esperado: active (running) em verde

# Ver logs
sudo journalctl -u app-backend -n 20
sudo journalctl -u app-frontend -n 20

# Deve ter mensagens tipo:
# Backend listening on port 3000
# Frontend started on port 3001
```

### Passo 4: Testar HTTPS

```bash
# Se certificado foi gerado com sucesso
curl -I https://cleanerleidy.com.br/

# Esperado: HTTP/2 200 ou HTTP/1.1 200

# Se der erro de certificado:
sudo certbot renew --dry-run
# Isso simula renovação sem quebrar nada
```

### Passo 5: Testar API

```bash
# Health check backend
curl https://api.cleanerleidy.com.br/api/health

# Deve retornar JSON tipo:
# {"status":"ok","timestamp":"2026-02-14T10:30:00Z"}

# Testar login (sem credenciais)
curl -X POST https://api.cleanerleidy.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"","password":""}'

# Deve retornar erro de validação (422 ou 400)
# Não deve ser 500 (erro do servidor)
```

### Passo 6: Testar Frontend

```bash
# Acessar em navegador
# https://cleanerleidy.com.br

# Verificar:
# [ ] Página carrega
# [ ] Logo aparece
# [ ] Menu funciona
# [ ] Sem erros em console (F12)
# [ ] Modo escuro funciona
# [ ] Versão mobile OK (F12 → toggle device)
```

---

## 🔐 CHECKLIST DE SEGURANÇA PÓS-DEPLOY

Após tudo funcionando:

```bash
# 1. Verificar .env não exposto
curl https://cleanerleidy.com.br/.env
# Deve retornar 404, não o conteúdo do arquivo

# 2. Verificar console logs
curl https://cleanerleidy.com.br/
# Ver se há console.log expondo dados

# 3. Verificar headers de segurança
curl -I https://cleanerleidy.com.br/ | grep -i "strict\|security\|x-frame"

# Esperado: 
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Strict-Transport-Security: max-age=31536000

# 4. Testar rate limiting
for i in {1..10}; do
  curl -X POST https://cleanerleidy.com.br/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' 2>/dev/null
done

# Na 6ª tentativa deve retornar 429 (Too Many Requests)
```

---

## 📊 CHECKLIST DE MONITORAMENTO

Depois de deploy, monitorar por 24h:

```bash
# Ver uso de recursos
htop
# Pressionar 'T' para ordenar por mem
# Pressionar 'P' para ordenar por CPU
# q para sair

# Ver logs de erro
sudo tail -f /var/log/nginx/error.log

# Ver requisições HTTP
sudo tail -f /var/log/nginx/access.log
```

**Esperado:** CPU < 30%, Memória < 60% em uso normal

---

## ⚠️ PROBLEMAS COMUNS & SOLUÇÕES

### Problema: Build falha com "Out of Memory"

**Causa:** Servidor sem RAM suficiente  
**Solução:**
```bash
# Criar swap adicional
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Verificar
free -h
# Deve mostrar Swap aumentado

# Automatizar (persistente)
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Problema: "Port already in use" na porta 3000

**Causa:** Outro serviço usando a porta  
**Solução:**
```bash
# Ver o que está usando
sudo lsof -i :3000

# Matar processo
sudo kill -9 PID

# Ou mudar porta em .env.production
PORT=3002
```

### Problema: Certificado SSL não funciona

**Causa:** Certbot não conseguiu validar domínio  
**Solução:**
```bash
# Verificar DNS resolvendo
nslookup cleanerleidy.com.br
# Deve mostrar IP do servidor

# Tentar novamente
sudo certbot certonly --standalone -d cleanerleidy.com.br

# Se falhar, usar DNS validation
sudo certbot certonly --manual -d cleanerleidy.com.br
# Seguir instruções para adicionar TXT record no DNS
```

### Problema: Nginx mostra "502 Bad Gateway"

**Causa:** Backend não está rodando ou não acessível  
**Solução:**
```bash
# Ver status
sudo systemctl status app-backend

# Se não está rodando
sudo systemctl restart app-backend

# Ver logs
sudo journalctl -u app-backend -n 50

# Se erro de conexão, verificar porta/host em nginx config
sudo cat /etc/nginx/sites-enabled/default
# Verificar proxy_pass para http://localhost:3000
```

### Problema: Banco de dados vazio/não inicializou

**Causa:** Migrações não rodaram  
**Solução:**
```bash
# Verificar banco existe
ls -lh backend_data/database.sqlite

# Se não existe:
cd backend
npm run migrate

# Verificar dados
sqlite3 backend_data/database.sqlite
sqlite> SELECT COUNT(*) FROM users;
sqlite> SELECT COUNT(*) FROM services;
sqlite> .quit

# Se vazio, validar seed:
npm run seed
```

---

## 🎯 CRONOGRAMA SUGERIDO

**Segunda-Feira (17/02):**
- Manhã: Preparar credenciais externas
- Meio-dia: Teste local completo (npm test, npm build)
- Tarde: Ambiente de staging se possível

**Terça-Feira (18/02):**
- Manhã: Executar deploy em produção
- Meio-dia: Testes e validações

**Quarta-Feira (19/02):**
- Monitoração 24h de integridade

**Quinta-Feira (20/02):**
- Corrigir issues encontradas (se houver)

**Sexta-Feira (21/02):**
- Backup automático testado
- Documentação finalizada

---

## 📞 SUPORTE RÁPIDO

Se estiver preso, revisar nesta ordem:

1. **ACOES_RAPIDAS_5_CRITICOS.md** - Correções rápidas
2. **DEPLOY_ORION_HOST_COMPLETO.md** - Detalhamento completo
3. **ORION_HOST_PRÉ_REQUISITOS.md** - Checklist de requisitos
4. **AUDITORIA_PROBLEMAS_MELHORIAS.md** - Se tiver erros/warning

SQL:
- Backend console logs: `sudo journalctl -u app-backend -n 100`
- Frontend console logs: `sudo journalctl -u app-frontend -n 100`
- Nginx errors: `sudo tail -f /var/log/nginx/error.log`

---

## ✅ QUANDO ESTÁ PRONTO

Sistema pronto para usar quando:

```
✅ HTTPS acessível e válido
✅ Frontend carrega sem erros
✅ API responde em /api/health
✅ Login funciona
✅ Agendamento funciona
✅ Pagamento testa OK
✅ Admin panel acessível
✅ Dark mode funciona
✅ Mobile responsivo
✅ Backup automatizado
✅ UFW firewall ativo
✅ Rate limiting ligado
✅ Logs começaram
```

Se tudo OK = **🎉 PRONTO PARA CLIENTES!**

---

**Documento:** PRÉ-DEPLOY CHECKLIST  
**Versão:** 1.0  
**Data:** 14 de Fevereiro de 2026  
**Status:** ✅ Pronto para executar  

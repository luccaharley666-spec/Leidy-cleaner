# 🔧 Troubleshooting & Compatibilidades

## ⚠️ Problemas Comuns

### 1. **Site Travando ao Rodar Localmente**

#### Causa: Problemas de porta já em uso
```bash
# Verificar se porta 3000 (frontend) está livre
lsof -i :3000

# Matar processo na porta
kill -9 <PID>
```

#### Solução: Usar diferentes portas
```bash
# Backend em porta alternativa
PORT=3002 npm start

# Frontend em porta alternativa
PORT=5000 npm start
```

#### Causa: Memória insuficiente
```bash
# Aumentar limite de memória Node.js
NODE_OPTIONS=--max_old_space_size=4096 npm start
```

#### Causa: Banco de dados corrompido
```bash
# Backup e reset
mv backend_data/limpeza.db backend_data/limpeza.db.backup

# Reinicializar
bash init-db.sh
npm start
```

---

### 2. **Erro: EADDRINUSE (Port Already in Use)**

```bash
# Linux/Mac
lsof -i :3001 | grep LISTEN
kill -9 <PID>

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

---

### 3. **Erro: Cannot find module 'multer'**

```bash
# Instalar multer para upload de arquivos
cd backend && npm install multer

# Verificar node_modules
npm ls multer
```

---

### 4. **Erro: CORS (Cross-Origin Request Blocked)**

**Frontend vê erro em console**: `Access to XMLHttpRequest at 'http://localhost:3001/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy`

#### Solução 1: Verificar CORS no backend
```javascript
// backend/src/index.js - Verificar configuração
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  [REDACTED_TOKEN]: 200
};

app.use(cors(corsOptions));
```

#### Solução 2: Usar proxy no frontend (Vite)
```javascript
// frontend/vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
};
```

---

### 5. **Avatar não aparece na página**

```bash
# 1. Verificar se arquivo foi salvo
ls -la backend/uploads/avatars/

# 2. Verificar permissões
chmod 755 backend/uploads/avatars/

# 3. Verificar no banco
sqlite3 backend_data/limpeza.db "SELECT id, avatar_url FROM users;"

# 4. Testar URL manualmente no navegador
# http://localhost:3001/uploads/avatars/[REDACTED_TOKEN].jpg
```

---

### 6. **Erro: Database locked**

```bash
# Múltiplos processos acessando SQLite
# Solução: Fechar outros processos
ps aux | grep node
kill -9 <todos os PIDs node>

# Usar apenas uma instância
npm start # Uma vez
```

---

### 7. **Erro: JWT Token Expired / Invalid**

```javascript
// Token expirou após 24h
// Solução: Fazer login novamente
// Frontend deve renovar token usando refresh_token
```

---

## 🖥️ Compatibilidades por Sistema

### Windows 10/11

**Problema**: Scripts bash não funcionam  
**Solução**:
```powershell
# Usar Git Bash ou WSL 2
# Ou executar SQL manualmente

sqlite3 backend_data/limpeza.db
.read database/schema.sql
.read database/migrations/[REDACTED_TOKEN].sql
.read database/seeds/001_initial_seed.sql
.quit
```

### macOS

**Problema**: SQLite versão antiga  
**Solução**:
```bash
# Atualizar via Homebrew
brew install sqlite3 --upgrade
which sqlite3  # Verificar versão
```

### Linux (Ubuntu/Debian)

**Problema**: Permissões de arquivo  
**Solução**:
```bash
# Dar permissões ao usuário
sudo chown -R $USER:$USER backend_data/
sudo chown -R $USER:$USER backend/uploads/
chmod -R 755 backend_data/ backend/uploads/
```

### Docker (Recomendado)

**Usar docker-compose para evitar conflitos**:
```bash
docker-compose up -d

# Logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Parar
docker-compose down
```

---

## 📊 Compatibilidades por Navegador

| Navegador | Upload Avatar | Perfil | Pagamentos | Status |
|-----------|-------|---------|-----------|--------|
| Chrome 90+ | ✅ | ✅ | ✅ | ✅ OK |
| Firefox 88+ | ✅ | ✅ | ✅ | ✅ OK |
| Safari 14+ | ⚠️ | ✅ | ✅ | ⚠️ Testar CORS |
| Edge 90+ | ✅ | ✅ | ✅ | ✅ OK |
| IE 11 | ❌ | ❌ | ❌ | ❌ Não suportado |

### Safari: Problema com CORS

```javascript
// frontend/index.html - Adicionar meta tags
<meta http-equiv="X-UA-Compatible" content="ie=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

---

## 🔌 Compatibilidades de Banco de Dados

### SQLite (Desenvolvimento - Padrão)
```bash
# ✅ Funciona localmente
# ✅ Sem configuração
# ✅ Arquivo único
# ❌ Não recomendado para produção (sem concorrência)
npm start
```

### PostgreSQL (Produção - Recomendado)
```bash
# Atualizar .env
DATABASE_URL=postgresql://user:password@localhost:5432/limpeza_pro

# Instalar driver
npm install pg

# Migração automática ao iniciar
npm start
```

### MongoDB (Futuro)
```bash
# Não implementado ainda
# Seria necessário refatorar schema
```

---

## 🚀 Performance em Diferentes Cenários

### Cenário 1: Desenvolvimento Local
```bash
# Recomendado
PORT=3001 npm start
# Performance: Rápido (sem otimizações)
```

### Cenário 2: Multiple Users (10+)
```bash
# Problema: SQLite bloqueia escritas
# Solução: Usar PostgreSQL
```

### Cenário 3: High Traffic (100+ req/s)
```bash
# Adicionar cache Redis
# Usar load balancer (Nginx)
# Escalar horizontalmente
```

---

## 📱 Compatibilidades Mobile

| Recurso | iOS | Android | Status |
|---------|-----|---------|--------|
| Login | ✅ | ✅ | ✅ OK |
| Avatar Upload | ⚠️ | ✅ | ⚠️ Testado em Chrome |
| Perfil | ✅ | ✅ | ✅ OK |
| Responsivo | ✅ | ✅ | ✅ OK (480px+) |

### iOS Safari Problema com Upload
```javascript
// Adicionar ao HTML
<input type="file" accept="image/*" capture="environment">
```

---

## 🔐 Compatibilidades de Segurança

### HTTPS (Produção)
```bash
# Usar certificado SSL/TLS
# Nginx reverse proxy com Let's Encrypt
# Redirecionamento automático HTTP → HTTPS
```

### CORS
```
❌ http://localhost:3000 → http://example.com (bloqueado)
✅ http://localhost:3000 → http://localhost:3001 (permitido)
✅ https://app.com → https://api.com (permitido se configurado)
```

### CSRF
```javascript
// ✅ Proteção habilitada
// Cookie + Token validation
// POST/PUT/DELETE requerem token
```

---

## 📋 Checklist de Compatibilidade

- [ ] Testar em Chrome (Windows, Mac, Linux)
- [ ] Testar em Firefox
- [ ] Testar em Safari (Mac)
- [ ] Testar em Mobile Chrome
- [ ] Testar em Mobile Safari
- [ ] Testar upload de arquivo > 1MB
- [ ] Testar sem conexão (offline)
- [ ] Testar com VPN
- [ ] Testar múltiplas abas simultaneamente
- [ ] Testar em rede lenta (throttling)

---

## 🆘 Como Reportar Bugs

```bash
# 1. Coletar informações
node --version
npm --version
sqlite3 --version
git --version

# 2. Reproduzir erro
# Documentar passos

# 3. Verificar logs
tail -n 50 backend/.log

# 4. Reportar no GitHub
# Incluir: SO, Navegador, Versões, Logs, Screenshots
```

---

**Versão**: 1.0.0  
**Data**: 2025-02-01

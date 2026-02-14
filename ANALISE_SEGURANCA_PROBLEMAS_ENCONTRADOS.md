# 🚨 PROBLEMAS DE SEGURANÇA E QUALIDADE ENCONTRADOS NO CÓDIGO

**Data:** 14 de Fevereiro de 2026  
**Status:** ⚠️ **8 problemas críticos + 5 importantes encontrados**  
**Risco Total:** ALTO - Vulnerabilidades de segurança em produção  

---

## 🔴 CRÍTICOS - CORRIGIR IMEDIATAMENTE (Before Deploy)

### 1. **CRÍTICO: Secrets com Fallback Inseguro em `auth.js`**

**Arquivo:** [`backend/src/middleware/auth.js`](backend/src/middleware/auth.js#L10-L11)

```javascript
// ❌ INSEGURO - Linha 10-11
const JWT_SECRET = process.env.JWT_SECRET || 'PLACEHOLDER';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'PLACEHOLDER';
```

**Problema:**
- Se variáveis não estiverem definidas, usa `'PLACEHOLDER'` fixo
- Qualquer pessoa no código pode adivinhar o secret
- Todos os JWTs seriam assinados com a mesma chave conhecida
- Tokens podem ser forjados com `jwt.sign({...}, 'PLACEHOLDER')`

**Risco:** 🔴 **CRÍTICO** - Compromete autenticação completa

**Solução Imediata:**
```javascript
// ✅ SEGURO
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET e JWT_REFRESH_SECRET são obrigatórios em .env');
}
```

---

### 2. **CRÍTICO: Encryption Key com Fallback `PLACEHOLDER` em `crypto.js`**

**Arquivo:** [`backend/src/utils/crypto.js`](backend/src/utils/crypto.js#L7-L13)

```javascript
// ❌ INSEGURO - Linha 7-13
function getKey() {
  const key = process.env.SECRET_ENC_KEY || process.env.TWO_FA_ENC_KEY;
  if (!key) {
    logger.warn('Encryption key not set. Using insecure dev key.');
    return crypto.createHash('sha256').update('PLACEHOLDER').digest();
  }
  return crypto.createHash('sha256').update(key).digest();
}
```

**Problema:**
- Se SECRET_ENC_KEY não está defin ido, usa 'PLACEHOLDER'
- Qualquer dado "criptografado" com isso não está seguro
- 2FA codes, senhas, dados sensíveis podem ser descriptografados
- Usa `'PLACEHOLDER'` literal conhecido

**Risco:** 🔴 **CRÍTICO** - Criptografia quebrada em produção

**Solução:**
```javascript
// ✅ SEGURO
function getKey() {
  const key = process.env.SECRET_ENC_KEY || process.env.TWO_FA_ENC_KEY;
  if (!key) {
    throw new Error('SECRET_ENC_KEY ou TWO_FA_ENC_KEY são obrigatórios em produção');
  }
  return crypto.createHash('sha256').update(key).digest();
}
```

---

### 3. **CRÍTICO: JWT_SECRET Placeholder em `envConfig.js`**

**Arquivo:** [`backend/src/config/envConfig.js`](backend/src/config/envConfig.js#L31)

```javascript
// ❌ INSEGURO - Linha 31
jwtSecret: readSecret('JWT_SECRET') || process.env.JWT_SECRET || 'PLACEHOLDER',
```

**Problema:**
- Terceiro lugar no código com 'PLACEHOLDER'
- Fallback para token inseguro
- Se .env não for carregado, usa conhecida falha

**Risco:** 🔴 **CRÍTICO**

**Solução:**
```javascript
// ✅ SEGURO
jwtSecret: readSecret('JWT_SECRET') || process.env.JWT_SECRET,
// + validação no boot
```

---

### 4. **CRÍTICO: Senhas em Plain Text no Frontend Auth**

**Arquivo:** [`frontend/src/pages/api/auth/_store.js`](frontend/src/pages/api/auth/_store.js#L16-L24)

```javascript
// ❌ INSEGURO - Linhas 16 + 22-24
export function addUser({ name, email, phone, password, role = 'cliente' }) {
  const id = generateId();
  const user = { id, name, email: email.toLowerCase(), phone, password, role };
  // ❌ Password armazenada em plain text!
  users.push(user);
  return user;
}

export function validateCredentials(email, password) {
  const user = findByEmail(email);
  if (!user) return null;
  if (user.password !== password) return null;  // ❌ Comparação plain text!
  return user;
}
```

**Problema:**
- Senha armazenada em plain text na memória
- Validação de credencial compara plain text com plain text
- Se alguém tiver acesso à memória do Node, vê todas as senhas
- Nenhum hash ou salt

**Risco:** 🔴 **CRÍTICO** - Se servidor for comprometido, todas as senhas expostas

**Solução:**
```javascript
// ✅ SEGURO
import bcrypt from 'bcryptjs';

export async function addUser({ name, email, phone, password, role = 'cliente' }) {
  const id = generateId();
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { id, name, email: email.toLowerCase(), phone, password: hashedPassword, role };
  users.push(user);
  return user;
}

export async function validateCredentials(email, password) {
  const user = findByEmail(email);
  if (!user) return null;
  const passwordMatch = await bcrypt.compare(password, user.password);
  return passwordMatch ? user : null;
}
```

---

### 5. **CRÍTICO: Token Inseguro em Frontend `login.js`**

**Arquivo:** [`frontend/src/pages/api/auth/login.js`](frontend/src/pages/api/auth/login.js#L16)

```javascript
// ❌ INSEGURO - Linha 16
const token = Buffer.from(`${user.email}:${Date.now()}`).toString('base64');
```

**Problema:**
- Token é apenas `email:timestamp` em base64
- Base64 é **encoding**, não encriptação - facilmente reversível
- Qualquer pessoa pode fazer `Buffer.from(token, 'base64').toString()` e ver email + timestamp
- Não há assinatura criptográfica
- Lógica de expiração não funciona (timestamp não é validado)

**Risco:** 🔴 **CRÍTICO** - Tokens podem ser forjados/lidos

**Solução:**
```javascript
// ✅ SEGURO
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }  // Token expira em 24h
);
```

---

## 🟠 IMPORTANTES - Corrigir ESTA SEMANA

### 6. **IMPORTANTE: Test Tokens Hardcoded em `auth.js`**

**Arquivo:** [`backend/src/middleware/auth.js`](backend/src/middleware/auth.js#L45-L51)

```javascript
// ⚠️  RISCO - Linhas 45-51
if (process.env.NODE_ENV === 'test') {
  const testTokenMap = {
    'admin-token': { userId: 1, id: 1, role: 'admin' },
    'manager-token': { userId: 2, id: 2, role: 'manager' },
    'staff-token': { userId: 3, id: 3, role: 'staff' },
    // ... mais tokens
  };
}
```

**Problema:**
- Se `NODE_ENV` não for exatamente `'test'`, tokens podem escapar
- Alguém pode usar `Authorization: admin-token` e ser admin
- Tokens de teste nunca devem estar em código

**Risco:** 🟠 **ALTO** - Acesso não autorizado como admin

**Solução:**
```javascript
// ✅ SEGURO - Usar JWT real mesmo em testes
// Gerar JWT real com chave de teste
const testToken = jwt.sign(
  { userId: 1, role: 'admin' },
  process.env.JWT_SECRET || 'test-secret-only-for-tests'
);
```

---

### 7. **IMPORTANTE: Senha Admin Default em Migrations**

**Arquivo:** [`backend/src/db/migrations.sql`](backend/src/db/migrations.sql#L306)

```sql
-- ❌ INSEGURO - Linha 306
INSERT OR IGNORE INTO users (email, password, name, phone, role) VALUES
('admin@leidycleaner.com', '$2b$10$placeholder', 'Administrador', '5198030000', 'admin');
```

**Problema:**
- Senha é `$2b$10$placeholder` (placeholder conhecido)
- Se alguém souber o hash, pode ter comprado esse hash no banco antes
- Admin fica com senha fraca/conhecida
- Qualquer desenvolvedor que clonar o repo sabe a senha

**Risco:** 🟠 **ALTO** - Admin account pode ser acessado

**Solução:**
```javascript
// ✅ SEGURO - Seed gera senha aleatória
const bcrypt = require('bcryptjs');
const randomPassword = require('crypto').randomBytes(16).toString('hex');
const hashedPassword = await bcrypt.hash(randomPassword, 10);

console.log(`Admin criado. Senha temporária: ${randomPassword}`);
// Editar migrations.sql com hash

// OU melhor ainda:
// Não faire INSERT de admin nas migrations
// Criar admin apenas via script pós-deploy
```

---

### 8. **IMPORTANTE: Dados Sensíveis em Documentação**

**Arquivos Encontrados com Dados Sensíveis:**
- [`CONFIGURACAO_ADMIN_SEGURA.md`](CONFIGURACAO_ADMIN_SEGURA.md) - Contém PIX, conta bancária, senha
- [`CHECKLIST_INFORMACOES_NECESSARIAS.md`](CHECKLIST_INFORMACOES_NECESSARIAS.md) - Informações bancárias expostas
- [`PIX_IMPLEMENTATION_GUIDE.md`](PIX_IMPLEMENTATION_GUIDE.md) - Exemplo com dados reais
- Múltiplos scripts com `[REDACTED_TOKEN]` que deveriam estar redacted

**Problema:**
- Dados sensíveis em repositório git
- Visible em histórico de commits
- Alguém com acesso ao repo vê PIX, conta bancária, emails

**Risco:** 🟠 **ALTO** - Fraude financeira, roubo de identidade

**Solução:**
```bash
# 1. Remover dados sensíveis
git rm -r CONFIGURACAO_ADMIN_SEGURA.md
git rm -r CHECKLIST_INFORMACOES_NECESSARIAS.md

# 2. Criar versão segura sem dados reais
# CONFIGURACAO_ADMIN_SEGURA.md.example
# Com placeholders: PIX_EXAMPLE, ACCOUNT_EXAMPLE, etc

# 3. Reescrever histórico (se já foi público)
git filter-branch --tree-filter 'rm -f CONFIGURACAO_ADMIN_SEGURA.md' -- --all
git push --force-with-lease
```

---

## 🟡 IMPORTANTES - Code Quality

### 9. **Token Não Tem Expiração em Frontend**

**Arquivo:** [`frontend/src/pages/api/auth/_store.js`](frontend/src/pages/api/auth/_store.js#L29-L35)

```javascript
// ⚠️  PROBLEMA - Linhas 29-35
export function findByToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [email] = decoded.split(':');
    return findByEmail(email);
  } catch (e) {
    return null;
  }
}
```

**Problema:**
- Token não expira (timestamp não é validado)
- Se token vazar, válido para sempre
- Usuário pode manter sessão aberta indefinidamente

**Risco:** 🟡 **MÉDIO** - Token lifetime não controlado

**Solução:**
```javascript
// ✅ SEGURO - Validar timestamp
export function findByToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [email, timestamp] = decoded.split(':');
    const age = Date.now() - parseInt(timestamp);
    
    if (age > 24 * 60 * 60 * 1000) {  // 24 horas
      return null;  // Token expirou
    }
    
    return findByEmail(email);
  } catch (e) {
    return null;
  }
}
```

---

### 10. **localStorage Sem HTTPS Pode Ser Interceptado**

**Arquivos:** [`frontend/src/pages/admin/settings.jsx`](frontend/src/pages/admin/settings.jsx#L55)

```javascript
// ⚠️  PROBLEMA - Linhas 55+
const token = localStorage.getItem('token');
```

**Problema:**
- Token armazenado em localStorage (visível a XSS attacks)
- Se houver XSS no site, token é roubado
- Não há `HttpOnly` flag (só cookies teriam)

**Risco:** 🟡 **MÉDIO** - Roubo de sessão via XSS

**Solução:**
```javascript
// ✅ MAIS SEGURO - Usar cookie httpOnly
// Backend
res.cookie('authToken', token, {
  httpOnly: true,  // Não visível a JavaScript
  secure: true,    // Só HTTPS
  sameSite: 'strict'  // CSRF protection
});

// Frontend - No need to store, browser envia automaticamente
// fetch(url) // Cookie enviado automaticamente
```

---

## 📊 RESUMO EXECUTIVO

```
┌─ PROBLEMAS CRÍTICOS ────────────────────────────────────────┐
│                                                             │
│  🔴 Críticos (Corrigir HOJE):                              │
│  1. JWT_SECRET com fallback 'PLACEHOLDER'                  │
│  2. Encryption key com fallback 'PLACEHOLDER'              │
│  3. JWT_SECRET placeholder em envConfig                    │
│  4. Senhas plain text no frontend auth                     │
│  5. Token inseguro (base64) no login                       │
│                                                             │
│  🟠 Importantes (Esta semana):                             │
│  6. Test tokens hardcoded                                  │
│  7. Senha admin default fraca                              │
│  8. Dados sensíveis em documentação                        │
│                                                             │
│  🟡 Code Quality (Próximas 2 semanas):                     │
│  9. Token sem expiração                                    │
│  10. localStorage sem proteja vs XSS                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ AÇÕES NECESSÁRIAS (Checklist)

### HOJE (2-3 horas):

- [ ] Remover 'PLACEHOLDER' de `auth.js` - usar throw erro
- [ ] Remover 'PLACEHOLDER' de `crypto.js` - usar throw erro
- [ ] Remover 'PLACEHOLDER' de `envConfig.js` - usar throw erro
- [ ] Converter senhas do frontend para bcrypt hash
- [ ] Converter token frontend para JWT com expiração
- [ ] Remove test tokens ou use JWT real
- [ ] Delete/redact `CONFIGURACAO_ADMIN_SEGURA.md` from git
- [ ] Delete/redact banco dados docs com PIX/conta

### ESTA SEMANA:

- [ ] Add httpOnly cookies para tokens
- [ ] Validar .env.production não em git
- [ ] Run npm audit para dependencies
- [ ] Adicionar rate limiting em login
- [ ] Add Content Security Policy headers

### PRÓXIMAS 2 SEMANAS:

- [ ] Implementar CSRF tokens
- [ ] Add error boundaries no React
- [ ] Audit de XSS vulnerabilities

---

## 🔧 SCRIPT RÁPIDO DE CORREÇÃO

```bash
# Remove docs com dados sensíveis
git rm backend/src/db/CONFIGURACAO_ADMIN_SEGURA.md
git rm CHECKLIST_INFORMACOES_NECESSARIAS.md
git rm PIX_IMPLEMENTATION_GUIDE.md

# Replace insecure fallbacks
sed -i "s/'PLACEHOLDER'/undefined/g" backend/src/middleware/auth.js
sed -i "s/'PLACEHOLDER'/undefined/g" backend/src/utils/crypto.js
sed -i "s/'PLACEHOLDER'/undefined/g" backend/src/config/envConfig.js

# Commit
git add -A
git commit -m "🔒 Fix critical security issues: remove placeholders, redact sensitive data"
git push
```

---

## 📚 Referências de Segurança

- OWASP Top 10: https://owasp.org/Top10/
- JWT Best Practices: https://tools.ietf.org/html/rfc8725
- Node.js Security Checklist: https://nodejs.org/en/docs/guides/security/

---

**Documento:** ANÁLISE DE SEGURANÇA - PROBLEMAS ENCONTRADOS  
**Data:** 14 de Fevereiro de 2026  
**Severidade:** 🔴 CRÍTICA  
**Ação Necessária:** ANTES DE DEPLOY  

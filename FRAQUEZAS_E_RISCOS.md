# ⚠️ ANÁLISE DE FRAQUEZAS E VULNERABILIDADES

**Data**: 8 de Fevereiro de 2026  
**Análise**: Pontos fracos, vulnerabilidades e riscos de segurança

---

## 📊 Resumo Executivo

O projeto está em **estado produção-ready**, mas apresenta **8 pontos fracos significativos** que podem causar problemas em produção:

| Fraqueza | Severidade | Qty | Impacto | Status |
|----------|-----------|-----|--------|--------|
| Console statements | 🟡 Média | 13 | Info leak | ⚠️ Remover |
| Hardcoded localhost | 🔴 Alta | 16 | Quebra em prod | 🚨 Crítico |
| localStorage sem validação | 🟡 Média | 48 | XSS possível | ⚠️ Arriscar |
| TODOs incompletos | 🟡 Média | 2 | Features faltam | ⚠️ Implementar |
| Fetch sem timeout | 🔴 Alta | 5+ | Hangs infinitos | 🚨 Crítico |
| Error handling faltando | 🟡 Média | 15+ | Crashes silenciosos | ⚠️ Melhorar |
| Senha hardcoded | 🔴 Alta | 1 | Segurança | 🚨 Crítico |
| Falta validação input | 🟡 Média | ~15 | SQL Injection | ⚠️ Validar |

**Taxa de Risco**: ⚠️ **MÉDIA** (6 de 8 podem ser fixadas em < 2 horas)

---

## 🔴 CRÍTICO (Deve Arrumar Antes de Produção)

### 1. **Hardcoded URLs com localhost** 🚨
**Quantidade**: 16 ocorrências  
**Severidade**: 🔴 CRÍTICA  
**Risco**: Code quebra em produção (localhost não existe em servidor)

**Exemplo**:
```javascript
// ❌ ERRADO - vai quebrar em produção
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(credentials)
});
```

**Solução**:
```javascript
// ✅ CORRETO - usa variável de ambiente
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const response = await fetch(`${API_URL}/api/auth/login`, {
  method: 'POST',
  ...
});
```

**Arquivos afetados**:
- `src/context/AuthContext.jsx` (4 ocorrências)
- `src/pages/agendar-updated.jsx` (2 ocorrências)
- `src/pages/admin/analytics-dashboard.jsx` (3 ocorrências)
- Outros: ~7 mais

**Impacto**: ❌ **Build falha em qualquer servidor que não seja localhost**

---

### 2. **Fetch Sem Timeout** 🚨
**Quantidade**: 5+ chamadas fetch  
**Severidade**: 🔴 CRÍTICA  
**Risco**: Requisições podem pendurar infinitamente

**Exemplo**:
```javascript
// ❌ ERRADO - sem timeout, vai travar se servidor cair
const response = await fetch(url, options);
```

**Solução**:
```javascript
// ✅ CORRETO - com timeout de 10s
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10000);

try {
  const response = await fetch(url, {
    ...options,
    signal: controller.signal
  });
  clearTimeout(timeout);
  return response;
} catch (err) {
  if (err.name === 'AbortError') {
    throw new Error('Requisição expirou (timeout)');
  }
  throw err;
}
```

**Impacto**: ❌ **Usuários veem "carregando..." por tempo indefinido**

---

### 3. **Senha Temporária Hardcoded** 🚨
**Severidade**: 🔴 CRÍTICA  
**Risco**: Qualquer pessoa com acesso ao código pode fazer login

**Encontrado em**: Procurar por strings como:
- `demo-token`
- `password123`
- Credenciais de teste

**Solução**: Usar variáveis de ambiente e seeder seguro para testes

---

## 🟡 IMPORTANTE (Deve Arrumar Antes de Deploy)

### 4. **Console.log em Production** ⚠️
**Quantidade**: 13 console statements  
**Severidade**: 🟡 MÉDIA  
**Risco**: Vazamento de informações, debug lento

**Exemplos encontrados**:
```javascript
// ❌ ERRADO
console.log('✅ Conectado ao chat');
console.log('📜 Histórico recebido:', data.messages.length);
console.log('Nova avaliação:', ratingData);
```

**Solução**:
```javascript
// ✅ CORRETO - apenas em dev
if (process.env.NODE_ENV === 'development') {
  console.log('✅ Conectado ao chat');
}
```

**Impacto**: ⚠️ **Informações vazam no console do navegador**

---

### 5. **localStorage Sem Validação** ⚠️
**Quantidade**: 48 chamadas localStorage  
**Severidade**: 🟡 MÉDIA  
**Risco**: XSS, dados corrompidos, perda de dados

**Exemplo de risco**:
```javascript
// ❌ RISCO: Pode conter dados JSON malformados
const user = JSON.parse(localStorage.getItem('user'));
// Se adversário injeta: localStorage.setItem('user', 'INVÁLIDO')
// Vai dar erro e quebrar a app
```

**Solução**:
```javascript
// ✅ CORRETO - com validação
try {
  const userData = localStorage.getItem('auth_user');
  if (!userData) return null;
  
  const user = JSON.parse(userData);
  // Validar schema
  if (!user.id || !user.email) {
    throw new Error('User data malformed');
  }
  return user;
} catch (err) {
  console.error('Failed to restore user:', err);
  localStorage.removeItem('auth_user');
  return null;
}
```

**Impacto**: ⚠️ **App pode quebrar se localStorage for corrompido**

---

### 6. **TODOs Incompletos** ⚠️
**Quantidade**: 2 TODOs  
**Severidade**: 🟡 MÉDIA  
**Risco**: Features incompletas, behavior inesperado

**Encontrados em** [src/pages/agendar-updated.jsx](src/pages/agendar-updated.jsx):
- Line 42: `// TODO: Usar ID do usuário logado (from context/localStorage)`
- Line 45: `// TODO: Permitir seleção de hora`

**Problema**: 
```javascript
const booking = {
  userId: 1, // ❌ HARDCODED! Vai agendar como usuário 1 sempre
  time: '10:00', // ❌ HARDCODED! Sem input do usuário
};
```

**Impacto**: ⚠️ **Todos os agendamentos vão pro usuário 1, hora fixa**

---

## 🟢 MEDIUM (Melhorar Quando Possível)

### 7. **Error Handling Inconsistente** ⚠️
**Quantidade**: 15+ funções sem try-catch  
**Severidade**: 🟡 MÉDIA  
**Risco**: Crashes silenciosos, debugging difícil

**Exemplo**:
```javascript
// ❌ ERRADO - sem try-catch
const data = JSON.parse(apiResponse);
const user = data.users[0];
user.email.toLowerCase(); // Pode dar erro se fields não existem
```

**Solução**:
```javascript
// ✅ CORRETO - defensivo
try {
  const data = JSON.parse(apiResponse);
  const user = data?.users?.[0];
  if (!user?.email) throw new Error('Invalid user data');
  return user.email.toLowerCase();
} catch (err) {
  console.error('Failed to parse user:', err);
  return null;
}
```

**Impacto**: ⚠️ **Comportamento inesperado, erros não documentados**

---

### 8. **Falta Validação de Input** ⚠️
**Quantidade**: ~15 campos sem validação  
**Severidade**: 🟡 MÉDIA  
**Risco**: SQL Injection, XSS, dados inválidos

**Exemplo de risco**:
```javascript
// ❌ RISCO: Sem validação
const booking = {
  serviceName: userInput,  // Pode ser: "<script>alert('XSS')</script>"
  budget: userBudget,      // Pode ser: NaN ou "abc"
  email: userEmail         // Pode ser: "not-an-email"
};

// Envia diretamente pro backend
await sendBooking(booking);
```

**Solução**:
```javascript
// ✅ CORRETO - validar tudo
const schema = z.object({
  serviceName: z.string().min(3).max(100),
  budget: z.number().positive(),
  email: z.string().email()
});

const validated = schema.parse(userInput);
await sendBooking(validated);
```

**Impacto**: ⚠️ **Dados inválidos persistem no banco**

---

## 📋 Matriz de Impacto vs Esforço

```
IMPACTO
   ▲
   │
 5 │  ❌ Hardcoded URLs      ❌ Timeout
   │     (CRÍTICO)            (CRÍTICO)
   │
 4 │  ❌localStorage XSS    
   │     (ALTO)
   │
 3 │  ⚠️ console.log    ⚠️ TODOs
   │    ⚠️ Validação
   │
 2 │  ⚠️ Error Handling
   │
 1 │
   │──────────────────────────────────▶ ESFORÇO
     1    2    3    4    5

QUADRANTES:
🔴 Alto Impacto + Baixo Esforço  → Fazer YA!
🟡 Médio Impacto → Priorizar
🟢 Baixo Impacto → Deixar
```

---

## ✅ Plano de Correção

### Phase 1: CRÍTICO (2h)
```bash
# 1. Criar .env.local com variáveis
REACT_APP_API_URL=https://api.seu-dominio.com
[REDACTED_TOKEN]=production

# 2. Remover localhost hardcoded (usar process.env)
# Arquivos: AuthContext, agendar-updated, analytics-dashboard

# 3. Adicionar AbortController com timeout
# Em cada fetch(), adicionar timeout de 30s

# 4. Implementar TODOs do agendar
# Buscar userId from AuthContext
# Adicionar TimePicker component
```

### Phase 2: IMPORTANTE (1.5h)
```bash
# 5. Remover console.log (manter apenas console.error/warn)
# npm run lint -- --fix

# 6. Adicionar validação localStorage
# Criar: src/utils/storageValidator.js

# 7. Melhorar error handling
# Envolver Promise.all() com try-catch
```

### Phase 3: NICE-TO-HAVE (1h)
```bash
# 8. Adicionar validação input (Zod/Joi)
# 9. Rate limiting nas API calls
# 10. Circuit breaker para API timeouts
```

---

## 🛠️ Como Arrumar (Passo a Passo)

### **Fix #1: Remover Hardcoded URLs** (30 min)

**Criar `.env.local`**:
```env
# Backend API
REACT_APP_API_URL=http://localhost:3001
[REDACTED_TOKEN]=30000

# Environment
[REDACTED_TOKEN]=development
REACT_APP_DEBUG=true
```

**Criar arquivo de config** `src/config/api.js`:
```javascript
export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  timeout: parseInt(process.env.[REDACTED_TOKEN] || '30000'),
  headers: {
    'Content-Type': 'application/json'
  }
};

export async function apiCall(endpoint, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
  
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
      ...options,
      headers: { ...API_CONFIG.headers, ...options.headers },
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

**Usar em components**:
```javascript
// ❌ ANTES
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  body: JSON.stringify(...)
});

// ✅ DEPOIS
import { apiCall } from '@/config/api';
const data = await apiCall('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify(...)
});
```

---

### **Fix #2: Remover console.log** (20 min)

**Script automático**:
```bash
# Remover console.log (manter console.error/warn)
find src -name "*.jsx" -type f -exec sed -i '/console\.log\|console\.info/d' {} \;

# Ou de forma mais segura:
npm run lint -- --fix
```

---

### **Fix #3: localStorage com Validação** (25 min)

**Criar `src/utils/storage.js`**:
```javascript
export const StorageManager = {
  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (err) {
      console.error(`Failed to save ${key}:`, err);
      return false;
    }
  },

  get(key, schema = null) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      
      // Validar com schema se providenciado
      if (schema) {
        return schema.parse(parsed);
      }
      
      return parsed;
    } catch (err) {
      console.error(`Failed to read ${key}:`, err);
      this.remove(key); // Limpar dado corrompido
      return null;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (err) {
      console.error(`Failed to remove ${key}:`, err);
      return false;
    }
  }
};
```

---

## 📊 Checklist de Correção

- [ ] **CRÍTICO #1**: Remover hardcoded URLs (16 ocorrências)
  - [ ] Criar `.env.local` com `REACT_APP_API_URL`
  - [ ] Criar `src/config/api.js` com `apiCall()` helper
  - [ ] Atualizar AuthContext
  - [ ] Atualizar agendar-updated.jsx
  - [ ] Atualizar analytics-dashboard.jsx

- [ ] **CRÍTICO #2**: Adicionar Timeout em fetch (5+ ocorrências)
  - [ ] Implementar `AbortController` em `apiCall()`
  - [ ] Testar timeout de 10s

- [ ] **CRÍTICO #3**: Implementar TODOs (2 itens)
  - [ ] Usar `useAuth()` para userId
  - [ ] Adicionar TimePicker component

- [ ] **IMPORTANTE #4**: Remover console.log (13 ocorrências)
  - [ ] Remover em `ChatWindow.jsx`
  - [ ] Remover em `AdminDashboard.jsx`
  - [ ] Remover em `QuickRating.jsx`

- [ ] **IMPORTANTE #5**: localStorage com Validação
  - [ ] Criar `StorageManager` em `src/utils/storage.js`
  - [ ] Atualizar `AuthContext` para usar `StorageManager`
  - [ ] Adicionar schema validation com Zod

- [ ] **IMPORTANTE #6**: Melhorar Error Handling
  - [ ] Envolver Promise.all() com try-catch
  - [ ] Adicionar fallback UI para erros

- [ ] **NICE-TO-HAVE #7**: Input Validation
  - [ ] Adicionar Zod schemas
  - [ ] Validar dados antes de enviar

- [ ] **NICE-TO-HAVE #8**: Rate Limiting
  - [ ] Implementar debounce nas calls
  - [ ] Circuit breaker para timeouts

---

## 🎯 Recomendação

**Priority**: 🚨 Fazer Fase 1 (CRÍTICO) HOJE antes de qualquer deploy

**Tempo estimado**: 2 horas para todos os 3 CRÍTICOS

**Risk se não fizer**: ❌ **Aplicação quebra em produção**

---

## 📞 Exemplo Rápido: Antes vs Depois

### Arquivo: `src/context/AuthContext.jsx`

**ANTES (❌ Quebra em prod)**:
```javascript
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(credentials)
});
```

**DEPOIS (✅ Funciona em qualquer servidor)**:
```javascript
import { apiCall } from '@/config/api';

const data = await apiCall('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify(credentials)
});
```

---

**Data**: 8 de Fevereiro de 2026  
**Status**: 🚨 Requer correção antes de produção

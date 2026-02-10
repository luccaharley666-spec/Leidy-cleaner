# 🔍 LISTA COMPLETA DE PROBLEMAS ENCONTRADOS

## 🔴 CRÍTICOS (Impedem execução)

### 1. **Arquivo não existe: `/routes/v2/api.js`**
- Linha: `backend/src/routes/v2/index.js:15`
- Erro: `const mainRoutes = require('./api');`
- Solução: Importar correto é `require('../api')`

### 2. **Arquivo não existe: `/routes/v1/index.js` tenta importar `./api`**
- Linha: `backend/src/routes/v1/index.js:11`
- Erro: `const mainRoutes = require('./api');`
- Solução: Deve ser `require('../api')`

### 3. **console.log/console.error sem logger em produção**
- Arquivos afetados: 80+ arquivos
- Exemplo: `backend/src/config/envValidator.js:65` - `console.log('✅ Environment variables validated')`
- Impacto: Log não estruturado, sem correlação de requestId
- Solução: Usar `logger` em vez de `console.*`

### 4. **TODO comentário não implementado em [REDACTED_TOKEN]**
- Arquivo: `backend/src/services/[REDACTED_TOKEN].js:142`
- Código: `// TODO: Implementar chamada real à API do banco`
- Impacto: `checkBankStatus()` usa simulated mock, não real API
- Solução: Integrar com API real do banco

### 5. **[REDACTED_TOKEN] tem TODO não implementado**
- Arquivo: `backend/src/services/[REDACTED_TOKEN].js:176`
- Código: `// TODO: Implementar lógica de envio de notificações pendentes`
- Impacto: Job `[REDACTED_TOKEN]` não faz nada real
- Solução: Implementar integração com NotificationService

---

## 🟡 IMPORTANTES (Features incompletas)

### 6. **Swagger/OpenAPI não integrado com rotas reais**
- Arquivo: `backend/src/config/swagger.js:95`
- Problema: `apis: ['./src/routes/**/*.js', './src/controllers/**/*.js']`
- Impacto: Swagger não encontra definições `@swagger` tags nos arquivos
- Solução: Adicionar comentários JSDoc com `@swagger` em todas as rotas

### 7. **DTOs não usados em rotas existentes**
- Arquivo: `backend/src/dto/index.js` - criado mas não integrado
- Problema: Rotas em `api.js` usam validação manual, não DTOs
- Impacto: Validação inconsistente entre endpoints
- Solução: Refatorar rotas para usar `dtoMiddleware()`

### 8. **Prometheus metrics não coleta dados reais**
- Arquivo: `backend/src/config/prometheus.js`
- Problema: Métricas criadas mas nunca incrementadas
- Impacto: `/metrics` retorna zeros
- Solução: Chamar `metrics.recordPixPayment()` em PixPaymentService, etc

### 9. **Versionamento (v1/v2) não completamente integrado**
- Arquivo: `backend/src/index.js:126`
- Problema: Rotas importadas diretamente (`app.use('/api', apiRoutes)`)
- Solução: Deve ser `app.use('/api', versioningRouter)` que distribui para v1/v2

### 10. **Zod envValidator não validar em teste**
- Arquivo: `backend/src/config/envValidator.js`
- Problema: Lança erro se env inválida, quebra testes
- Impacto: Em CI, npm test falha se .env incompleto
- Solução: Retornar mock/defaults em NODE_ENV=test

---

## 🟠 MELHORIAS (Qualidade de código)

### 11. **Imports de arquivo não existem**
- `backend/src/routes/v2/index.js`: Tenta importar `./api`
- `backend/src/routes/v1/index.js`: Tenta importar `./api`
- Correção: Ambos devem importar `'../api'`

### 12. **console.log espalhados em 80+ arquivos**
- Serviços, Controllers, Middlewares usam `console.*` diretamente
- Devem usar: `const logger = require('../utils/logger'); logger.info()...`
- Arquivos afetados:
  - [REDACTED_TOKEN] (5x console.error)
  - PixPaymentService (6x console.error/log)
  - TwilioService (4x console.log/error)
  - RetryQueueService (9x console.log/error)
  - [REDACTED_TOKEN] (12x console.log/error)
  - [REDACTED_TOKEN] (8x console.log/error)
  - Muitos outros...

### 13. **Duplicado: Múltiplos arquivos swagger**
- `backend/src/config/swagger.js` (novo)
- `backend/src/config/swaggerConfig.js` (antigo)
- `backend/src/config/swagger-config.js` (antigo)
- `backend/src/routes/swagger.js` (antigo)
- Solução: Manter apenas `swagger.js`, deletar duplicados

### 14. **Duplicado: Múltiplos TwoFactor services**
- `backend/src/services/[REDACTED_TOKEN].js` (novo)
- `backend/src/services/TwoFactorService.js` (antigo)
- `backend/src/middleware/twoFactorAuth.js` (middleware duplicado)
- Solução: Consolidar em [REDACTED_TOKEN], deletar duplicados

### 15. **Error Handler não implementado em todas rotas**
- Problema: Muitas rotas têm `try/catch` manual com `res.status(500).json()`
- Exemplo: `backend/src/controllers/[REDACTED_TOKEN].js` línies 35, 62, 103...
- Solução: Usar `asyncHandler()` wrapper para centralizar erros

### 16. **Middleware ordering em index.js**
- Swagger inicializado antes de rotas (lines 230)
- GlobalErrorHandler deve ser ÚLTIMO (line 233)
- Prometheus metrics devem ser ANTERIOR a rotas (line 229)
- Ordem correta: 1. Validação → 2. Logging → 3. Cors → 4. Swagger → 5. Rotas → 6. ErrorHandler (404) → 7. GlobalError

### 17. **WebSocketService sem autenticação real**
- Arquivo: `backend/src/services/WebSocketService.js:17`
- Problema: `const decoded = jwt.verify(token, process.env.JWT_SECRET);`
- Impacto: JWT_SECRET pode estar undefined
- Solução: Validar envValidator mais cedo

### 18. **EncryptionService ENCRYPTION_KEY não validada**
- Arquivo: `backend/src/services/EncryptionService.js:5`
- Problema: `.slice(0, 32)` se ENCRYPTION_KEY < 32 chars, encriptação fraca
- Impacto: Criptografia pode ser insegura em produção
- Solução: Exigir ENCRYPTION_KEY=64 chars em envValidator

### 19. **No jest timeout configurado para testes E2E**
- Arquivo: `backend/e2e/pix-payment.spec.ts`
- Problema: Testes podem timeout se servidor lento
- Solução: Adicionar `test.setTimeout(30000)` nos testes

### 20. **Prometheus no porta não configurável**
- Arquivo: `backend/src/config/prometheus.js`
- Problema: `/metrics` endpoint fixo, sem env var
- Solução: `const METRICS_PORT = process.env.METRICS_PORT || 9090`

---

## ✅ RESUMO POR SEVERIDADE

| Severidade | Quantidade | Solução |
|-----------|-----------|---------|
| 🔴 CRÍTICO | 5 | Corrigir imports + console.log + TODOs |
| 🟡 IMPORTANTE | 5 | Integração Swagger/DTOs/Metrics/Versioning |
| 🟠 MELHORIA | 10 | Refatoração e consolidação |
| **TOTAL** | **20** | |

---

## 📋 AÇÕES RECOMENDADAS (Ordem de Prioridade)

1. **Corrigir imports v1/v2** ⚠️ Bloqueia startup
2. **Remover console.log, usar logger** ⚠️ Logs perdidos em produção
3. **Consolidar duplicados (Swagger, TwoFactor)** ⚠️ Confusão de manutenção
4. **Implementar TODOs** (API banco, notificações) ⚠️ Features incompletas
5. **Refatorar rotas com asyncHandler** ⚠️ Error handling inconsistente
6. **Integrar Swagger/DTOs/Metrics** 🔧 Melhoria de observabilidade

---

**Data**: 2026-02-10  
**Encontrados por**: Análise automática  
**Status**: Aguardando correção

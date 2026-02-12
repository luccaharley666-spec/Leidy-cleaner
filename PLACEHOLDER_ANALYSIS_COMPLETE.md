# Análise Completa de PLACEHOLDERs em Arquivos de Teste

**Data:** 12 de Fevereiro de 2026  
**Workspace:** `/workspaces/acabamos/backend`  
**Total de Arquivos com PLACEHOLDERS:** 21 arquivos  
**Total de Ocorrências:** 129+ ocorrências

---

## 📋 RESUMO EXECUTIVO

Foram encontrados **PLACEHOLDERs em 5 categorias principais:**

### 1. **Mock Methods (db.get, db.run, db.all)** - ~40 ocorrências
   - **Padrão encontrado:** `db.get.__PLACEHOLDER(...)`, `db.run.__PLACEHOLDER(...)`, `db.all.__PLACEHOLDER(...)`
   - **Correção:** Usar `.mockImplementation()` para implementação adicional

### 2. **Jest Matchers (expect)** - ~60 ocorrências
   - **Padrão encontrado:** `expect(x).__PLACEHOLDER(y)`
   - **Correção:** Usar matcher correto como `.toBe()`, `.toHaveBeenCalledWith()`, etc.

### 3. **Service Methods** - ~15 ocorrências
   - **Padrão encontrado:** `serviceInstance.__PLACEHOLDER()` ou `ServiceClass.__PLACEHOLDER()`
   - **Correção:** Usar método real do serviço

### 4. **Environment Variables** - 1 ocorrência
   - **Padrão encontrado:** `process.env.__PLACEHOLDER`
   - **Correção:** Usar nome da variável real

### 5. **Descrever de Testes** - 3+ ocorrências
   - **Padrão encontrado:** `describe('PLACEHOLDER', () => { ... })`
   - **Correção:** Usar nome descritivo do bloco de teste

---

## 🔍 ANÁLISE DETALHADA POR ARQUIVO

### **1. PaymentIntegrationService.test.js** (2 ocorrências)

| Linha | Contexto | Tipo | Correção Recomendada |
|-------|----------|------|----------------------|
| 129 | `PixService.confirmPayment.__PLACEHOLDER({ success: true });` | Mock Setup | `.mockResolvedValue({ success: true })` |
| 142 | `expect(PixService.confirmPayment).__PLACEHOLDER('pix_123', 'bank_456');` | Jest Matcher | `.toHaveBeenCalledWith('pix_123', 'bank_456')` |

---

### **2. NotificationService.test.js** (7 ocorrências)

| Linha | Contexto | Tipo | Correção Recomendada |
|-------|----------|------|----------------------|
| 148 | `mockDb.get.__PLACEHOLDER(booking);` | Mock Setup | `.mockResolvedValue(booking)` |
| 149 | `mockDb.get.__PLACEHOLDER({...});` | Mock Setup | `.mockResolvedValueOnce({...})` após anterior |
| 179 | `mockDb.get.__PLACEHOLDER(booking);` | Mock Setup | `.mockResolvedValue(booking)` |
| 180 | `mockDb.get.__PLACEHOLDER({...});` | Mock Setup | `.mockResolvedValueOnce({...})` |
| 204 | `await notificationService.__PLACEHOLDER('+5551987654321', paymentDetails);` | Service Method | `.sendPaymentLink('+5551987654321', paymentDetails)` |
| 218 | `await notificationService.__PLACEHOLDER('+5551987654321', paymentDetails);` | Service Method | `.sendPaymentConfirmation('+5551987654321', paymentDetails)` |
| 229 | `await notificationService.__PLACEHOLDER('+5551987654321', referralCode, referralLink);` | Service Method | `.sendReferralLink('+5551987654321', referralCode, referralLink)` |

**Nota:** As linhas 204, 218, 229 têm `describe('PLACEHOLDER', ...)` que também precisa de nomes reais.

---

### **3. PixService.test.js** (4 ocorrências)

| Linha | Contexto | Tipo | Correção Recomendada |
|-------|----------|------|----------------------|
| 192 | `const mai = PixService.__PLACEHOLDER(pixKey);` | Service Method | `.PixService._mai(pixKey)` |
| 200 | `const adf = PixService.__PLACEHOLDER('Teste descrição', 'REF123');` | Service Method | `.PixService._adf('Teste descrição', 'REF123')` |
| 206 | `const adf = PixService.__PLACEHOLDER('', 'REF123');` | Service Method | `.PixService._adf('', 'REF123')` |
| 212 | `const adf = PixService.__PLACEHOLDER('Descrição', '');` | Service Method | `.PixService._adf('Descrição', '')` |

---

### **4. critical-services.test.js** (6 ocorrências)

| Linha | Contexto | Tipo | Correção Recomendada |
|-------|----------|------|----------------------|
| 79 | `const isValid = PixPaymentService.__PLACEHOLDER(body, signature, secret);` | Service Method | `.PixPaymentService.validateWebhookSignature(body, signature, secret)` |
| 84 | `const isValid = PixPaymentService.__PLACEHOLDER(...);` | Service Method | `.PixPaymentService.validateWebhookSignature(...)` |
| 222 | `expect(RetryQueueService.calculateDelay(1)).__PLACEHOLDER(1000);` | Jest Matcher | `.toBe(1000)` |
| 223 | `expect(RetryQueueService.calculateDelay(2)).__PLACEHOLDER(2000);` | Jest Matcher | `.toBe(2000)` |
| 224 | `expect(RetryQueueService.calculateDelay(3)).__PLACEHOLDER(4000);` | Jest Matcher | `.toBe(4000)` |
| 251 | `expect(processed.total).__PLACEHOLDER(0);` | Jest Matcher | `.toBe(0)` ou `.toEqual(0)` |

---

### **5. MonitoringService.test.js** (3 ocorrências)

| Linha | Contexto | Tipo | Correção Recomendada |
|-------|----------|------|----------------------|
| 122 | `db.all.__PLACEHOLDER((sql, params, callback) => { ... })` | Mock Implementation | `.mockImplementation((sql, params, callback) => { ... })` |
| 302 | `db.run.__PLACEHOLDER((sql, params, callback) => { ... })` | Mock Implementation | `.mockImplementation((sql, params, callback) => { ... })` |
| 313 | `db.all.__PLACEHOLDER((sql, params, callback) => { ... })` | Mock Implementation | `.mockImplementation((sql, params, callback) => { ... })` |

---

### **6. middleware.test.js** (1 ocorrência)

| Linha | Contexto | Tipo | Correção Recomendada |
|-------|----------|------|----------------------|
| 295 | `expect(elapsed).__PLACEHOLDER(0);` | Jest Matcher | `.toBeGreaterThan(0)` |

---

### **7. EmailService.test.js** (15 ocorrências)

| Linha | Contexto | Tipo | Correção Recomendada |
|-------|----------|------|----------------------|
| 40 | `expect(typeof emailService.__PLACEHOLDER).toBe('function');` | Service Method | `.sendBookingConfirmation` |
| 67, 77, 96, 107, 115, 123, 162, 172, 183, 277, 285, 300, 313, 323, 333, 343, 355 | `await emailService.__PLACEHOLDER(clientEmail, clientName, bookingData);` | Service Method | `.sendBookingConfirmation(clientEmail, clientName, bookingData)` |

---

### **8. BookingController.test.js** (5 ocorrências)

| Linha | Contexto | Tipo | Correção Recomendada |
|-------|----------|------|----------------------|
| 18 | `expect(res.status).__PLACEHOLDER(400);` | Jest Matcher | `.toHaveBeenCalledWith(400)` |
| 38 | `expect(res.status).__PLACEHOLDER(404);` | Jest Matcher | `.toHaveBeenCalledWith(404)` |
| 39 | `expect(res.json).__PLACEHOLDER(expect.objectContaining(...))` | Jest Matcher | `.toHaveBeenCalledWith(expect.objectContaining(...))` |
| 53 | `expect(res.status).__PLACEHOLDER(400);` | Jest Matcher | `.toHaveBeenCalledWith(400)` |
| 78 | `expect(res.json).__PLACEHOLDER(expect.objectContaining(...))` | Jest Matcher | `.toHaveBeenCalledWith(expect.objectContaining(...))` |

---

### **9. PhotosController.test.js** (9 ocorrências)

| Linha | Contexto | Tipo | Correção Recomendada |
|-------|----------|------|----------------------|
| 17 | `expect(res.status).__PLACEHOLDER(400);` | Jest Matcher | `.toHaveBeenCalledWith(400)` |
| 18 | `expect(res.json).__PLACEHOLDER(expect.objectContaining(...))` | Jest Matcher | `.toHaveBeenCalledWith(expect.objectContaining(...))` |
| 32 | `expect(res.status).__PLACEHOLDER(404);` | Jest Matcher | `.toHaveBeenCalledWith(404)` |
| 33 | `expect(res.json).__PLACEHOLDER(expect.objectContaining(...))` | Jest Matcher | `.toHaveBeenCalledWith(expect.objectContaining(...))` |
| 39, 40 | `.__PLACEHOLDER({ rows: [...] })` | Mock Implementation | `.mockResolvedValueOnce({ rows: [...] })` |
| 49 | `expect(res.status).__PLACEHOLDER(403);` | Jest Matcher | `.toHaveBeenCalledWith(403)` |
| 50 | `expect(res.json).__PLACEHOLDER(expect.objectContaining(...))` | Jest Matcher | `.toHaveBeenCalledWith(expect.objectContaining(...))` |
| 56, 57 | `.__PLACEHOLDER({ rows: [...] })` | Mock Implementation | `.mockResolvedValueOnce({ rows: [...] })` |
| 66 | `expect(res.json).__PLACEHOLDER(expect.objectContaining(...))` | Jest Matcher | `.toHaveBeenCalledWith(expect.objectContaining(...))` |

---

### **10. PaymentController.test.js** (6 ocorrências)

| Linha | Contexto | Tipo | Correção Recomendada |
|-------|----------|------|----------------------|
| 118, 251, 286, 389, 405, 421 | `db.get.__PLACEHOLDER(...)` ou `db.run.__PLACEHOLDER(...)` | Mock Implementation | `.mockImplementation((sql, params, callback) => { ... })` |

---

### **11. NewsletterController.test.js** (3 ocorrências)

| Linha | Contexto | Tipo | Correção Recomendada |
|-------|----------|------|----------------------|
| 70, 79, 105 | `expect(mockResponse.status).__PLACEHOLDER(400);` | Jest Matcher | `.toHaveBeenCalledWith(400)` |

---

### **12. NotificationController.test.js** (3 ocorrências)

| Linha | Contexto | Tipo | Correção Recomendada |
|-------|----------|------|----------------------|
| 206, 313, 337 | `db.get/run/all.__PLACEHOLDER(...)` | Mock Implementation | `.mockImplementation(...)` |

---

### **13. AdminController.test.js** (4 ocorrências)

| Linha | Contexto | Tipo | Correção Recomendada |
|-------|----------|------|----------------------|
| 233, 357, 370, 385 | `db.get.__PLACEHOLDER(...)` ou `db.all.__PLACEHOLDER(...)` | Mock Implementation | `.mockImplementation(...)` |

---

### **14. ReviewController.test.js** (6 ocorrências)

| Linha | Contexto | Tipo | Correção Recomendada |
|-------|----------|------|----------------------|
| 257, 271, 307, 323, 370, 389 | `db.get/run/all.__PLACEHOLDER(...)` | Mock Implementation | `.mockImplementation(...)` |

---

### **15. profile.integration.test.js** (5 ocorrências)

| Linha | Contexto | Tipo | Correção Recomendada |
|-------|----------|------|----------------------|
| 189 | `expect(routes.length).__PLACEHOLDER(7);` | Jest Matcher | `.toBe(7)` |
| 232 | `expect(getRoutes.length).__PLACEHOLDER(4);` | Jest Matcher | `.toBe(4)` |
| 240 | `expect(putRoutes.length).__PLACEHOLDER(2);` | Jest Matcher | `.toBe(2)` |
| 248 | `expect(postRoutes.length).__PLACEHOLDER(1);` | Jest Matcher | `.toBe(1)` |
| 256 | `expect(deleteRoutes.length).__PLACEHOLDER(1);` | Jest Matcher | `.toBe(1)` |

---

### **16. NotificationsController.test.js** (5 ocorrências)

| Linha | Contexto | Tipo | Correção Recomendada |
|-------|----------|------|----------------------|
| 6 | `delete process.env.__PLACEHOLDER;` | Env Variable | `.delete process.env.NOTIFICATION_SERVICE_URL;` (ou similar) |
| 21 | `expect(res.status).__PLACEHOLDER(400);` | Jest Matcher | `.toHaveBeenCalledWith(400)` |
| 35 | `expect(res.status).__PLACEHOLDER(400);` | Jest Matcher | `.toHaveBeenCalledWith(400)` |
| 36 | `expect(res.json).__PLACEHOLDER(expect.objectContaining(...))` | Jest Matcher | `.toHaveBeenCalledWith(expect.objectContaining(...))` |
| 62 | `expect(res.json).__PLACEHOLDER(expect.objectContaining(...))` | Jest Matcher | `.toHaveBeenCalledWith(expect.objectContaining(...))` |

---

### **17. Factory.test.js** (2 ocorrências)

| Linha | Contexto | Tipo | Correção Recomendada |
|-------|----------|------|----------------------|
| 69 | `postgresModule.initializePool.__PLACEHOLDER(() => { ... })` | Mock Implementation | `.mockImplementation(() => { ... })` |
| 254 | `postgresModule.initializePool.__PLACEHOLDER(() => { ... })` | Mock Implementation | `.mockImplementation(() => { ... })` |

---

### **18. utils.test.js** (1 ocorrência)

| Linha | Contexto | Tipo | Correção Recomendada |
|-------|----------|------|----------------------|
| 240 | `expect(value).__PLACEHOLDER(min);` | Jest Matcher | `.toBeLessThanOrEqual(min)` ou `.toBeGreaterThanOrEqual(min)` (context dependent) |

---

### **19. Validation.test.js** (17 ocorrências)

| Linha | Contexto | Tipo | Correção Recomendada |
|-------|----------|------|----------------------|
| 171, 186, 200, 215, 235, 267, 299, 331, 342, 376, 390, 405, 420, 434, 465, 480, 495, 539, 554, 569 | `expect(res.status).__PLACEHOLDER(400);` | Jest Matcher | `.toHaveBeenCalledWith(400)` |

---

### **20. RoutingService.test.js** (13 ocorrências)

| Linha | Contexto | Tipo | Correção Recomendada |
|-------|----------|------|----------------------|
| 32, 40, 41, 90, 94, 97, 102, 105, 112, 116, 120, 125, 126, 131, 132 | `RoutingService.__PLACEHOLDER` | Service Method | `.sortBookings`, `.checkTimeGap`, `.notifyTeam` (context dependent) |

---

### **21. integration-tests.test.js** (2 ocorrências)

| Linha | Contexto | Tipo | Correção Recomendada |
|-------|----------|------|----------------------|
| 80 | `expect(price).__PLACEHOLDER(minimum);` | Jest Matcher | `.toBeGreaterThanOrEqual(minimum)` |
| 242 | `expect(price).__PLACEHOLDER(minimum);` | Jest Matcher | `.toBeGreaterThanOrEqual(minimum)` |

---

## 📊 CATEGORIZAÇÃO POR TIPO DE CORREÇÃO

### **A. Jest Matchers (~60 ocorrências)**

#### Padrão 1: `expect(value).__PLACEHOLDER(expected)`
```javascript
// Encontrado em múltiplos arquivos
expect(res.status).__PLACEHOLDER(400)

// Correção
expect(res.status).toHaveBeenCalledWith(400)
```

#### Padrão 2: `expect(mock).__PLACEHOLDER(args)`
```javascript
// Encontrado em múltiplos arquivos
expect(PixService.confirmPayment).__PLACEHOLDER('arg1', 'arg2')

// Correção
expect(PixService.confirmPayment).toHaveBeenCalledWith('arg1', 'arg2')
```

#### Padrão 3: `expect(value).__PLACEHOLDER(value)`
```javascript
// Encontrado
expect(result).__PLACEHOLDER(1000)

// Correção
expect(result).toBe(1000)
```

#### Padrão 4: `expect(condition).__PLACEHOLDER(value)`
```javascript
// Encontrado
expect(elapsed).__PLACEHOLDER(0)

// Correção
expect(elapsed).toBeGreaterThan(0)
```

---

### **B. Mock Implementations (~40 ocorrências)**

#### Padrão 1: Set Return Value
```javascript
// Encontrado
db.get.__PLACEHOLDER(booking)

// Correção
db.get.mockResolvedValue(booking)
// ou para múltiplas chamadas:
db.get.mockResolvedValueOnce(booking)
```

#### Padrão 2: Custom Implementation
```javascript
// Encontrado
db.all.__PLACEHOLDER((sql, params, callback) => { callback(null, []); })

// Correção
db.all.mockImplementation((sql, params, callback) => { callback(null, []); })
```

#### Padrão 3: Chain Multiple Mocks
```javascript
// Encontrado
mockQuery
  .__PLACEHOLDER({ rows: [...] })
  .__PLACEHOLDER({ rows: [...] })

// Correção
mockQuery
  .mockResolvedValueOnce({ rows: [...] })
  .mockResolvedValueOnce({ rows: [...] })
```

---

### **C. Service Methods (~15 ocorrências)**

#### PixService Methods
```javascript
// Encontrado
PixService.__PLACEHOLDER(pixKey)  // linha 192

// Correção (verificar no código)
PixService._mai(pixKey)
```

```javascript
// Encontrado
PixService.__PLACEHOLDER('desc', 'ref')  // linhas 200, 206, 212

// Correção
PixService._adf('desc', 'ref')
```

#### PixPaymentService Methods
```javascript
// Encontrado
PixPaymentService.__PLACEHOLDER(body, signature, secret)  // linhas 79, 84

// Correção
PixPaymentService.validateWebhookSignature(body, signature, secret)
```

#### NotificationService Methods
```javascript
// Encontrado
notificationService.__PLACEHOLDER(phone, details)  // linha 204

// Correção
notificationService.sendPaymentLink(phone, details)
```

```javascript
// Encontrado
notificationService.__PLACEHOLDER(phone, details)  // linha 218

// Correção
notificationService.sendPaymentConfirmation(phone, details)
```

```javascript
// Encontrado
notificationService.__PLACEHOLDER(phone, code, link)  // linha 229

// Correção
notificationService.sendReferralLink(phone, code, link)
```

#### EmailService Methods
```javascript
// Encontrado
emailService.__PLACEHOLDER(email, name, bookingData)  // múltiplas linhas

// Correção
emailService.sendBookingConfirmation(email, name, bookingData)
```

#### RoutingService Methods
```javascript
// Encontrado (linhas 32, 40, 41)
RoutingService.__PLACEHOLDER.mockReturnValue(bookings)
RoutingService.__PLACEHOLDER(bookings)

// Correção
RoutingService.sortBookings (ou método real)
```

```javascript
// Encontrado (linhas 90, 94, 97, 102, 105)
RoutingService.__PLACEHOLDER(booking1, booking2, 30)

// Correção
RoutingService.checkTimeGap(booking1, booking2, 30)
```

```javascript
// Encontrado (linhas 112, 116, 120, 125, 126, 131, 132)
await RoutingService.__PLACEHOLDER(teamId, itinerary)

// Correção
await RoutingService.notifyTeam(teamId, itinerary)
```

---

### **D. Environment Variables (1 ocorrência)**

```javascript
// Encontrado
delete process.env.__PLACEHOLDER  // linha 6, NotificationsController.test.js

// Correção (precisa de contexto)
delete process.env.SOME_ENV_VAR_NAME
```

---

### **E. Test Descriptors (3+ ocorrências)**

```javascript
// Encontrado em NotificationService.test.js (linhas 197, 209, 224)
describe('PLACEHOLDER', () => {
  it('deve enviar link de pagamento por WhatsApp', async () => {
    ...
  });
});

// Correção
describe('sendPaymentLink', () => {
  // ou
describe('sendPaymentConfirmation', () => {
  // ou
describe('sendReferralLink', () => {
```

---

## ✅ SUMMARY TABLE

| Tipo | Quantidade | Criticidade | Exemplos de Correção |
|------|-----------|-------------|----------------------|
| Jest Matchers | ~60 | ⚠️ ALTA | `.toHaveBeenCalledWith()`, `.toBe()`, `.toBeGreaterThan()` |
| Mock Return Values | ~25 | 🔴 CRÍTICA | `.mockResolvedValue()`, `.mockReturnValue()` |
| Mock Implementations | ~15 | 🔴 CRÍTICA | `.mockImplementation()` |
| Service Methods | ~15 | 🔴 CRÍTICA | Usar nome real do método |
| Env Variables | 1 | ⚠️ ALTA | Definir nome real da variável |
| Test Descriptors | 3+ | ℹ️ BAIXA | Usar nome descritivo |

---

## 🔧 PRÓXIMAS AÇÕES RECOMENDADAS

### Fase 1: Correções Críticas (Mock Methods)
1. [ ] Corrigir `db.get.__PLACEHOLDER()` → `.mockResolvedValue()` em ~25 ocorrências
2. [ ] Corrigir `db.run.__PLACEHOLDER()` → `.mockImplementation()` em ~8 ocorrências  
3. [ ] Corrigir `db.all.__PLACEHOLDER()` → `.mockImplementation()` em ~7 ocorrências

### Fase 2: Correções Críticas (Service Methods)
4. [ ] Implementar métodos reais no PixService (_mai, _adf)
5. [ ] Corrigir chamadas em PixService.test.js (4 linhas)
6. [ ] Corrigir chamadas em critical-services.test.js (2 linhas)
7. [ ] Implementar métodos em NotificationService
8. [ ] Corrigir chamadas em NotificationService.test.js (3 linhas)

### Fase 3: Correções de Matchers Jest
9. [ ] Substituir ~60 usos de `expect().__PLACEHOLDER()` com matchers corretos
10. [ ] Priorizar arquivos com mais ocorrências: Validation.test.js (20), PhotosController.test.js (9), EmailService.test.js (15+)

### Fase 4: Correções de Menor Impacto
11. [ ] Renomear `describe('PLACEHOLDER', ...)` para nomes descritivos
12. [ ] Definir nome real para variável de ambiente em NotificationsController.test.js linha 6

---

## 📝 NOTAS IMPORTANTES

1. **Padrões Recorrentes:** Muitos arquivos seguem padrões similares - pode ser possível automatizar parte das correções com regex
2. **Dependências:** Alguns serviços não foram totalmente implementados (RotingService, NotificationService) - verificar métodos reais
3. **Mock Strategy:** Recomenda-se usar `.mockResolvedValue()` para Promises e `.mockReturnValue()` para valores síncronos
4. **Jest Version:** Verificar versão do Jest para garantir compatibilidade com matchers usados

---

## 🎯 METRICAS

- **Arquivos afetados:** 21
- **Total de PLACEHOLDERs:** 129+
- **Linhas a corrigir:** 129+
- **Estimativa de tempo:** 4-6 horas (manual)
- **Estimativa com automação:** 1-2 horas (script + manual review)


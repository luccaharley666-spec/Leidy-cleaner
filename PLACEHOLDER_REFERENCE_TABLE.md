# 📊 TABELA DE REFERÊNCIA RÁPIDA - PLACEHOLDERs

**Gerado em:** 12 de Fevereiro de 2026

---

## 🔴 PRIORIDADE 1 - CRÍTICA (Implementar Primeiro)

| Arquivo | Linhas | Tipo | Padrão | Solução | Min. |
|---------|--------|------|--------|---------|------|
| **Validation.test.js** | 171, 186, 200, 215, 235, 267, 299, 331, 342, 376, 390, 405, 420, 434, 465, 480, 495, 539, 554, 569 | Jest Matcher | `expect(res.status).__PLACEHOLDER(400)` | `.toHaveBeenCalledWith(400)` | 15 |
| **EmailService.test.js** | 40, 67, 77, 96, 107, 115, 123, 162, 172, 183, 277, 285, 300, 313, 323, 333, 343, 355 | Service Method | `emailService.__PLACEHOLDER(...)` | `.sendBookingConfirmation(...)` | 20 |
| **RoutingService.test.js** | 32-132 (15 linhas) | Service Method | `RoutingService.__PLACEHOLDER(...)` | `.sortBookings()/.checkTimeGap()/.notifyTeam()` | 30 |
| **PhotosController.test.js** | 17, 18, 32, 33, 39, 40, 49, 50, 56, 57, 66 | Misto | `expect(...).__PLACEHOLDER`, `.__PLACEHOLDER({})` | `.toHaveBeenCalledWith()`, `.mockResolvedValueOnce()` | 15 |
| **PaymentController.test.js** | 118, 251, 286, 389, 405, 421 | Mock Impl | `db.get/run.__PLACEHOLDER((sql, params, cb) => {})` | `.mockImplementation(...)` | 10 |

---

## 🟠 PRIORIDADE 2 - ALTA (Implementar Segundo)

| Arquivo | Total | Tipo | Padrão | Solução | Min. |
|---------|-------|------|--------|---------|------|
| **NotificationService.test.js** | 7 | Misto | `db.get.__PLACEHOLDER()` / `notificationService.__PLACEHOLDER()` | `.mockResolvedValue()` / método real | 15 |
| **critical-services.test.js** | 6 | Misto | `PixPaymentService.__PLACEHOLDER()` / `expect(...).__PLACEHOLDER()` | `.validateWebhookSignature()` / `.toBe()` | 10 |
| **PixService.test.js** | 4 | Service Method | `PixService.__PLACEHOLDER(args)` | `._mai()` / `_adf()` | 5 |
| **BookingController.test.js** | 5 | Jest Matcher | `expect(res.status/json).__PLACEHOLDER()` | `.toHaveBeenCalledWith()` | 8 |
| **profile.integration.test.js** | 5 | Jest Matcher | `expect(routes.length).__PLACEHOLDER(n)` | `.toBe(n)` | 5 |
| **MonitoringService.test.js** | 3 | Mock Impl | `db.all/run.__PLACEHOLDER((sql, params, cb) => {})` | `.mockImplementation()` | 5 |
| **PaymentIntegrationService.test.js** | 2 | Mock Setup | `PixService.confirmPayment.__PLACEHOLDER()` | `.mockResolvedValue()` / `.toHaveBeenCalledWith()` | 3 |
| **integration-tests.test.js** | 2 | Jest Matcher | `expect(price).__PLACEHOLDER(minimum)` | `.toBeGreaterThanOrEqual()` | 3 |

---

## 🟡 PRIORIDADE 3 - MÉDIA (Implementar Terceiro)

| Arquivo | Total | Tipo | Padrão | Solução | Min. |
|---------|-------|------|--------|---------|------|
| **NewsletterController.test.js** | 3 | Jest Matcher | `expect(mockResponse.status).__PLACEHOLDER(400)` | `.toHaveBeenCalledWith(400)` | 3 |
| **NotificationsController.test.js** | 5 | Misto | `delete process.env.__PLACEHOLDER` / `expect(...).__PLACEHOLDER()` | Env var real / Jest Matcher | 5 |
| **AdminController.test.js** | 4 | Mock Impl | `db.get/all.__PLACEHOLDER()` | `.mockImplementation()` | 5 |
| **ReviewController.test.js** | 6 | Mock Impl | `db.get/run/all.__PLACEHOLDER()` | `.mockImplementation()` | 8 |
| **NotificationController.test.js** | 3 | Mock Impl | `db.get/run/all.__PLACEHOLDER()` | `.mockImplementation()` | 4 |
| **Factory.test.js** | 2 | Mock Impl | `postgresModule.initializePool.__PLACEHOLDER()` | `.mockImplementation()` | 3 |
| **middleware.test.js** | 1 | Jest Matcher | `expect(elapsed).__PLACEHOLDER(0)` | `.toBeGreaterThan(0)` | 1 |
| **utils.test.js** | 1 | Jest Matcher | `expect(value).__PLACEHOLDER(min)` | `.toBeGreaterThanOrEqual()` ou similar | 1 |

---

## 📋 RESUMO DE PADRÕES

### Padrão 1: Jest Matchers (Encontrar & Substituir)

| Contexto | Encontrar | Substituir | Ocorrências |
|----------|-----------|-----------|------------|
| expect(res.status) | `expect(res\.status)\.__PLACEHOLDER\(` | `expect(res.status).toHaveBeenCalledWith(` | ~30 |
| expect(res.json) | `expect(res\.json)\.__PLACEHOLDER\(` | `expect(res.json).toHaveBeenCalledWith(` | ~10 |
| expect(length) | `expect\([^)]*\.length\)\.__PLACEHOLDER\(` | `expect(\1.length).toBe(` | 5 |
| expect(value) | `expect\([^)]+\)\.__PLACEHOLDER\(` | Por contexto | ~15 |

---

### Padrão 2: Mock Return Values

| Mock | Encontrar | Substituir | Ocorrências |
|------|-----------|-----------|------------|
| db.get | `db\.get\.__PLACEHOLDER\(` | `db.get.mockResolvedValue(` | ~15 |
| mockDb.get | `mockDb\.get\.__PLACEHOLDER\(` | `mockDb.get.mockResolvedValue(` / `.mockResolvedValueOnce(` | 4 |
| other | `(\w+)\.__PLACEHOLDER\(` | `\1.mockReturnValue(` | 8 |

---

### Padrão 3: Mock Implementations

| Mock | Encontrar | Substituir | Ocorrências |
|------|-----------|-----------|------------|
| db.run | `db\.run\.__PLACEHOLDER\(\(` | `db.run.mockImplementation((` | ~8 |
| db.all | `db\.all\.__PLACEHOLDER\(\(` | `db.all.mockImplementation((` | ~7 |
| Generic | `(\w+)\.__PLACEHOLDER\(\(` | `\1.mockImplementation((` | 6 |

---

### Padrão 4: Service Methods

| Serviço | Método | Linhas | Item | Encontrar | Substituir |
|---------|--------|--------|------|-----------|-----------|
| EmailService | sendBookingConfirmation | 40, 67, 77... | chamada | `emailService\.__PLACEHOLDER` | `emailService.sendBookingConfirmation` |
| PixService | _mai | 192 | chamada | `PixService\.__PLACEHOLDER\(pixKey\)` | `PixService._mai(pixKey)` |
| PixService | _adf | 200, 206, 212 | chamada | `PixService\.__PLACEHOLDER\(` | `PixService._adf(` |
| PixPaymentService | validateWebhookSignature | 79, 84 | chamada | `PixPaymentService\.__PLACEHOLDER` | `PixPaymentService.validateWebhookSignature` |

---

## ⏱️ ESTIMATIVA DE TEMPO POR ARQUIVO

```
Validation.test.js .................. 15 min (simples, repetitivo)
EmailService.test.js ................ 20 min (pode variar por método)
RoutingService.test.js .............. 30 min (requer verificação de métodos)
PhotosController.test.js ............ 15 min (2 tipos de padrão)
PaymentController.test.js ........... 10 min (padrão único)
NotificationService.test.js ......... 15 min (3 tipos de padrão)
critical-services.test.js ........... 10 min
PixService.test.js .................. 5 min
BookingController.test.js ........... 8 min
Others (9 arquivos) ................. 45 min (3-10 min cada)
─────────────────────────────────────────────────
TOTAL ESTIMADO ....................... 2-3 horas
```

---

## 🎯 ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

### Bloco 1 (30 min) - Começar aqui
1. ✅ Validation.test.js (15 min)
   - Padrão único e simples
   - Todas línhas são: `expect(res.status).__PLACEHOLDER(400)`

2. ✅ profile.integration.test.js (5 min)
   - Padrão similar: `expect(x.length).__PLACEHOLDER(n)`

3. ✅ middleware.test.js (1 min)
   - Apenas 1 ocorrência

### Bloco 2 (40 min) - Depois de validar Bloco 1
4. ✅ BookingController.test.js (8 min)
5. ✅ NewsletterController.test.js (3 min)
6. ✅ PaymentIntegrationService.test.js (3 min)
7. ✅ integration-tests.test.js (3 min)
8. ✅ utils.test.js (1 min)
9. ✅ MonitoringService.test.js (5 min) - Mock Impl

### Bloco 3 (60 min) - Verificar métodos reais primeiro
10. ✅ PixService.test.js (5 min) - Depois: verificar _mai() e _adf()
11. ✅ critical-services.test.js (10 min)
12. ✅ PaymentController.test.js (10 min)
13. ✅ PhotosController.test.js (15 min)
14. ✅ AdminController.test.js (5 min)
15. ✅ ReviewController.test.js (8 min)

### Bloco 4 (40+ min) - Requer mais investigação
16. ✅ NotificationService.test.js (15 min) - Investigar métodos
17. ✅ EmailService.test.js (20 min) - Verificar método real
18. ✅ RoutingService.test.js (30 min) - Renomear PLACEHOLDER para nomes reais
19. ✅ NotificationController.test.js (4 min)
20. ✅ Factory.test.js (3 min)
21. ✅ NotificationsController.test.js (5 min) - Env var

---

## 🔧 COMANDOS PARA CADA TIPO DE PROBLEMA

### Jest Matchers
```bash
# Encontrar padrão
grep -n "expect.*).__PLACEHOLDER" /caminho/arquivo.test.js

# Substituir no VS Code (Ctrl+H)
Find: expect\(.*?\)\.__PLACEHOLDER\(
Replace by: expect($1).toHaveBeenCalledWith(
```

### Mock Return Values
```bash
# Encontrar padrão
grep -n "\.get\.__PLACEHOLDER\|\.run\.__PLACEHOLDER" /caminho/arquivo.test.js

# Substituir no VS Code
Find: (\.\w+)\.__PLACEHOLDER\(
Replace by: $1.mockResolvedValue(
```

### Mock Implementations
```bash
# Encontrar padrão
grep -n "\.__PLACEHOLDER\(\(" /caminho/arquivo.test.js

# Substituir no VS Code
Find: \.__PLACEHOLDER\(\(
Replace by: .mockImplementation((
```

---

## ✅ VALIDAÇÃO APÓS CADA MUDANÇA

```bash
# Para arquivo específico
npm test -- /caminho/arquivo.test.js

# Para todos
npm test

# Com coverage
npm test -- --coverage
```

---

## 🚦 SINAIS DE ALERTA

### ⚠️ Possíveis erros durante implement ação:

| Erro | Causa | Solução |
|-----|-------|---------|
| "method is not a function" | Usado método errado ou não existe | Verificar método real no serviço |
| "Cannot read property of undefined" | Mock não está configurado | Adicionar mock antes do teste |
| "Expected spy to have been called" | Mock não foi chamado | Verificar se chamada é condicional |
| "Regex não encontra padrão" | Espaçamento diferente | Ajustar regex para incluir `\s*` |

---

## 📚 REFERÊNCIA RÁPIDA DE JEST

```javascript
// Mock Return Value
mock.mockReturnValue(value)              // Síncrono
mock.mockResolvedValue(value)            // Promise
mock.mockRejectedValue(error)            // Promise com erro
mock.mockImplementation((args) => {})    // Implementação custom

// Jest Matchers para Mocks
expect(mock).toHaveBeenCalled()
expect(mock).toHaveBeenCalledWith(args)
expect(mock).toHaveBeenCalledTimes(n)

// Jest Matchers para Valores
expect(value).toBe(expected)             // Igualdade exata
expect(value).toEqual(expected)          // Igualdade profunda
expect(value).toBeGreaterThan(n)
expect(value).toBeLessThan(n)
expect(value).toBeGreaterThanOrEqual(n)
expect(value).toBeLessThanOrEqual(n)
```

---

## 🎉 CONCLUSÃO

- **Total de mudanças:** 129+ PLACEHOLDERs
- **Tempo estimado:** 2-3 horas
- **Complexidade:** Baixa-Média (padrões bem definidos)
- **Risco:** Baixo (change bem suportado por ferramentas)

**Status:** Pronto para implementação! 🚀


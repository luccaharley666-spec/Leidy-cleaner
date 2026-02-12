# 🎯 GUIA DE CORREÇÃO POR ARQUIVO

Documento específico com todas as correções necessárias organizadas por arquivo.

---

## 📁 ARQUIVOS COM PLACEHOLDER (Ordem de Prioridade)

### 🔴 CRÍTICA - Impacto na execução dos testes

---

### 1. **Validation.test.js** (20 ocorrências)

**Tipo:** Jest Matchers  
**Padrão:** `expect(res.status).__PLACEHOLDER(400);`  
**Correção:** Todas as linhas abaixo devem ser `.toHaveBeenCalledWith()`

```
Linhas: 171, 186, 200, 215, 235, 267, 299, 331, 342, 376, 390, 405, 420, 434, 465, 480, 495, 539, 554, 569

Busca:     expect(res.status).__PLACEHOLDER(
Substitua: expect(res.status).toHaveBeenCalledWith(
```

---

### 2. **EmailService.test.js** (17 ocorrências)

**Tipo 1:** Service Method Missing (linha 40)
```javascript
// Linha 40
expect(typeof emailService.__PLACEHOLDER).toBe('function');
↓
expect(typeof emailService.sendBookingConfirmation).toBe('function');
```

**Tipo 2:** Service Method Calls (linhas 67, 77, 96, 107, 115, 123, 162, 172, 183, 277, 285, 300, 313, 323, 333, 343, 355)
```javascript
// Linhas 67, 77, 96, 107, 115, 123, 162, 172, 183, 277, 285, 300, 313, 323, 333, 343, 355
await emailService.__PLACEHOLDER(clientEmail, clientName, bookingData);
↓
await emailService.sendBookingConfirmation(clientEmail, clientName, bookingData);

OU (se método diferente)

await emailService.sendReminder(clientEmail, bookingData);
await emailService.sendRejection(clientEmail, bookingData);
```

**Ação necessária:** Verificar qual é o método real em EmailService.js

---

### 3. **RoutingService.test.js** (15 ocorrências)

**Tipo:** Service Methods (variável nome)  
**Status:** ⚠️ Métodos chamados `PLACEHOLDER` no serviço!

```javascript
// Linhas 32, 40, 41 - Primeiro método (sortBookings?)
expect(typeof RoutingService.__PLACEHOLDER).toBe('function');
RoutingService.__PLACEHOLDER.mockReturnValue(bookings);
const result = RoutingService.__PLACEHOLDER(bookings);

// Linhas 90, 94, 97, 102, 105 - Segundo método (checkTimeGap?)
expect(typeof RoutingService.__PLACEHOLDER).toBe('function');
RoutingService.__PLACEHOLDER.mockReturnValue(true);
const result = RoutingService.__PLACEHOLDER(booking1, booking2, 30);

// Linhas 112, 116, 120, 125, 126, 131, 132 - Terceiro método (notifyTeam?)
expect(typeof RoutingService.__PLACEHOLDER).toBe('function');
RoutingService.__PLACEHOLDER.mockResolvedValue(true);
const result = await RoutingService.__PLACEHOLDER('team-1', itinerary);
```

**Ação necessária:** 
1. Verificar os nomes dos métodos em `/workspaces/acabamos/backend/src/services/RoutingService.js`
2. Renomear `PLACEHOLDER` para nomes reais
3. Atualizar testes com nomes reais

---

### 4. **PhotosController.test.js** (10 ocorrências)

**Tipo 1:** Jest Matchers (linhas 17, 18, 32, 33, 49, 50, 66)
```javascript
expect(res.status).__PLACEHOLDER(400);
↓
expect(res.status).toHaveBeenCalledWith(400);

expect(res.json).__PLACEHOLDER(expect.objectContaining(...))
↓
expect(res.json).toHaveBeenCalledWith(expect.objectContaining(...))
```

**Tipo 2:** Mock Chain (linhas 39, 40, 56, 57)
```javascript
// Linhas 39, 40 - Cadeia de mocks
const mockQuery = jest.fn()
  .__PLACEHOLDER({ rows: [{ id: 1, user_id: 2, staff_id: null }] })
  .__PLACEHOLDER({ rows: [] });
↓
const mockQuery = jest.fn()
  .mockResolvedValueOnce({ rows: [{ id: 1, user_id: 2, staff_id: null }] })
  .mockResolvedValueOnce({ rows: [] });

// Linhas 56, 57 - Idem
  .__PLACEHOLDER({ rows: [{ id: 1, user_id: 1, staff_id: null }] })
  .__PLACEHOLDER({ rows: [{ id: 1, booking_id: 5, url: '/uploads/x.jpg' }] });
↓
  .mockResolvedValueOnce({ rows: [{ id: 1, user_id: 1, staff_id: null }] })
  .mockResolvedValueOnce({ rows: [{ id: 1, booking_id: 5, url: '/uploads/x.jpg' }] });
```

---

### 5. **PaymentController.test.js** (6 ocorrências)

**Tipo:** Mock Implementation  
**Padrão:** `db.get.__PLACEHOLDER(...)` ou `db.run.__PLACEHOLDER(...)`

```javascript
// Linhas 118, 251, 286, 405
db.get.__PLACEHOLDER((sql, params, callback) => {
  callback(new Error('Payment error'));
});
↓
db.get.mockImplementation((sql, params, callback) => {
  callback(new Error('Payment error'));
});

// Linhas 389, 421
db.run.__PLACEHOLDER((sql, params, callback) => {
  callback(new Error('...'));
});
↓
db.run.mockImplementation((sql, params, callback) => {
  callback(new Error('...'));
});
```

---

### 6. **NotificationService.test.js** (7 ocorrências)

**Tipo 1:** Mock Setup (linhas 148, 149, 179, 180)
```javascript
mockDb.get.__PLACEHOLDER(booking);
↓
mockDb.get.mockResolvedValue(booking);

// Se há múltiplas chamadas:
mockDb.get.__PLACEHOLDER({userId: 123, ...});
↓
mockDb.get.mockResolvedValueOnce({userId: 123, ...});
```

**Tipo 2:** Service Methods (linhas 204, 218, 229)
```javascript
// Linha 204
await notificationService.__PLACEHOLDER('+5551987654321', paymentDetails);
↓
await notificationService.sendPaymentLink('+5551987654321', paymentDetails);

// Linha 218
await notificationService.__PLACEHOLDER('+5551987654321', paymentDetails);
↓
await notificationService.sendPaymentConfirmation('+5551987654321', paymentDetails);

// Linha 229
await notificationService.__PLACEHOLDER('+5551987654321', referralCode, referralLink);
↓
await notificationService.sendReferralLink('+5551987654321', referralCode, referralLink);
```

**Tipo 3:** Test Descriptors (linhas 197, 209, 224)
```javascript
// Linha 197
describe('PLACEHOLDER', () => {
  it('deve enviar link de pagamento por WhatsApp', async () => {
↓
describe('sendPaymentLink', () => {

// Linha 209
describe('PLACEHOLDER', () => {
  it('deve enviar confirmação de pagamento por WhatsApp', async () => {
↓
describe('sendPaymentConfirmation', () => {

// Linha 224
describe('PLACEHOLDER', () => {
  it('deve enviar link de referência por WhatsApp', async () => {
↓
describe('sendReferralLink', () => {
```

---

### ⚠️ ALTA - Impacto significativo

---

### 7. **critical-services.test.js** (6 ocorrências)

**Tipo 1:** Service Methods (linhas 79, 84)
```javascript
// Linhas 79, 84
const isValid = PixPaymentService.__PLACEHOLDER(body, signature, secret);
↓
const isValid = PixPaymentService.validateWebhookSignature(body, signature, secret);
```

**Tipo 2:** Jest Matchers (linhas 222, 223, 224)
```javascript
// Linhas 222, 223, 224
expect(RetryQueueService.calculateDelay(1)).__PLACEHOLDER(1000);
expect(RetryQueueService.calculateDelay(2)).__PLACEHOLDER(2000);
expect(RetryQueueService.calculateDelay(3)).__PLACEHOLDER(4000);
↓
expect(RetryQueueService.calculateDelay(1)).toBe(1000);
expect(RetryQueueService.calculateDelay(2)).toBe(2000);
expect(RetryQueueService.calculateDelay(3)).toBe(4000);
```

**Tipo 3:** Jest Matcher (linha 251)
```javascript
expect(processed.total).__PLACEHOLDER(0);
↓
expect(processed.total).toBe(0);
// ou
expect(processed.total).toEqual(0);
```

---

### 8. **PixService.test.js** (4 ocorrências)

**Tipo:** Service Static Methods

```javascript
// Linha 192
const mai = PixService.__PLACEHOLDER(pixKey);
↓
const mai = PixService._mai(pixKey);

// Linhas 200, 206, 212
const adf = PixService.__PLACEHOLDER('Teste descrição', 'REF123');
const adf = PixService.__PLACEHOLDER('', 'REF123');
const adf = PixService.__PLACEHOLDER('Descrição', '');
↓
const adf = PixService._adf('Teste descrição', 'REF123');
const adf = PixService._adf('', 'REF123');
const adf = PixService._adf('Descrição', '');
```

---

### 9. **BookingController.test.js** (5 ocorrências)

**Tipo:** Jest Matchers

```javascript
// Linhas 18, 38, 53
expect(res.status).__PLACEHOLDER(400);
expect(res.status).__PLACEHOLDER(404);
expect(res.status).__PLACEHOLDER(400);
↓
expect(res.status).toHaveBeenCalledWith(400);
expect(res.status).toHaveBeenCalledWith(404);
expect(res.status).toHaveBeenCalledWith(400);

// Linhas 39, 78
expect(res.json).__PLACEHOLDER(expect.objectContaining(...))
↓
expect(res.json).toHaveBeenCalledWith(expect.objectContaining(...))
```

---

### 10. **PaymentIntegrationService.test.js** (2 ocorrências)

```javascript
// Linha 129
PixService.confirmPayment.__PLACEHOLDER({ success: true });
↓
PixService.confirmPayment.mockResolvedValue({ success: true });

// Linha 142
expect(PixService.confirmPayment).__PLACEHOLDER('pix_123', 'bank_456');
↓
expect(PixService.confirmPayment).toHaveBeenCalledWith('pix_123', 'bank_456');
```

---

### 11. **integration-tests.test.js** (2 ocorrências)

```javascript
// Linhas 80, 242
expect(price).__PLACEHOLDER(minimum);
↓
expect(price).toBeGreaterThanOrEqual(minimum);
```

---

### 12. **profile.integration.test.js** (5 ocorrências)

```javascript
// Linha 189
expect(routes.length).__PLACEHOLDER(7);
↓
expect(routes.length).toBe(7);

// Linha 232
expect(getRoutes.length).__PLACEHOLDER(4);
↓
expect(getRoutes.length).toBe(4);

// Linha 240
expect(putRoutes.length).__PLACEHOLDER(2);
↓
expect(putRoutes.length).toBe(2);

// Linha 248
expect(postRoutes.length).__PLACEHOLDER(1);
↓
expect(postRoutes.length).toBe(1);

// Linha 256
expect(deleteRoutes.length).__PLACEHOLDER(1);
↓
expect(deleteRoutes.length).toBe(1);
```

---

### 13. **MonitoringService.test.js** (3 ocorrências)

```javascript
// Linhas 122, 313
db.all.__PLACEHOLDER((sql, params, callback) => { ... })
↓
db.all.mockImplementation((sql, params, callback) => { ... })

// Linha 302
db.run.__PLACEHOLDER((sql, params, callback) => { ... })
↓
db.run.mockImplementation((sql, params, callback) => { ... })
```

---

### 14. **middleware.test.js** (1 ocorrência)

```javascript
// Linha 295
expect(elapsed).__PLACEHOLDER(0);
↓
expect(elapsed).toBeGreaterThan(0);
```

---

### 15. **NewsletterController.test.js** (3 ocorrências)

```javascript
// Linhas 70, 79, 105
expect(mockResponse.status).__PLACEHOLDER(400);
↓
expect(mockResponse.status).toHaveBeenCalledWith(400);
```

---

### ℹ️ BAIXA - Impacto mínimo

---

### 16-19. **Arquivos com poucas ocorrências**

- **AdminController.test.js** - 4 ocorrências (Mock Implementation)
- **ReviewController.test.js** - 6 ocorrências (Mock Implementation)
- **NotificationController.test.js** - 3 ocorrências (Mock Implementation)
- **Factory.test.js** - 2 ocorrências (Mock Implementation)
- **utils.test.js** - 1 ocorrência (Jest Matcher)
- **NotificationsController.test.js** - 5 ocorrências (1 Env Var + 4 Jest Matchers)

**Padrão geral:** Mesmos padrões dos arquivos acima

---

## 🚀 CRONOGRAMA RECOMENDADO

**Dia 1 (2 horas):**
1. [ ] Correções em Validation.test.js (20 linhas)
2. [ ] Correções em profile.integration.test.js (5 linhas)
3. [ ] Correções em EmailService.test.js tipo 1 (linhas 40)

**Dia 2 (2 horas):**
4. [ ] Verificar e renomear métodos em RoutingService
5. [ ] Corrigir testes em RoutingService.test.js
6. [ ] Corrigir testes em NotificationService.test.js

**Dia 3 (1 hora):**
7. [ ] Verificar métodos reais em NotificationService
8. [ ] Corrigir testes em EmailService.test.js (todas chamadas de método)
9. [ ] Corrigir testes em critical-services.test.js

**Dia 4 (1 hora):**
10. [ ] Corrigir Mock Implementations (db.get/run/all)
11. [ ] Testar todas as correções
12. [ ] Revisar coverage

---

## 🔗 REFERÊNCIAS DE MÉTODOS

### Métodos que EXISTEM no código:
- ✅ `EmailService.sendBookingConfirmation()`
- ✅ `PixService._mai()`
- ✅ `PixService._adf()`
- ✅ `PixPaymentService.validateWebhookSignature()`

### Métodos que PRECISAM SER VERIFICADOS:
- ❓ `NotificationService.sendPaymentLink()`
- ❓ `NotificationService.sendPaymentConfirmation()`
- ❓ `NotificationService.sendReferralLink()`
- ❓ `RoutingService.sortBookings()` (atualmente `PLACEHOLDER`)
- ❓ `RoutingService.checkTimeGap()` (atualmente `PLACEHOLDER`)
- ❓ `RoutingService.notifyTeam()` (atualmente `PLACEHOLDER`)

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Listar todos os PLACEHOLDERs
- [ ] Organizar por tipo de correção
- [ ] Corrigir Jest Matchers
- [ ] Corrigir Mock Methods
- [ ] Verificar Service Methods
- [ ] Atualizar nomes de descritores de teste
- [ ] Executar `npm test`
- [ ] Revisar erros
- [ ] Corrigir erros encontrados
- [ ] Validar coverage

---


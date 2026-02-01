# 🧪 Testing Guide

## Overview

Este projeto usa **Jest** para testes automatizados com cobertura de ~4% inicialmente. O objetivo é atingir 30%+ de cobertura gradualmente.

## Estrutura de Testes

```
backend/
├── __tests__/
│   ├── ReviewController.test.js       # Controller tests
│   ├── api.integration.test.js        # API endpoint tests
│   ├── BookingService.test.js         # Service tests
│   ├── factory.test.js                # Database factory tests
│   ├── health.test.js                 # Health check utility tests
│   ├── logger.test.js                 # Logger utility tests
│   └── validation.test.js             # Validation middleware tests
├── jest.config.js                     # Jest configuration
└── package.json
```

## Executar Testes

### Rodar todos os testes
```bash
cd backend
npm test
```

### Rodar com cobertura
```bash
npm test -- --coverage
```

### Rodar testes de um arquivo específico
```bash
npm test -- ReviewController.test.js
```

### Rodar em modo watch (desenvolvimento)
```bash
npm test -- --watch
```

## Cobertura Atual

| Métrica | Valor | Meta |
|---------|-------|------|
| Statements | 3.76% | 30%+ |
| Branches | 3.08% | 30%+ |
| Functions | 4.88% | 30%+ |
| Lines | 3.84% | 30%+ |

## Próximos Passos para Aumentar Cobertura

### 1. Testes de Controllers (Priority: HIGH)
```javascript
// backend/src/__tests__/AdminController.test.js
describe('AdminController', () => {
  describe('getAllUsers', () => {
    test('should return list of users', async () => {
      // Mock database
      // Call controller
      // Assert response
    });
  });
});
```

### 2. Testes de Services (Priority: HIGH)
```javascript
// backend/src/__tests__/EmailService.test.js
describe('EmailService', () => {
  describe('sendConfirmation', () => {
    test('should send email to user', async () => {
      // Mock nodemailer
      // Call service
      // Assert email was sent
    });
  });
});
```

### 3. Testes de Database (Priority: MEDIUM)
```javascript
// backend/src/__tests__/postgres.test.js
describe('PostgreSQL Adapter', () => {
  describe('query', () => {
    test('should execute SQL query', async () => {
      // Mock pg.Pool
      // Execute query
      // Assert results
    });
  });
});
```

### 4. Testes E2E (Priority: LOW)
```bash
# Usar Supertest + Express para testar fluxo completo
npm test -- api.integration.test.js
```

## Mock Patterns

### Mocking Database
```javascript
jest.mock('../db/sqlite', () => ({
  getDb: jest.fn().mockResolvedValue({
    all: jest.fn().mockResolvedValue([]),
    get: jest.fn().mockResolvedValue(null),
    run: jest.fn().mockResolvedValue({ lastID: 1, changes: 1 }),
  }),
}));
```

### Mocking Logger
```javascript
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));
```

### Mocking External Services
```javascript
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: '123' }),
  }),
}));
```

## CI/CD Integration

### GitHub Actions (Exemplo)
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v2
```

## Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `npm test` | Rodar todos os testes |
| `npm test -- --coverage` | Gerar relatório de cobertura |
| `npm test -- --watch` | Modo watch |
| `npm test -- --debug` | Modo debug |
| `npm test -- --testNamePattern="pattern"` | Filtrar testes |

## Recursos

- [Jest Documentation](https://jestjs.io/)
- [Supertest](https://github.com/visionmedia/supertest)
- [Mocking Best Practices](https://jestjs.io/docs/mock-functions)

## Status

✅ Infrastructure: Jest configurado  
✅ Base Tests: 27 testes escritos  
⏳ Coverage: Aumentando gradualmente  
🚀 Goal: 30%+ coverage em 2-3 sprints

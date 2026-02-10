# Testing Strategy (Backend)

Este projeto separa testes unitários/integração (Jest) de testes end-to-end (Playwright) para melhorar a qualidade do CI/CD pipeline.

## Estrutura de Testes

```
backend/
├── src/
│   ├── __tests__/         # Testes unitários de segurança
│   ├── services/
│   │   └── __tests__/     # Testes dos serviços
│   ├── controllers/
│   │   └── __tests__/     # Testes dos controladores
│   └── routes/
│       └── __tests__/     # Testes das rotas
└── e2e/                   # Testes end-to-end (Playwright) - IGNORADOS por Jest
    └── tests/
        ├── authentication.spec.js
        └── phase3b.spec.js
```

## Rodando Testes

### 1. Testes Unitários (recomendado para CI/CD)

```bash
# Rodar todos os unit tests
npm test

# Apenas unit tests (sem integração)
npm run test:unit

# Cobertura de código
npm run test:coverage

# Modo watch (desenvolvimento)
npm run test:watch

# CI/CD (parallelizado, com coverage)
npm run test:ci
```

### 2. Testes de Integração

```bash
# Apenas testes de integração
npm run test:integration
```

### 3. Testes End-to-End (Playwright)

```bash
# Rodar testes e2e (headless)
npm run e2e

# Com visualização (headed)
npm run e2e:headed

# Mode debug interativo
npm run e2e:debug

# Ver relatório HTML
npm run e2e:report
```

## Configuração

### jest.config.js

- **[REDACTED_TOKEN]**: Ignora `e2e/*` para que Playwright não interfira
- **testMatch**: Procura por testes dentro de `src/` apenas
- **setupFilesAfterEnv**: Configuração pós-setup em `jest.setup.js`
- **maxWorkers**: Paralleliza com 50% dos workers disponíveis

### jest.setup.js

Arquivo que:
- Mock do `winston` para não gerar logs durante testes
- Suprime avisos do winston sobre transportes offline
- Define timeout global de 10s

### jest.env.js

Variáveis de ambiente para testes:
- `NODE_ENV=test`
- `DATABASE_URL=sqlite::memory:` (banco em memória)
- `LOG_LEVEL=error` (suprime logs verbosos)
- Desabilita New Relic e Sentry

### .env.test

Arquivo `.env` específico para testes (se necessário carregá-lo explicitamente)

## Novos Testes Adicionados

### 1. [REDACTED_TOKEN].test.js

- Testa criação de pagamentos Stripe
- Testa criação de QR Codes PIX
- **Testa processamento de webhooks** ✅ (novo: PIX webhook integration)
- Testa reembolsos
- Testa histórico de pagamentos

### 2. NotificationService.test.js

- Testa gerenciamento de preferências
- Testa envio de SMS/WhatsApp (com fallback)
- Testa envio de confirmações
- Testa agendamento de lembretes
- Testa integração com Twilio (mock)

## CI/CD Best Practices

1. **Rodar unitários no CI**: Usa `npm run test:ci`
2. **E2E em pipeline separado**: Rodas após pull request ser mergeado (mais lento)
3. **Coverage threshold**: Pode ser habilitado no `jest.config.js` após atingir cobertura mínima
4. **Parallel execution**: Jest roda em paralelo (multiprocesso)

## Exemplo: GitHub Actions Workflow

```yaml
name: Tests

on: [pull_request, push]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci

  e2e-tests:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run e2e
```

## Troubleshooting

### Jest não encontra testes

- Verificar que testes estão em `src/**/__tests__/*.test.js`
- Testes fora de `src/` serão ignorados

### Testes E2E falhando

- Certificar que Playwright está instalado: `npm install -D @playwright/test`
- Rodar com `npm run e2e:headed` para visualizar
- Verificar `playwright.config.ts` na raiz do projeto

### Winston warnings em testes

- Configurado via `jest.setup.js` (mock automático)
- Se ainda ver logs, aumentar `LOG_LEVEL=silent` in `.env.test`

## Próximas Melhorias

- [ ] Aumentar coverage threshold para 50%+
- [ ] Adicionar testes para controllers críticos (PaymentController, BookingController)
- [ ] CI/CD parallelizado (unit + e2e simultâneos em diferentes jobs)
- [ ] Banco de dados de teste com dados pré-fixture (factory-boy style)
- [ ] Performance benchmarks (testes de tempo de resposta)

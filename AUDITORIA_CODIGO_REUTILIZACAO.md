# 🔍 Auditoria de Código - O que Reutilizar vs Reescrever

**Objetivo:** Mapear cada arquivo do projeto e decidir se será mantido, adaptado ou descartado no restart

---

## RESUMO EXECUTIVO

| Categoria | Mantém | Escreve Novo | Descarta | Razão |
|-----------|--------|--------------|----------|-------|
| **Services** | 80% | 20% | - | Lógica de negócio comprovada |
| **Controllers** | 5% | 95% | - | Reescrever com padrões limpos |
| **Database** | 100% | - | - | Schema validado, dados arquivados |
| **Validations** | 90% | 10% | - | Regras estão corretas |
| **Utils** | 70% | 30% | - | Parte precisa refactor |
| **Frontend** | 40% | 60% | - | Components antigos, refactory |
| **Tests** | 10% | 90% | - | Coverage inadequado, recriar |
| **Docs** | 100% | - | - | Material já criado é valioso |
| **Scripts** | 20% | 80% | - | Adaptar ou criar novos |
| **Config** | 30% | 70% | - | Mudar stack/estrutura |

---

## 📂 ANÁLISE DETALHADA POR PASTA

### `/backend/src/services/` - ✅ GUARDAR (Com Review)

**Status:** 80% reutilizável com pequenos ajustes TypeScript

```
BookingService.js              ✅ REUTILIZAR
├─ Responsabilidade: Cálculo de preço, disponibilidade
├─ Código: ~300 linhas, comprovado em produção
├─ Migração: Converter para TypeScript, adicionar tipos
└─ Prioridade: 🔴 Crítica

PaymentService.js              ✅ REUTILIZAR
├─ Responsabilidade: Stripe integration, tokenização PCI-DSS
├─ Código: ~200 linhas, seguro e testado
├─ Migração: Ajustar para novo padrão de erros
└─ Prioridade: 🔴 Crítica

NotificationService.js         ✅ REUTILIZAR
├─ Responsabilidade: Email, WhatsApp, SMS
├─ Código: ~250 linhas, múltiplas integrações
├─ Migração: Melhorar tratamento de erros
└─ Prioridade: 🔴 Crítica

AuthService.js                 🟡 REVISAR
├─ Responsabilidade: JWT, refresh tokens, 2FA
├─ Código: ~400 linhas, complexo
├─ Migração: Simplificar, usar passport.js ou similar
└─ Prioridade: 🔴 Crítica

ReviewService.js               ✅ REUTILIZAR
├─ Responsabilidade: Validação e storage de reviews
├─ Código: ~150 linhas, modular
├─ Migração: Mínimas mudanças
└─ Prioridade: 🟡 Alta

StaffService.js                ✅ REUTILIZAR
├─ Responsabilidade: Gerenciamento de equipe
├─ Código: ~200 linhas, bem estruturado
├─ Migração: Converter para TypeScript
└─ Prioridade: 🟡 Alta

PricingService.js              ✅ REUTILIZAR
├─ Responsabilidade: Cálculo dinâmico, descontos
├─ Código: ~300 linhas, lógica comprovada
├─ Migração: Refactor em funções puras
└─ Prioridade: 🟡 Alta

AnalyticsService.js            🟡 REVISAR
├─ Responsabilidade: Cálculos de métricas
├─ Código: ~250 linhas, pode ter bugs
├─ Migração: Recriar com queries otimizadas
└─ Prioridade: 🟢 Média
```

---

### `/backend/src/controllers/` - ❌ REESCREVER

**Status:** 0% reutilizável (50+ controlers, inchado)

```
DELETAR TODOS - Razões:
├─ Padrão inconsistente entre controllers
├─ Lógica misturada em múltiplos arquivos
├─ Sem tipos TypeScript
├─ Tratamento de erro não padronizado
└─ Fácil reescrever com padrões limpos

Padrão Novo:
├─ Um controller por resource
├─ Métodos padrão: list, get, create, update, delete
├─ Validação via middleware
├─ Erros centralizados
└─ Types TypeScript completos
```

**Controllers que Serão Reescritos (Checklista):**

| Controller | Linhas | Complexidade | Prioridade MVP |
|-----------|--------|--------------|----------------|
| BookingController | ~400 | Alta | 🔴 Week 1 |
| PaymentController | ~300 | Alta | 🔴 Week 1 |
| ReviewController | ~200 | Média | 🟡 Week 2 |
| AdminController | ~500 | Muito Alta | 🟡 Week 2 |
| AuthController | ~250 | Alta | 🔴 Week 1 |
| ProfileController | ~150 | Baixa | 🟡 Week 2 |
| StaffController | ~200 | Média | 🟡 Week 2 |
| PhotosController | ~150 | Baixa | 🟡 Week 2 |
| NotificationController | ~180 | Média | 🟡 Week 2 |
| SearchController | ~100 | Baixa | 🟢 Week 3 |
| RecommendationController | ~120 | Média | 🟢 Week 3 |
| ChatController | ~150 | Média | 🟢 Week 3 |

---

### `/backend/src/middleware/` - 🟡 ADAPTAR

**Status:** 60% reutilizável com refactor

```
auth.js                        🟡 ADAPTAR
├─ Função: JWT validation, authorizatio
├─ Reutilizar: Lógica principal de JWT
├─ Refactor: Melhor estrutura, tipos
└─ Novo: Padrão consistente de erros

validation.js                  ✅ REUTILIZAR
├─ Função: Validação de request
├─ Reutilizar: Middleware de validação Joi
├─ Refactor: Separar schemas
└─ Novo: Error messages em PT-BR

rateLimited.js                 ✅ REUTILIZAR
├─ Função: Rate limiting por IP
├─ Reutilizar: Lógica de rate limit
├─ Refactor: Usar redis-rate-limit package
└─ Novo: Configuração granular

errorHandler.js                ❌ REESCREVER
├─ Função: Tratamento de erros global
├─ Problema: Inconsistente, sem tipos
├─ Novo: Express error middleware pattern
└─ Adicionar: Logging centralizado com Sentry

corsConfig.js                  🟡 ADAPTAR
├─ Função: CORS headers
├─ Reutilizar: Whitelist de domínios
├─ Refactor: Usar helmet.js
└─ Novo: Security headers completos
```

---

### `/backend/src/utils/` - ✅ GUARDAR (Com Refactor)

**Status:** 70% reutilizável, precisa limpeza

```
joiSchemas.js / validation.js  ✅ REUTILIZAR
├─ Tamanho: ~1000+ linhas
├─ Contém: Todas as regras de validação
├─ Utilidade: Extremamente valiosa
├─ Refactor: Separar por domínio, adicionar tipos
└─ Novo: Validação em TypeScript com zod ou joi

logger.js                      ✅ REUTILIZAR
├─ Função: Winston logger config
├─ Utilidade: Logging estruturado
├─ Refactor: Mínimas mudanças
└─ Novo: Package upgrade para última versão

formatters.js                  ✅ REUTILIZAR
├─ Função: Formatação de dates, numbers, etc
├─ Utilidade: Helpers comuns
├─ Refactor: Converter para TypeScript
└─ Novo: Adicionar mais formatadores

helpers.js                     🟡 REVISAR
├─ Função: Mix de utilidades
├─ Problema: Code smell, função gigante
├─ Refactor: Separar por domínio
└─ Novo: Pequenos módulos especializados

constants.js                   ✅ REUTILIZAR
├─ Função: Constantes da app
├─ Utilidade: Évita magic numbers
├─ Refactor: Converter para TypeScript enum
└─ Novo: Estrutura melhor

pixa.js / stripe.js            ✅ REUTILIZAR (Em Services)
├─ Função: Integração com APIs
├─ Localização: Mover para services/
├─ Refactor: Tipos TypeScript completos
└─ Novo: Error handling robusto
```

---

### `/backend/src/db/` - ✅ GUARDAR (COM MUDANÇAS)

**Status:** 50% reutilizável, mudança de DB

```
ATUALMENTE: SQLite
NOVO: PostgreSQL

Arquivos:
├─ connection.js              🟡 REESCREVER
│  ├─ Atual: sqlite3 setup
│  ├─ Novo: pg pool setup
│  └─ Migração: New file com novo patron
│
└─ query.js                   ✅ ADAPTAR
   ├─ Reutilizar: Padrão de queries
   ├─ Refactor: Use parameterized queries (já faz)
   └─ Novo: Interface mais clean
```

**Schema SQL:**
```sql
✅ schema.sql                  → IMPORTAR TAL QUAL
├─ Criar migration script
├─ Validar tipos (INTEGER → uuid, etc)
└─ Testar import em novo DB

✅ seed-data.sql              → REUTILIZAR VENDAS
├─ Adaptar para PostgreSQL
│  (SQLite INTEGER → PostgreSQL SERIAL/UUID)
└─ Importar dados de referência

seeds/                         🟡 REVISAR
├─ Limpar dados de teste
├─ Manter dados de seed reais
└─ Estruturar em migrations
```

---

### `/frontend/src/` - 🟢 REESCREVER (40% Conceito)

**Status:** 40% do conceito vale, 60% needs refactor

#### ✅ Conceitos a Reutilizar

```
Components/
├─ BookingForm              → Conceito OK, UI precisa
├─ PaymentForm              → Conceito OK, Stripe integration mantém
├─ ReviewForm               → Conceito OK, UI precisa
├─ ServiceCard              → Conceito OK, design novo
├─ DashboardCards           → Contexto OK, refactor UI
└─ Navigation               → Estrutura OK, menu novo

Hooks/
├─ useBooking               → Lógica OK, refactor
├─ useAuth                  → Pattern OK, tipos adicionais
├─ useFetch                 → Lógica OK, erro handling
└─ useNotification          → Padrão OK, manter

Context/
├─ AuthContext              → Estrutura OK, adicionar profile
├─ BookingContext           → Estrutura OK, estado simples
└─ UiContext                → Padrão OK, simplificar
```

#### ❌ Jogar Fora

```
❌ README_NOVO.md + outras docs antigas
❌ Componentes "temporary" ou "old_"
❌ Testes quebrados
❌ CSS inline ou inline styles (usar Tailwind)
❌ Magic numbers em componentes
```

#### 🟡 Reescrever

```
Pages/
├─ Reescrever com Next.js 14 App Router
├─ Adicionar Server Components onde aplicável
└─ SSR/ISR para performance

Styles/
├─ Mover tudo para Tailwind
├─ Remover CSS modules antigos
└─ Tema consistente

Services/
├─ Mover fetch calls para server actions
├─ Tipos TypeScript completos
└─ Error handling robusto
```

---

### `/database/` - ✅ MIGRAR

**Status:** 100% reutilizável (com ajustes DB)

```
schema.sql                     ✅ IMPORTAR
├─ Validar sintaxe PostgreSQL (vs SQLite atual)
├─ Ajustar tipos (INTEGER → SERIAL, etc)
├─ Testar create table
└─ Criar migration script version 001

migrations/                    ✅ REUTILIZAR
├─ Adicionar timestamp se não houver
├─ Estruturar em padrão de versionamento
│  (001_create_users.sql, 002_create_bookings.sql, etc)
└─ Testar cada migration individual

seeds/                         🟡 ADAPTAR
├─ Manter dados de referência (services, categories)
├─ Descartar dados de teste
└─ Estruturar para cada ambiente (dev, staging, prod)

queries/                       ✅ REUTILIZAR
├─ Manter queries úteis como referência
├─ Otimizar com índices se faltarem
└─ Documentar performance em comments
```

---

### `/public/` e Assets - 🟢 DESCARTAR + RECRIAR

**Status:** 0% reutilizável

```
❌ index.html (antigo)
❌ admin-login-new.html
❌ app-completo.js
❌ service-worker.js (antigo)
❌ Toda estrutura "public"

✅ Novo em Next.js:
├─ public/ folder com assets estáticos
├─ service-worker.js moderno (PWA)
├─ manifest.json atualizado
└─ Favicon, images, etc refazendo
```

---

### `/scripts/` - 🟡 ADAPTAR/RECRIAR

**Status:** 30% reutilizável

```
Manter Lógica (30%):
├─ backup_sqlite.sh → Refazer para PostgreSQL
├─ seed-data.sql → Adaptar para novo schema
├─ validate_env.py → Reutilizar com ajustes
└─ Conceitos de setup/deploy

Recriar Totalmente (70%):
├─ setup.sh → Novo flow de setup
├─ dev.sh → Novo com Docker compose atualizado
├─ test.sh → Novo com jest/pytest atualizado
├─ deploy.sh → Novo para stack atual
└─ migrate.sh → Novo para PostgreSQL migrations
```

---

### `package.json` (Root + Backend + Frontend) - ❌ REESCREVER

**Status:** 0% reutilizável

```
Será criado novo com:
├─ Dependências atualizadas
├─ Scripts limpos para novo flow
├─ Monorepo setup (workspaces)
└─ Sem resquícios do projeto antigo

NPM Scripts Novos:
├─ setup          → Setup completo (deps, DB)
├─ dev            → Dev local (backend + frontend)
├─ dev:docker     → Dev com Docker
├─ test           → Testes (unit + integration + e2e)
├─ test:watch     → Testes em watch mode
├─ build          → Build backend + frontend
├─ lint           → Linting + formatte
├─ type-check     → TypeScript verification
├─ db:create      → Criar banco
├─ db:migrate     → Rodar migrations
├─ db:seed        → Popular com dados iniciais
├─ deploy         → Deploy para produção
└─ clean          → Limpar build artifacts
```

---

### Documentação - ✅ GUARDAR TUDO

**Status:** 100% reutilizável

```
✅ GUIA_BOAS_PRATICAS_COMPLETO.md
✅ GUIA_RAPIDO.md
✅ CONTRIBUINDO.md
✅ TESTING_STRATEGY.md
✅ API_REFERENCE.md (adaptado para novo projeto)
✅ DEPLOYMENT_GUIDE.md
✅ ARCHITECTURE_GUIDE.md
✅ TROUBLESHOOTING.md
✅ README.md (atualizar com novo stack)

❌ Descartar:
├─ Docs que referem stack antigo
├─ README_NOVO.md (fazer um novo)
├─ Documentação de features cortadas
└─ Notas de debugging antigo
```

---

## 📋 CHECKLIST DE MIGRAÇÃO POR MÓDULO

### Backend Services (Prioridade)

- [ ] **Week 1 - MVP Core**
  - [ ] BookingService → typescript version
  - [ ] AuthService → simplificar + typescript
  - [ ] PaymentService → typescript version
  - [ ] ValidationSchemas → converter para zod/joi

- [ ] **Week 2 - Core Features**
  - [ ] NotificationService → typescript version
  - [ ] ReviewService → typescript version
  - [ ] StaffService → typescript version
  - [ ] PricingService → typescript version

- [ ] **Week 3 - Secundário**
  - [ ] AnalyticsService → recriar com query otimizadas
  - [ ] SearchService → novo com melhores índices
  - [ ] RecommendationService → novo/simplificado

### Database

- [ ] Exportar schema.sql
- [ ] Converter tipos SQLite → PostgreSQL
- [ ] Criar migration scripts (versioned 001, 002, etc)
- [ ] Testar import em novo DB
- [ ] Testar seed data
- [ ] Validar índices e performance

### Frontend

- [ ] Exportar conceitos de componentes
- [ ] Redesenhar com novo design system
- [ ] Reescrever com Next.js 14 App Router
- [ ] Adicionar tipos TypeScript
- [ ] Usar Tailwind para styling
- [ ] Mover fetch para Server Actions/API routes

### Testing

- [ ] Backend: Jest + Supertest (recriar do zero)
- [ ] Frontend: Jest + React Testing Library (recriar)
- [ ] E2E: Playwright (recriar com novo flow)
- [ ] Target: 80%+ coverage

---

## 🎯 PRÓ XIMOS PASSOS

1. **Exportar Code que Será Reutilizado**
   ```bash
   # Services
   tar -czf backups/services_to_migrate.tar.gz backend/src/services/
   
   # Schemas
   tar -czf backups/schemas_to_migrate.tar.gz backend/src/utils/joiSchemas*
   
   # Database
   tar -czf backups/database_schema.tar.gz database/
   ```

2. **Criar Projeto Novo**
   - Branch `main-clean` com nova estrutura
   - Stack: Node 20, TypeScript, Express, Next.js 14, PostgreSQL 15, Redis 7

3. **Começar Migração**
   - Week 1: Core functionality (auth + booking + payment)
   - Week 2: Features (reviews + staff + notifications)
   - Week 3: Enhancement (search + analytics + chat)
   - Week 4: QA + deployment

---

**Documento:** Auditoria Completa  
**Status:** ✅ Pronto para Fase 2  
**Próximo:** Criar novo projeto base

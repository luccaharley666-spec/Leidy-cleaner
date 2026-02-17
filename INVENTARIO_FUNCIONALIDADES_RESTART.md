# 📋 Inventário de Funcionalidades - Restart do Projeto

**Projeto:** Limpeza Pro - Plataforma de Agendamento de Limpeza  
**Status Atual:** Produção (mas com código desorganizado)  
**Data:** Fevereiro 2026  
**Objetivo:** Mapear todas as features para recomeçar do zero mantendo o essencial

---

## 🎯 O que o Site Faz (Visão Geral)

**Plataforma profissional de agendamento de limpeza com:**
- ✅ Sistema de booking/agendamento com calendário
- ✅ Pagamentos integrados (Stripe, PIX)
- ✅ Sistema de avaliações e reviews
- ✅ Dashboard administrativo
- ✅ Notificações (email, WhatsApp)
- ✅ Perfis de usuários e staff
- ✅ Autenticação JWT + 2FA avançado
- ✅ Chat em tempo real
- ✅ Analytics e relatórios
- ✅ Integração OAuth

---

## 📊 Funcionalidades por Módulo

### 🔐 AUTENTICAÇÃO & SEGURANÇA
| Feature | Status | Prioridade | Detalhes |
|---------|--------|-----------|----------|
| Login/Logout | ✅ | 🔴 Crítica | JWT 24h + Refresh tokens |
| Registro de Usuário | ✅ | 🔴 Crítica | Email + validação |
| Senha & Reset | ✅ | 🔴 Crítica | Bcrypt (salt 12), recovery link |
| 2FA Avançado | ✅ | 🟡 Alta | TOTP, SMS, backup codes |
| OAuth (Google, GitHub, etc) | ✅ | 🟢 Média | Social login |
| CSRF Protection | ✅ | 🔴 Crítica | Token-based |
| Rate Limiting | ✅ | 🔴 Crítica | 100 req/15min por IP |
| PCI-DSS v3.2.1 | ✅ | 🔴 Crítica | Tokenização Stripe |

**Controllers:** `AuthController.js`, `Advanced2FAController.js`, `OAuthController.js`

---

### 📅 AGENDAMENTOS & BOOKING
| Feature | Status | Prioridade | Detalhes |
|---------|--------|-----------|----------|
| Criar Agendamento | ✅ | 🔴 Crítica | Sistema de booking com calendário |
| Listar Agendamentos | ✅ | 🔴 Crítica | Filtros: data, status, serviço |
| Editar Agendamento | ✅ | 🟡 Alta | Atualizar data/serviço/notas |
| Cancelar Agendamento | ✅ | 🟡 Alta | Com motivo + reembolso |
| Agendamentos Recorrentes | ✅ | 🟢 Média | Semanal, quinzenal, mensal |
| Auto-scheduling | ✅ | 🟢 Baixa | Sugestão automática de horários |
| Pricing Dinâmico | ✅ | 🟡 Alta | Cálculo por metragem/urgência |
| Histórico de Preços | ✅ | 🟢 Média | Rastreamento de mudanças |

**Controllers:** `BookingController.js`, `RecurringBookingController.js`, `AutoSchedulingController.js`, `HourPricingController.js`, `PricingController.js`

**Tabelas DB:** `bookings`, `booking_services`, `services`

---

### 💳 PAGAMENTOS & TRANSAÇÕES
| Feature | Status | Prioridade | Detalhes |
|---------|--------|-----------|----------|
| Integração Stripe | ✅ | 🔴 Crítica | Payment methods, refunds, webhooks |
| Pagamento PIX | ✅ | 🟡 Alta | QR code + integração |
| Webhook de Pagamento | ✅ | 🔴 Crítica | Confirmação automática |
| Histórico de Transações | ✅ | 🟡 Alta | Rastreamento completo |
| Reembolsos | ✅ | 🟡 Alta | Processamento automático |
| Mock Mode (Dev) | ✅ | 🟢 Média | Testes sem real payment |

**Controllers:** `PaymentController.js`, `PixPaymentController.js`, `PixWebhookController.js`, `PaymentIntegrationController.js`, `AdvancedPaymentController.js`, `WebhookController.js`

**Tabelas DB:** `transactions`

---

### ⭐ AVALIAÇÕES & REVIEWS
| Feature | Status | Prioridade | Detalhes |
|---------|--------|-----------|----------|
| Criar Review | ✅ | 🟡 Alta | Rating 1-5 + comentário |
| Upload Fotos | ✅ | 🟡 Alta | Até 8 imagens (max 5MB) |
| Moderar Reviews | ✅ | 🟡 Alta | Admin aprova antes de publicar |
| Reviews Públicos | ✅ | 🟡 Alta | Feed de avaliações |
| Reputação Staff | ✅ | 🟢 Média | Score baseado em feedback |

**Controllers:** `ReviewController.js`, `ReviewImageController.js`, `PublicReviewsController.js`

**Tabelas DB:** `reviews`

---

### 👥 PERFIS & USUÁRIOS
| Feature | Status | Prioridade | Detalhes |
|---------|--------|-----------|----------|
| Perfil de Cliente | ✅ | 🔴 Crítica | Nome, email, telefone, endereço |
| Perfil de Staff | ✅ | 🔴 Crítica | Bio, fotos, avaliações, horários |
| Avatar/Foto do Perfil | ✅ | 🟢 Média | Upload e armazenamento |
| Dados Sociais | ✅ | 🟢 Baixa | LinkedIn, Instagram, etc |
| Disponibilidade Staff | ✅ | 🟡 Alta | Calendário de horários disponíveis |

**Controllers:** `ProfileController.js`, `StaffController.js`, `StaffAvailabilityController.js`, `PhotosController.js`

**Tabelas DB:** `users` (com role field)

---

### 📢 NOTIFICAÇÕES
| Feature | Status | Prioridade | Detalhes |
|---------|--------|-----------|----------|
| Email Notifications | ✅ | 🔴 Crítica | Confirmação, lembretes, alertas |
| WhatsApp Notifications | ✅ | 🟡 Alta | Via Twilio (2-way messaging) |
| Push Notifications | ✅ | 🟡 Alta | Web/App push |
| Smart Notifications | ✅ | 🟢 Média | Tempo otimizado de envio |
| Newsletter | ✅ | 🟢 Média | Ofertas, novidades |
| SMS | ✅ | 🟢 Média | Via Twilio |

**Controllers:** `NotificationController.js`, `NotificationsController.js`, `PushNotificationController.js`, `SmartNotificationController.js`, `NewsletterController.js`

**Tabelas DB:** `notifications`

---

### 📊 ADMIN & DASHBOARD
| Feature | Status | Prioridade | Detalhes |
|---------|--------|-----------|----------|
| Dashboard Analítico | ✅ | 🟡 Alta | Gráficos, métricas, KPIs |
| Gerenciar Usuários | ✅ | 🟡 Alta | Ativar, desativar, deletar |
| Gerenciar Serviços | ✅ | 🔴 Crítica | CRUD de categorias e preços |
| Gerenciar Bookings | ✅ | 🟡 Alta | Atribuir staff, status |
| Gerenciar Reviews | ✅ | 🟡 Alta | Aprovar, rejeitar, deletar |
| Relatórios | ✅ | 🟡 Alta | Exportar dados, gráficos |
| Backup & Restore | ✅ | 🔴 Crítica | Automático + manual |
| Analytics Avançado | ✅ | 🟢 Média | Tendências, previsões |

**Controllers:** `AdminController.js`, `AdminDashboardController.js`, `AnalyticsController.js`, `ReportsController.js`, `BackupController.js`, `DatabaseOptimizationController.js`

---

### 💬 CHAT & COMUNICAÇÃO
| Feature | Status | Prioridade | Detalhes |
|---------|--------|-----------|----------|
| Chat em Tempo Real | ✅ | 🟢 Média | Entre cliente e staff |
| Histórico de Mensagens | ✅ | 🟢 Média | Com timestamp e leitura |
| Notificações de Chat | ✅ | 🟢 Média | Em tempo real |

**Controllers:** `ChatController.js`

---

### 🔍 BUSCA & RECOMENDAÇÕES
| Feature | Status | Prioridade | Detalhes |
|---------|--------|-----------|----------|
| Busca de Serviços | ✅ | 🟡 Alta | Por nome, categoria, preço |
| Filtros Avançados | ✅ | 🟡 Alta | Disponibilidade, ratings, preço |
| Recomendações Personalizadas | ✅ | 🟢 Média | ML-based ou rule-based |
| SEO & Marketing | ✅ | 🟢 Média | Meta tags, sitemap |

**Controllers:** `SearchController.js`, `RecommendationController.js`, `SEOMarketingController.js`

---

### 🎁 PROGRAMA DE REFERRAL
| Feature | Status | Prioridade | Detalhes |
|---------|--------|-----------|----------|
| Referral Links | ✅ | 🟢 Média | Geração e rastreamento |
| Bonificação | ✅ | 🟢 Média | Crédito ou cashback |
| Histórico | ✅ | 🟢 Média | Referrals bem-sucedidos |

**Controllers:** `ReferralController.js`

---

### 🖼️ UPLOADS & CDN
| Feature | Status | Prioridade | Detalhes |
|---------|--------|-----------|----------|
| Upload de Fotos | ✅ | 🟡 Alta | Reviews, perfil, serviços |
| Validação de Arquivo | ✅ | 🟡 Alta | Mime type, tamanho (5MB max) |
| Armazenamento | ✅ | 🟡 Alta | Local ou CDN |
| CDN Assets | ✅ | 🟢 Média | Servir arquivos otimizados |

**Controllers:** `PhotosController.js`, `CDNAssetController.js`

---

### ⚙️ INTEGRAÇÕES & WEBHOOKS
| Feature | Status | Prioridade | Detalhes |
|---------|--------|-----------|----------|
| Stripe Webhooks | ✅ | 🔴 Crítica | Payment events |
| PIX Webhooks | ✅ | 🔴 Crítica | Confirmação de pagamento |
| Email Service | ✅ | 🔴 Crítica | SendGrid, Mailgun |
| WhatsApp/SMS | ✅ | 🟡 Alta | Twilio |
| OAuth | ✅ | 🟡 Alta | Google, GitHub |
| Custom Webhooks | ✅ | 🟢 Média | Para integrações externas |

**Controllers:** `WebhookController.js`, `IntegrationController.js`

---

### 🌐 FEATURES AVANÇADAS
| Feature | Status | Prioridade | Detalhes |
|---------|--------|-----------|----------|
| Smart Features | ✅ | 🟢 Média | IA, autocompletar, sugestões |
| Background Jobs | ✅ | 🟡 Alta | Cron jobs, email queue |
| Caching | ✅ | 🟡 Alta | Redis para performance |
| Health Checks | ✅ | 🔴 Crítica | Liveness, readiness probes |

**Controllers:** `SmartFeaturesController.js`, `BackgroundJobController.js`, `HealthCheckController.js`, `CachedController.js`

---

## 🗄️ ESTRUTURA DE DADOS (Database)

### Tabelas Principais (SQLite/PostgreSQL)

```sql
-- Core
users              -- Clientes, staff, admin
services           -- Tipos de limpeza (cozinha, banheiro, etc)
bookings           -- Agendamentos
booking_services   -- Relação N:N de serviços por agendamento

-- Transações
transactions       -- Histórico de pagamentos
reviews            -- Avaliações de clientes
notifications      -- Histórico de notificações
```

### Campos Importantes por Tabela

**users:**
- `id`, `name`, `email`, `phone`, `password_hash`
- `address`, `profile_image`, `avatar_url`
- `role` (customer, staff, admin)
- `is_active`, `last_login`, `created_at`, `updated_at`

**services:**
- `id`, `name`, `description`
- `base_price`, `duration_minutes`, `category`
- `icon`, `is_active`

**bookings:**
- `id`, `user_id`, `team_member_id`, `service_id`
- `booking_date`, `address`, `notes`, `metragem`
- `frequency`, `urgency`, `total_price`
- `status`, `payment_status`, `created_at`, `updated_at`

**transactions:**
- `id`, `booking_id`, `user_id`, `amount`
- `payment_method`, `payment_gateway_id` (Stripe ID, PIX ID)
- `status` (pending, completed, failed, refunded)

**reviews:**
- `id`, `booking_id`, `user_id`
- `rating` (1-5), `comment`, `images` (JSON)
- `is_verified`, `is_approved`

---

## 📦 DADOS IMPORTANTES A PRESERVAR

### ✅ DEFINIR COMO DEVE SER FEITO NO NOVO PROJETO

#### 1️⃣ **BANCO DE DADOS**
- [ ] Exportar schema do banco atual
- [ ] Exportar dados de referência (services, preços base)
- [ ] Criar migration scripts para novo banco
- [ ] Testar importação em novo DB

```bash
# Export schema
pg_dump -s --no-owner vammos_db > schema.sql

# Export data (referência apenas, não transações)
pg_dump vammos_db --data-only --table=services > services.sql
pg_dump vammos_db --data-only --table=users --where="role != 'customer'" > staff.sql
```

#### 2️⃣ **CÓDIGO VALIOSO**
Manter de cada módulo:
- ✅ Services (lógica de negócio)
- ✅ Validations (regras de dados)
- ✅ Utils (helpers, formatters)
- ❌ Controllers (serão reescritos)
- ❌ Routes (serão reorganizadas)

**Controllers a Revisar:**
- `BookingService.js` - Lógica de preço, disponibilidade
- `PaymentService.js` - Parse Stripe, PIX
- `NotificationService.js` - Envio de email/WhatsApp
- `ValidationSchemas.js` - Regras de validação (Joi)
- `StripeService.js` - Tokenização PCI-DSS

#### 3️⃣ **DOCUMENTAÇÃO MANTIDA**
- ✅ API.md - Endpoints e exemplos
- ✅ INTEGRATIONS.md - Stripe, PIX, Twilio
- ✅ DATABASE_SCHEMA.md - Estrutura de dados
- ✅ BOAS_PRÁTICAS.md - Padrões do projeto

#### 4️⃣ **CONFIGURAÇÕES & SECRETS**
- [ ] Documentar variáveis .env necessárias
- [ ] Manter backup de keys (Stripe, Twilio, etc)
- [ ] **NÃO** commitar secrets

**Variáveis Críticas (.env):**
```
# Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
PIX_API_KEY=...

# Email & SMS
SENDGRID_API_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...

# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Auth
JWT_SECRET=...
JWT_EXPIRE=24h

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# Monitoring
SENTRY_DSN=...

# Emails
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
```

---

## 🚀 CHECKLIST PARA RESTART

### Fase 1: Preparação (1-2 dias)
- [ ] **Backup completo:** Git backup branch + export data
- [ ] **Análise de código:** Identificar serviços a salvaguardar
- [ ] **Auditoria de schema:** Exportar migration scripts
- [ ] **Documentação de features:** Este documento ✓
- [ ] **Teste de backup:** Validar que importação funciona

```bash
# Criar backup seguro
git checkout -b backup/vammos-old-version
git push origin backup/vammos-old-version

# Exportar dados críticos
mkdir -p backups/
pg_dump $DATABASE_URL > backups/full_backup.sql
tar -czf backups/backend_src.tar.gz backend/src/
tar -czf backups/frontend_src.tar.gz frontend/src/
```

### Fase 2: Criar Nova Base (3-5 dias)
- [ ] **Inicializar projeto novo** com stack limpo
  - Node.js 20 LTS
  - TypeScript 5.3+
  - Express 4.18+
  - Next.js 14+
  - PostgreSQL 15
  - Redis 7
- [ ] **Estrutura de diretórios** limpa e profissional
- [ ] **Docker setup** (dev/prod)
- [ ] **GitHub Actions** (CI/CD)
- [ ] **Database migrations** framework
- [ ] **Tests base** (Jest, Supertest, Cypress)

### Fase 3: Migrar Código (5-10 dias)
- [ ] **Services & Utilities** reescrever com TypeScript
  - BookingService
  - PaymentService
  - NotificationService
  - ValidationSchemas
  - StripeService
- [ ] **Database schema** importar e validar
- [ ] **Controllers** reescrever (RESTful patterns)
- [ ] **Frontend components** portar (React patterns modernos)
- [ ] **Tests** recriar com cobertura 80%+

### Fase 4: Validação & Deploy (2-3 dias)
- [ ] **Testes completos** (unit, integration, E2E)
- [ ] **Load testing** (simular usuários)
- [ ] **Security audit** (OWASP top 10)
- [ ] **Performance baseline** (Lighthouse)
- [ ] **Staging deploy** testes finais
- [ ] **Historic data** importar com validação
- [ ] **Cutover plan** zero-downtime deploy

---

## 📋 FEATURES POR PRIORIDADE DE IMPLEMENTAÇÃO

### 🔴 CRÍTICAS (MVP - Week 1-2)
1. Autenticação (JWT)
2. User profiles
3. Services (CRUD)
4. Bookings (criar, listar)
5. Pagamentos Stripe (básico)
6. Email notifications
7. Health checks

### 🟡 ALTAS (Week 2-3)
1. Booking completo (editar, cancelar)
2. Reviews & ratings
3. Admin dashboard
4. Staff profiles
5. PIX payments
6. WhatsApp notifications
7. Pricing dinâmico

### 🟢 MÉDIAS (Week 3-4)
1. Agendamentos recorrentes
2. Chat em tempo real
3. Referral program
4. Analytics avançado
5. Recomendações ML
6. 2FA avançado
7. OAuth (Google, GitHub)

### 🔵 BAIXAS (Pós-MVP)
1. Smart features (IA)
2. Auto-scheduling
3. SEO/Marketing
4. Background jobs otimizados
5. Caching avançado

---

## 💾 RESUMO: O QUE FAZER COM CADA PARTE

| Item | Ação | Motivo |
|------|------|--------|
| Controllers (50+) | ❌ DELETAR | Será refatorado com padrões limpos |
| Services/Utils | ✅ REVISAR | Lógica de negócio pode ser salvaguardada |
| Database schema | ✅ MIGRAR | Estrutura de dados validada |
| Dados de usuário | ✅ EXPORTAR | Backup antes de wipe |
| Transações/reviews | ✅ ARQUIVAR | Guardar em backup para auditoria |
| Tests | ❌ RECRIAR | Sem cobertura adequada |
| Docker config | 🟡 ADAPTAR | Estrutura OK, scripts precisam atualizar |
| Documentação | ✅ PRESERVAR | Guias técnicos reutilizáveis |
| npm scripts | ❌ RECRIAR | Serão atualizados para nova estrutura |
| GitHub Actions | 🟡 ADAPTAR | CI/CD patterns OK, config muda |

---

## 🎬 PRÓXIMOS PASSOS

1. **Começar Fase 1: Preparação**
   ```bash
   # Criar branch de backup
   git checkout -b backup/vammos-old-version
   git push origin backup/vammos-old-version
   
   # Exportar dados críticos
   mkdir -p backups/db
   node scripts/export-critical-data.js
   ```

2. **Validação de Salvaguarda**
   - [ ] Confirmar backup OK
   - [ ] Testar restauração
   - [ ] Documentar processo

3. **Iniciar Projeto Novo**
   - Será criado branch `main-v2` ou `main-clean`
   - Stack: Node 20, TypeScript, Express, Next.js 14, PostgreSQL 15, Redis 7
   - Documentação & scripts do projeto anterior serão integrados

---

**Status:** ✅ Inventário Completo  
**Próximo:** Aguardando confirmação para iniciar Fase 1 (Preparação + Backup)

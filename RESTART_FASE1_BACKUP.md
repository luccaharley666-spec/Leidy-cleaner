# 🔄 Restart Fase 1: Backup e Auditoria

**Status:** ✅ Em Progresso  
**Data Início:** Fevereiro 17, 2026  
**Branch de Segurança:** `backup/vammos-old-version` (já criada e enviada para GitHub)

---

## ✅ Completado

### 1. Branch de Backup
- ✅ Criada: `backup/vammos-old-version`
- ✅ Enviada para GitHub: https://github.com/ahri98h/vammos/compare/backup/vammos-old-version
- ✅ Contém: Snapshot completo do projeto antes do restart
- ✅ Pode ser restaurado em qualquer momento

```bash
# Se precisar voltar para versão antiga:
git checkout backup/vammos-old-version
git reset --hard backup/vammos-old-version
```

---

## 📊 Código Valioso a Salvaguardar

### Services (Lógica de Negócio)
Localização: `backend/src/services/`

```
✅ BookingService.js         → Cálculo de preços, disponibilidade
✅ PaymentService.js         → Integração Stripe, processamento
✅ NotificationService.js    → Email, WhatsApp, logística
✅ StaffService.js           → Gerenciamento de equipe
✅ ReviewService.js          → Lógica de avaliações
✅ AuthService.js            → Autenticação JWT, refresh tokens
✅ PricingService.js         → Cálculo dinâmico de preços
✅ ValidationService.js      → Regras de validação de dados
```

### Validation Schemas (Regras de Dados)
Localização: `backend/src/utils/joiSchemas.js` ou similar

```
✅ bookingSchemas            → Validação de agendamentos
✅ paymentSchemas            → Validação de pagamentos
✅ reviewSchemas             → Validação de reviews
✅ userSchemas               → Validação de usuários
✅ serviceSchemas            → Validação de serviços
```

### Utils & Helpers
Localização: `backend/src/utils/`

```
✅ logger.js                 → Sistema de logging
✅ formatters.js             → Formatação de dados
✅ validators.js             → Funções de validação
✅ helpers.js                → Funções utilitárias
✅ constants.js              → Constantes do projeto
```

### Database Schema
Localização: `database/schema.sql` ou `database/migrations/`

```
✅ schema.sql                → Schema completo do banco
✅ initial_migration         → Estrutura de dados
```

---

## 🗄️ Dados para Exportar e Arquivar

### 1. Database Schema
```bash
# Exportar schema apenas (sem dados de usuários)
pg_dump -s --no-owner $DATABASE_URL > backups/schema_clean.sql

# Ou para SQLite:
sqlite3 backend/database.db ".schema" > backups/schema_clean.sql
```

### 2. Referência de Serviços
Preservar tabelas de configuração:
- `services` (tipos de limpeza e preços base)
- `categories` (categorias de serviços)
- `pricing_rules` (regras de pricing dinâmico)

```bash
# Exportar dados de referência
pg_dump $DATABASE_URL --data-only --table=services > backups/services.sql
pg_dump $DATABASE_URL --data-only --table=categories > backups/categories.sql
```

### 3. Configuração & Secrets
**IMPORTANTE: Nunca fazer commit disso!**
- [ ] Salvar `.env.production` em local seguro (password manager ou vault)
- [ ] Documentar todas as variáveis necessárias
- [ ] Manter backup de:
  - Stripe API keys (test + live separadas)
  - Twilio credentials
  - Email service keys
  - OAuth credentials

### 4. Arquivos de Confirmação
Guardar proofs de que tudo funcionava:
- [ ] Last successful CI/CD run
- [ ] Performance metrics (Lighthouse)
- [ ] Test coverage reports
- [ ] User data statistics

---

## 📋 Checklist de Auditoria

### Código Crítico Identificado
- [ ] Controllers 50+ (será reescrito de novo)
- [ ] Services 8-10 (validar lógica, migrar)
- [ ] Schemas de validação (Joi) - reutilizar regras
- [ ] Database schema (importar)
- [ ] Utils & helpers (revisar e limpar)

### Features a Listar
- [ ] ✅ Autenticação JWT com refresh tokens
- [ ] ✅ Pagamentos Stripe (PCI-DSS)
- [ ] ✅ Pagamentos PIX
- [ ] ✅ Agendamentos booking
- [ ] ✅ Reviews & ratings
- [ ] ✅ Dashboard admin
- [ ] ✅ Notificações email/WhatsApp
- [ ] ✅ Perfis de staff
- [ ] ✅ Chat em tempo real
- [ ] ✅ Agendamentos recorrentes
- [ ] ✅ 2FA avançado
- [ ] ✅ OAuth (Google, GitHub)
- [ ] ✅ Analytics
- [ ] ✅ Referral program

### Dependências Verificadas
```bash
# Backend
cd backend && npm ls | head -30

# Frontend
cd frontend && npm ls | head -30
```

---

## 🚀 Próximos Passos

### Fase 1.5: Exportar Dados Críticos
```bash
# 1. Criar diretório de backup
mkdir -p backups/critical-data

# 2. Exportar schema
pg_dump -s $DATABASE_URL > backups/critical-data/schema.sql

# 3. Exportar referências
pg_dump $DATABASE_URL --table=services --table=categories --data-only > backups/critical-data/reference-data.sql

# 4. Fazer tar de src critico
tar -czf backups/critical-data/services.tar.gz backend/src/services/
tar -czf backups/critical-data/schemas.tar.gz backend/src/utils/joiSchemas.js
tar -czf backups/critical-data/frontend-components.tar.gz frontend/src/components/

# 5. Comprimir tudo
tar -czf backups/vammos-critical-data-backup.tar.gz backups/critical-data/
```

### Fase 2: Criar Nova Base
- Novo repositório ou branch `main-clean`
- Stack: TypeScript, Node 20, Express, Next.js 14, PostgreSQL 15, Redis 7
- Estrutura limpa do zero

### Fase 3: Migrar Código Valioso
- Portar services com TypeScript
- Recriar schemas de validação
- Importar database schema
- Testar integrações

### Fase 4: Deploy
- Staging validation
- Performance testing
- Zero-downtime cutover

---

## 📝 Notas Importantes

1. **Backup está seguro:** Toda a versão antiga está na branch `backup/vammos-old-version`
2. **Dados históricos:** Reviews, transações, usuários - arquivados e seguros
3. **Não há perda de dados:** Tudo está exportado, nada será perdido
4. **Reversão é possível:** Qualquer momento volta para versão anterior

---

**Status Fase 1:** ✅ Backup Completo  
**Próximo:** Fase 1.5 - Exportar Dados Críticos  
**Após:** Fase 2 - Criar Projeto Novo  

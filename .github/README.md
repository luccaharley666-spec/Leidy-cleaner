# 🚀 CI/CD Pipeline - Limpeza Pro

## 📋 Visão Geral

Este diretório contém a configuração completa de integração contínua e deploy contínuo (CI/CD) para a plataforma Limpeza Pro usando GitHub Actions.

---

## 📁 Estrutura

```
.github/
├── workflows/
│   └── ci-cd.yml              # Pipeline principal (testes, build, deploy)
├── SECRETS_SETUP.md            # Guia de configuração de secrets
└── README.md                   # Este arquivo
```

---

## 🔄 Pipeline Automatizado

### Jobs Executados

#### 1️⃣ **Test Job** (Paralelo: Backend + Frontend)
- Executa `npm test -- --coverage`
- Gera relatórios de cobertura
- Upload para Codecov
- Tempo: ~2-5 minutos

#### 2️⃣ **Lint Job** (Paralelo: Backend + Frontend)
- Executa ESLint
- Verifica vulnerabilidades npm
- Não bloqueia deploy em falha
- Tempo: ~1 minuto

#### 3️⃣ **Build Job** (Paralelo: Backend + Frontend)
- Depende de: Test + Lint (sucesso obrigatório)
- Otimização de produção
- Upload de artifacts
- Tempo: ~3-5 minutos

#### 4️⃣ **Deploy Staging** (Se branch = develop)
- Depende de: Build
- Deploy Frontend → Vercel Staging
- Deploy Backend → Railway Staging
- Notificação Slack
- Tempo: ~3-5 minutos

#### 5️⃣ **Deploy Production** (Se branch = main)
- Depende de: Build
- Deploy Frontend → Vercel Production
- Deploy Backend → Railway Production
- Release GitHub automático
- Notificação Slack
- Tempo: ~5-10 minutos

#### 6️⃣ **Report Job** (Final)
- Gera relatórios de cobertura
- Comenta em PRs
- Upload de artifacts
- Tempo: ~30 segundos

---

## 🔐 Configuração de Secrets

### Variáveis Obrigatórias

| Secret | Descrição | Onde Obter |
|--------|-----------|-----------|
| `VERCEL_TOKEN` | Token de autenticação Vercel | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | ID da organização Vercel | Vercel Dashboard > Settings |
| `VERCEL_PROJECT_ID` | ID do projeto Vercel (Prod) | Vercel Dashboard > Project Settings |
| `[REDACTED_TOKEN]` | ID do projeto Vercel (Staging) | Vercel Dashboard > Project Settings |
| `RAILWAY_TOKEN` | Token de autenticação Railway | https://railway.app/account/tokens |
| `RAILWAY_PROJECT_ID` | ID do projeto Railway (Prod) | Railway Dashboard > Project Settings |
| `[REDACTED_TOKEN]` | ID do projeto Railway (Staging) | Railway Dashboard > Project Settings |
| `SLACK_WEBHOOK` | Webhook URL do Slack | https://api.slack.com/apps (Incoming Webhooks) |

### Como Configurar

1. Abra: **Settings** > **Secrets and variables** > **Actions**
2. Clique: **New repository secret**
3. Adicione cada secret conforme tabela acima
4. Confirme

---

## 🚀 Como Usar

### Deploy para Staging
```bash
# Criar feature branch
git checkout -b feature/minha-feature

# Fazer alterações e commit
git add .
git commit -m "Nova feature"

# Push para develop
git push origin develop

# 🔄 Pipeline executa automaticamente
# Veja em: Actions > CI/CD Pipeline - Limpeza Pro
```

### Deploy para Produção
```bash
# Fazer pull request develop → main
# Aguardar approval

# Merge para main
git checkout main
git merge develop
git push origin main

# 🚀 Deploy automático para produção
# Release criada: https://github.com/seu-repo/releases
```

---

## 📊 Visualizar Pipeline

### Na interface GitHub

1. Vá para: **Actions** tab
2. Clique em: **CI/CD Pipeline - Limpeza Pro**
3. Selecione: Run mais recente
4. Veja: Status de cada job

### Status Badges

```markdown
![CI/CD Pipeline](https://github.com/seu-usuario/seu-repo/actions/workflows/ci-cd.yml/badge.svg)
```

---

## 🧪 Testes

### Cobertura de Testes

- **Backend**: 25%+ das linhas
- **Frontend**: 10%+ das linhas
- **Meta**: 30%

### Failings

Se testes falharem:

1. **Clone repositório localmente**
   ```bash
   git clone <repo>
   ```

2. **Reproduza o erro**
   ```bash
   cd backend
   npm test
   ```

3. **Corrija localmente**
   ```bash
   npm test -- --watch
   ```

4. **Commit e push**
   ```bash
   git push origin sua-branch
   ```

---

## 🐛 Troubleshooting

### Pipeline não inicia

❌ **Problema**: Workflow não aparece em Actions
✅ **Solução**: 
- Verifique se `.github/workflows/ci-cd.yml` existe
- Aguarde 2-3 minutos após push
- Faça refresh da página

### Tests falhando

❌ **Problema**: Job "Test" falha
✅ **Solução**:
```bash
npm test -- --coverage
# Verifique o resultado localmente
```

### Deploy falhando

❌ **Problema**: Job "Deploy" falha
✅ **Solução**:
- Verifique se secrets estão corretos
- Confirme se tokens não expiraram
- Verifique logs do job (clique em job > ver logs)

### Slack não recebe notificação

❌ **Problema**: Notificação Slack não chega
✅ **Solução**:
- Verifique se webhook URL está correto
- Confirme se canal existe
- Teste webhook manualmente com curl

### Codecov não aparece

❌ **Problema**: Relatório não aparece em codecov.io
✅ **Solução**:
- Sincronize repo em codecov.io
- Aguarde 2-3 minutos
- Verifique arquivo `lcov.info` foi gerado

---

## 📈 Monitoramento

### Tempo de Execução

Tempo médio por job:
- Test: 2-5 min
- Lint: 1 min
- Build: 3-5 min
- Deploy: 3-10 min
- **Total**: 10-25 min (tudo em paralelo onde possível)

### Taxa de Sucesso

Monitorar em: **Insights** > **Actions**

Objetivo: > 95%

---

## 🔄 Ambiente

### Staging (develop)
- URL: `https://staging.seu-dominio.com`
- Database: PostgreSQL staging
- Redis: Cache staging
- Logs: CloudWatch staging

### Production (main)
- URL: `https://seu-dominio.com`
- Database: PostgreSQL production
- Redis: Cache production
- Logs: CloudWatch production
- Monitoring: Sentry + NewRelic

---

## 📝 Commits e PRs

### Convenção de Commit

```
feat: Adiciona novo endpoint de agendamento
fix: Corrige bug em validação de email
docs: Atualiza README
test: Adiciona testes para PaymentService
ci: Atualiza pipeline GitHub Actions
chore: Atualiza dependências
```

### Pull Requests

1. **Criar PR** develop → main
2. **Passar em testes**: ✅ Todos os checks devem passar
3. **Approval**: Pelo menos 1 review
4. **Merge**: Squash e merge recomendado

---

## 🚨 Alertas

### Quando falha tudo

Se pipeline inteiro falha:

1. **Verifique testes localmente**
   ```bash
   npm test
   ```

2. **Limpe cache**
   ```bash
   rm -rf node_modules
   npm ci
   ```

3. **Veja logs completos no GitHub**
   - Actions > seu job > Expandir seção de erro

---

## 📞 Suporte

### Documentação
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel Deployment](https://vercel.com/docs)
- [Railway Deployment](https://docs.railway.app)
- [Sentry Integration](https://docs.sentry.io)

### Issues
- Crie issue com label `ci-cd`
- Inclua logs do GitHub Actions
- Descreva o que esperava vs o que aconteceu

---

## 🎯 Checklist de Deploy

- [ ] Todos os testes passando localmente
- [ ] Code review aprovado
- [ ] Secrets configurados no GitHub
- [ ] Branch correto (develop para staging, main para prod)
- [ ] Sem merge conflicts
- [ ] CHANGELOG.md atualizado (prod)
- [ ] Versão atualizada em package.json (prod)

---

## 📚 Próximas Etapas

- [ ] Adicionar notificações Discord
- [ ] Implementar canary deployments
- [ ] Adicionar teste de performance
- [ ] Blue-green deployment
- [ ] Database migrations automáticas
- [ ] Health checks pós-deploy


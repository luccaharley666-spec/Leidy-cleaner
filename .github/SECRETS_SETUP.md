# GitHub Actions Secrets Configuration

## 🔐 Configuração de Secrets

Para que o pipeline CI/CD funcione corretamente, você precisa adicionar os seguintes **secrets** nas configurações do repositório:

### Vercel (Frontend Deployment)
```
VERCEL_TOKEN=seu_token_vercel
VERCEL_ORG_ID=seu_org_id_vercel
VERCEL_PROJECT_ID=[REDACTED_TOKEN]
[REDACTED_TOKEN]=[REDACTED_TOKEN]
```

**Como obter:**
1. Acesse https://vercel.com/account/tokens
2. Crie um novo token
3. Copie para Settings > Secrets

### Railway (Backend Deployment)
```
RAILWAY_TOKEN=seu_token_railway
RAILWAY_PROJECT_ID=seu_project_id
[REDACTED_TOKEN]=[REDACTED_TOKEN]
```

**Como obter:**
1. Acesse https://railway.app/account/tokens
2. Crie um novo token
3. Copie para Settings > Secrets

### Notificações (Slack)
```
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**Como obter:**
1. Acesse https://api.slack.com/apps
2. Crie uma nova App
3. Ative Incoming Webhooks
4. Crie um novo webhook para seu canal

### Codecov (Coverage Reports)
```
CODECOV_TOKEN=seu_token_codecov
```

**Como obter:**
1. Acesse https://codecov.io/gh/seu-usuario/seu-repo
2. Copie o token na página de configurações

---

## 📝 Como Adicionar Secrets no GitHub

1. Vá para **Settings** > **Secrets and variables** > **Actions**
2. Clique em **New repository secret**
3. Adicione cada secret uma de cada vez
4. Commit e push para ativar o CI/CD

---

## ✅ Verificação do Pipeline

Após adicionar todos os secrets:

1. Faça um push para a branch `develop`
2. Acesse a aba **Actions** do seu repositório
3. Veja o pipeline executando automaticamente
4. Verifique se todos os jobs passam ✓

---

## 🔄 Fluxo de Deploy

### Branch: `develop` → Ambiente: **Staging**
- ✅ Testes executados
- ✅ Build gerado
- ✅ Deploy automático para Vercel Staging
- ✅ Deploy automático para Railway Staging
- ✅ Notificação no Slack

### Branch: `main` → Ambiente: **Production**
- ✅ Testes executados
- ✅ Build gerado  
- ✅ Deploy automático para Vercel Production
- ✅ Deploy automático para Railway Production
- ✅ Release criada automaticamente
- ✅ Notificação no Slack

---

## 🚨 Troubleshooting

Se um job falhar:

1. **Testes falhando?** → Verifique `npm test` localmente
2. **Build falhando?** → Verifique `npm run build` localmente
3. **Deploy falhando?** → Verifique se os tokens/IDs estão corretos
4. **Secrets não reconhecidos?** → Aguarde 2-3 minutos após adicionar

---

## 📚 Referências

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment](https://vercel.com/docs)
- [Railway Deployment](https://docs.railway.app)
- [Codecov Integration](https://docs.codecov.io)

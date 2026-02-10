# 🚀 QUICK START - Design Verde & CORS

## ⚡ 5 Minutos Para Rodar

### 1. Frontend (Verde)
```bash
cd /workspaces/mmmm/frontend
npm install --legacy-peer-deps
npm run dev
# ✅ Abrir http://localhost:3000
```

### 2. Backend (Seguro)
```bash
cd /workspaces/mmmm/backend
npm install --legacy-peer-deps
npm start
# ✅ Verificar http://localhost:3001/health
```

---

## 🎨 O Que É Novo

### Verde Leidy Cleaner
```css
Primary:    #22c55e  (energético + profissional)
Accent:     #10b981  (complementar)
Lime:       #84cc16  (destaque)
```

### Componentes Novos
- **HeroSectionGreen**: Hero com gradiente verde + CTAs
- **FeaturesGridGreen**: 6 cards com features + animações
- **Button Verde**: 5 variantes com tema green

### Landing Page
✨ **Hero** → **Features 6-cards** → **Quick Booking** → **Services** → **Pricing** → **FAQ**

---

## 🔐 CORS & Segurança

### Configuração Automática
```javascript
// Development
CORS: localhost:3000, localhost:3001
Rate Limit: OFF
Cookies: insecure

// Production
CORS: www.leidycleaner.com.br
Rate Limit: 50 req/15min
Cookies: secure + sameSite
JWT: REQUERIDO
```

### Validação de Security
```bash
# Check headers
curl -i http://localhost:3001/health

# Expected:
# [REDACTED_TOKEN]: nosniff
# X-Frame-Options: DENY
# CSP: default-src 'self'...
```

---

## 📋 Estrutura de Arquivos

### Frontend - Novos
```
frontend/
├── src/
│   ├── config/
│   │   └── envConfig.js          ← Env por stage
│   ├── styles/
│   │   └── designSystem.js        ← Design tokens
│   └── components/UI/
│       ├── HeroSectionGreen.jsx   ← Nova hero
│       ├── FeaturesGridGreen.jsx  ← Features grid
│       └── Button.jsx             ← Atualizado

frontend/
├── tailwind.config.js             ← Cores verdes
└── next.config.js                 ← Headers segurança
```

### Backend - Novos
```
backend/
└── src/config/
    └── envConfig.js               ← Env config 3 stages
```

---

## 🎯 Testando Funcionalidades

### 1. Verificar Hero Green
```bash
curl http://localhost:3000
# Procurar por:
# - Gradiente verde na h1
# - "Agendar Agora" + "Ver Serviços" CTAs
# - Stats 4.9★, 500+ clientes, 2500+ limpezas
```

### 2. Verificar Features Grid
```bash
# Scroll para baixo no http://localhost:3000
# Ver 6 cards com ícones:
# - Eco-Friendly ♻️
# - Profissionais ✓
# - Agendamento 24/7 ⏰
# - Qualidade Garantida ✨
# - Tech Smart 🔧
# - Atendimento Premium 💬
```

### 3. Verificar Responsividade
```bash
# DevTools (F12) → Toggle Device Toolbar
# Testar em: Mobile 390px, Tablet 768px, Desktop 1920px
# Tudo deve ficar limpo e bem distribuído
```

### 4. Verificar CORS
```bash
# Request com Authorization
curl -X GET http://localhost:3001/api/bookings \
  -H "Authorization: Bearer seu-token-jwt" \
  -H "Content-Type: application/json"

# Esperado: Array de bookings ou lista vazia (200 OK)
# Não deve dar CORS error
```

---

## 🔧 Variáveis de Ambiente

### Frontend (.env.local)
```bash
# Automático do envConfig, mas pode sobrescrever:
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (.env)
```bash
# Desenvolvimento
NODE_ENV=development
JWT_SECRET=[REDACTED_TOKEN]
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
DATABASE_PATH=/workspaces/mmmm/backend/backend_data/database.sqlite

# Produção (obrigatório)
NODE_ENV=production
JWT_SECRET=[REDACTED_TOKEN]
DATABASE_URL=postgresql://user:pass@host/db
API_BASE_URL=https://api.leidycleaner.com.br
FRONTEND_URL=https://www.leidycleaner.com.br
```

---

## ✅ Checklist de Lançamento

### Pre-Deploy
- [ ] `npm run build` sem erros
- [ ] `npm test` passando (ou desabilitar rate limit em test)
- [ ] CORS testado (ver seção de teste acima)
- [ ] Variáveis de env configuradas em produção
- [ ] SSL/TLS certificado instalado

### Post-Deploy
- [ ] Hero section visível e verde
- [ ] CTA "Agendar Agora" clicável
- [ ] Features grid aparecendo com animações
- [ ] Mobile responsivo testado
- [ ] Rate limiting funcionando (20 requests rápidos = 429)

---

## 🐛 Troubleshooting

### "Cannot find module designSystem"
```bash
# Solução:
cd frontend
npm install
npm run dev
```

### "CORS error" ao fazer request
```bash
# Verificar:
1. Backend rodando? curl http://localhost:3001/health
2. Frontend em localhost:3000? (não 3001)
3. .env do backend com CORS_ORIGIN correto
4. Header Authorization com "Bearer <token>"
```

### "Rate limit exceeded"
```bash
# Esperado em produção após 50 req/15min
# Em dev, adicionar SKIP_RATE_LIMIT=true ao .env
```

### "JWT Secret not configured in production"
```bash
# OBRIGATÓRIO:
export JWT_SECRET="[REDACTED_TOKEN]"
npm start
```

---

## 📞 Suporte

### Arquivo de Documentação
- `[REDACTED_TOKEN].md` - Documentação completa
- `[REDACTED_TOKEN].md` - O que mudou
- `frontend/src/styles/designSystem.js` - Design tokens
- `backend/src/config/envConfig.js` - Env config

### Artigos de Referência
- [Tailwind Custom Config](https://tailwindcss.com/docs/theme)
- [Express CORS](https://expressjs.com/en/resources/middleware/cors.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## 🎉 Pronto!

Seu site Leidy Cleaner agora tem:
✅ Design verde moderno
✅ CORS seguro por environment
✅ Landing page com impacto
✅ Componentes reutilizáveis
✅ Responsividade garantida
✅ Rate limiting em produção

**Bora crescer! 🚀**

---

*Desenvolvido com ❤️ para fazer à diferença*
*Leidy Cleaner - Make Your Space Shine!*

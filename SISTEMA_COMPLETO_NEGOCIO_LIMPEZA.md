# 🏢 SISTEMA COMPLETO DE NEGÓCIO - LIMPEZA PRO

**Plataforma profissional para gerenciar um serviço de limpeza (faxina) de forma integrada como um negócio real.**

---

## 📊 VISÃO GERAL DO NEGÓCIO

Este é um **sistema ERP (Enterprise Resource Planning) para serviços de limpeza**, similar a uma loja de e-commerce, mas adaptado para:
- ✅ Agendamento de equipes de limpeza
- ✅ Cobrança online (Stripe + PIX)
- ✅ Gestão de clientes e profissionais
- ✅ Análise de faturamento
- ✅ Marketing e retenção

---

## 🎯 MÓDULOS PRINCIPAIS DO NEGÓCIO

### 1️⃣ **MÓDULO DE AGENDAMENTOS** 📅
*(O "carrinho de compras" da limpeza)*

**O que é:** Sistema onde clientes selecionam data/hora e tipo de serviço

**Funcionalidades:**
- ✅ Calendário interativo com horários disponíveis
- ✅ Seleção de tipo de serviço (normal, profunda, pós-obra)
- ✅ Duração configurável (1h, 2h, 4h, full day)
- ✅ Endereço de atendimento
- ✅ Observações especiais do cliente
- ✅ Agendamentos recorrentes (semanal, quinzenal, mensal)

**Rotas API:**
```
POST   /api/bookings               - Criar agendamento
GET    /api/bookings/:id           - Ver detalhes
PUT    /api/bookings/:id           - Editar agendamento
DELETE /api/bookings/:id           - Cancelar agendamento
GET    /api/bookings/user/:userId  - Meus agendamentos
POST   /api/recurring-bookings     - Agendar recorrência
```

**Banco de Dados:**
```sql
bookings (id, user_id, date, time, duration_hours, address, phone, 
          service_id, staff_id, status, price, created_at)
recurring_bookings (id, user_id, frequency, next_date, active)
```

---

### 2️⃣ **MÓDULO DE PAGAMENTOS** 💳
*(O "checkout" do negócio)*

**O que é:** Sistema de cobrança integrado com Stripe + PIX (pagamento direto)

**Funcionalidades:**
- ✅ Pagamento com cartão de crédito (Stripe tokenizado - PCI-DSS)
- ✅ PIX instantâneo (QR code gerado em tempo real)
- ✅ Parcelamento em até 12x (sem juros)
- ✅ Recebimento de webhooks de confirmação
- ✅ Histórico de transações
- ✅ Suporte a reembolsos

**Rotas API:**
```
POST   /api/payments/stripe/create-session    - Iniciar pagamento Stripe
POST   /api/payments/stripe/webhook           - Receber confirmação
POST   /api/payments/pix/create-checkout      - Gerar QR Code PIX
POST   /api/payments/refund                   - Reembolsar cliente
GET    /api/payments/history/:userId          - Ver histórico
```

**Banco de Dados:**
```sql
payments (id, booking_id, user_id, amount, payment_method, 
          stripe_intent_id, pix_qr_code, status, created_at)
```

---

### 3️⃣ **MÓDULO DE CLIENTES** 👥
*(Gerenciar quem paga)*

**O que é:** CRM (Customer Relationship Management) integrado

**Funcionalidades:**
- ✅ Cadastro com email, telefone, CPF
- ✅ Endereços múltiplos (casa, escritório, etc)
- ✅ Histórico de agendamentos
- ✅ Avaliações e feedback
- ✅ Preferências de comunicação (email/ WhatsApp)
- ✅ 2FA (autenticação de dois fatores)
- ✅ Senhas recuperáveis

**Rotas API:**
```
POST   /api/users/register          - Criar conta
POST   /api/users/login             - Login (JWT)
GET    /api/users/profile           - Ver perfil
PUT    /api/users/profile/:id       - Editar perfil
GET    /api/users/:id               - Ver dados cliente (admin)
PUT    /api/users/:id               - Editar dados (admin)
```

**Banco de Dados:**
```sql
users (id, email, phone, cpf, password_hash, name, 
       avatar_url, language, two_factor_enabled)
user_addresses (id, user_id, address, city, zip, primary)
user_preferences (id, user_id, email_opt_in, whatsapp_opt_in)
```

---

### 4️⃣ **MÓDULO DE EQUIPE/PROFISSIONAIS** 👷
*(Quem faz o trabalho)*

**O que é:** Gestão de profissionais/equipes

**Funcionalidades:**
- ✅ Cadastro de profissionais (faxineira, supervisor, etc)
- ✅ Documentos (CNH, cartão vacina, antecedentes)
- ✅ Horários disponíveis por profissional
- ✅ Raio de ação (qual bairro atende)
- ✅ Avaliações de clientes
- ✅ Comissão por tipo de serviço
- ✅ Status de disponibilidade (online/offline/em pausa)

**Rotas API:**
```
POST   /api/staff                   - Adicionar profissional
GET    /api/staff                   - Listar equipe
PUT    /api/staff/:id               - Editar profissional
DELETE /api/staff/:id               - Remover profissional
GET    /api/staff/:id/availability  - Ver disponibilidade
POST   /api/staff/:id/availability  - Definir horário
```

**Banco de Dados:**
```sql
staff (id, name, email, phone, cpf, status, 
       avatar_url, rating, commission_percent)
staff_availability (id, staff_id, day_of_week, start_time, end_time)
staff_documents (id, staff_id, doc_type, file_url, verified)
```

---

### 5️⃣ **MÓDULO DE SERVIÇOS** 🧹
*(O que o cliente compra)*

**O que é:** Catálogo de tipos de serviços

**Funcionalidades:**
- ✅ Limpeza comum (sala, cozinha, banheiro)
- ✅ Limpeza profunda (com produtos especiais)
- ✅ Limpeza pós-obra
- ✅ Organização
- ✅ Cada serviço com preço base e taxa por hora
- ✅ Descrição, imagens, documentação

**Rotas API:**
```
GET    /api/services                - Listar serviços
GET    /api/services/:id            - Detalhes serviço
POST   /api/services                - Criar serviço (admin)
PUT    /api/services/:id            - Editar serviço (admin)
```

**Banco de Dados:**
```sql
services (id, name, description, base_price, 
          price_per_hour, image_url, active)
```

---

### 6️⃣ **MÓDULO DE PREÇOS DINÂMICOS** 💰
*(Cálculo inteligente de valores)*

**O que é:** Engine de cálculo de preços em tempo real

**Funcionalidades:**
- ✅ Preço base + duração
- ✅ Variação por tipo de serviço
- ✅ Ajustes por localização (zona 1, 2, 3)
- ✅ Desconto por agendamento recorrente
- ✅ Taxa de deslocamento (se distância > 5km)
- ✅ Bônus de fidelidade
- ✅ Cupom desconto (código promocional)

**Lógica do Sistema:**
```
PREÇO FINAL = 
  (Preço Base × Duração) 
  + Taxa de Deslocamento 
  - (Desconto Recorrência se houver)
  - (Cupom Desconto se aplicável)
  + (Taxa de Post-Work se necessário)
  = Valor a pagar
```

---

### 7️⃣ **MÓDULO DE NOTIFICAÇÕES** 📬
*(Manter cliente e equipe informados)*

**O que é:** Sistema de comunicação automática

**Funcionalidades:**
- ✅ Email de confirmação de agendamento
- ✅ Email de lembrete (24h antes)
- ✅ WhatsApp com link de localização
- ✅ SMS emergencial
- ✅ Notificação de feedback (após 2h de conclusão)
- ✅ Notificação de reembolso
- ✅ Newsletter com promoções

**Canais:**
```
✓ Nodemailer          - Envio de email
✓ Twilio              - SMS e WhatsApp
✓ WebSocket           - Chat em tempo real
✓ Push Notifications  - App mobile (futura)
```

**Rotas API:**
```
POST   /api/notifications/email           - Enviar email
POST   /api/notifications/whatsapp        - Enviar WhatsApp
POST   /api/notifications/preferences     - Preferências user
GET    /api/notifications/history/:userId - Ver histórico
```

---

### 8️⃣ **MÓDULO DE AVALIAÇÕES & REVIEWS** ⭐
*(Construir reputação)*

**O que é:** Sistema de feedback e ratings

**Funcionalidades:**
- ✅ Avaliações 1-5 estrelas
- ✅ Comentário aberto
- ✅ Fotos antes/depois
- ✅ Avaliação do profissional (equipe)
- ✅ Avaliação do cliente (admin)
- ✅ Reviews públicos no perfil
- ✅ Resposta do proprietário

**Rotas API:**
```
POST   /api/reviews                  - Criar review
GET    /api/reviews/:serviceId       - Ver reviews
PATCH  /api/reviews/:id              - Editar review
POST   /api/reviews/:id/respond      - Responder review (admin)
```

**Banco de Dados:**
```sql
reviews (id, booking_id, user_id, staff_id, 
         rating, comment, photos_urls, created_at)
review_responses (id, review_id, response_text, responded_at)
```

---

### 9️⃣ **MÓDULO ADMIN DASHBOARD** 📊
*(Controlar o negócio)*

**O que é:** Painel de controle para dono/gerente

**Funcionalidades:**
- ✅ Faturamento (dia, semana, mês, ano)
- ✅ Gráficos de receita
- ✅ Número de agendamentos
- ✅ Taxa de cancelamento
- ✅ Clientes ativos/inativos
- ✅ Performance da equipe
- ✅ Agendamentos pendentes
- ✅ Pagamentos pendentes
- ✅ Relatórios exportáveis (PDF/CSV)
- ✅ Gestão de cupons/promoções
- ✅ Configurações do sistema

**Widgets do Dashboard:**
```
📈 Receita Total        → R$ X,XXX (mês)
📅 Agendamentos        → 48 (mês)
👥 Clientes Novos       → 12 (mês)
⭐ Rating Médio         → 4.8/5
⏳ Taxa de Atraso       → 2%
💑 Taxa de Retenção     → 85%
👷 Profissional Top     → João (45 bookings)
🚫 Taxa de Cancelamento → 5%
```

---

### 🔟 **MÓDULO DE FIDELIDADE & REWARDS** 💎
*(Manter clientes voltando)*

**O que é:** Programa de pontos e recompensas

**Funcionalidades:**
- ✅ Ganhar 1 ponto por real gasto
- ✅ Resgate: 100 pontos = R$ 10 desconto
- ✅ Bônus por referência (você indica, ambos ganham)
- ✅ Agendamentos recorrentes ganham 2x pontos
- ✅ Tier VIP (Silver/Gold/Platinum)
- ✅ Resgates de brindes (desconto, serviços grátis)

**Sistema de Tiers:**
```
🥉 BRONZE  (0-499 pts)     → Sem benefício
🥈 SILVER  (500-999 pts)   → 5% desconto extra
🥇 GOLD    (1000-1999 pts) → 10% desconto + suporte prioritário
👑 PLATINUM (2000+ pts)    → 15% desconto + serviço grátis/mês
```

---

### 1️⃣1️⃣ **MÓDULO DE REFERÊNCIA** 🤝
*(Crescimento viral)*

**O que é:** Sistema de "indique e ganhe"

**Funcionalidades:**
- ✅ Código referência único por cliente
- ✅ Link compartilhável
- ✅ Ambas ganham desconto (novo + referenciador)
- ✅ Histórico de referências
- ✅ Ranking de melhores referenciadores
- ✅ Integração com WhatsApp/email

**Fluxo:**
```
1. Cliente A gera link: https://seusite.com/ref/CLIENTE_A_123
2. Cliente A envia para Cliente B
3. Cliente B faz primeiro agendamento: ganha R$50 desconto
4. Cliente A ganha R$50 em crédito também
5. Ambos ficam felizes = mais negócio!
```

---

### 1️⃣2️⃣ **MÓDULO DE CHAT & SUPORTE** 💬
*(Atender cliente em tempo real)*

**O que é:** Chat integrado na plataforma

**Funcionalidades:**
- ✅ Chat cliente ↔ suporte
- ✅ Chat cliente ↔ profissional (localização, atualizações)
- ✅ Histórico de conversa
- ✅ Notificação de mensagem nova
- ✅ Status online/offline
- ✅ Compartilhar fotos/documentos
- ✅ Chatbot automático para FAQ

**Rotas API:**
```
POST   /api/messages              - Enviar mensagem
GET    /api/messages/:conversationId - Ver conversa
GET    /api/conversations         - Listar conversas
POST   /api/messages/:id/mark-read - Marcar como lido
```

---

### 1️⃣3️⃣ **MÓDULO DE CUPONS & PROMOÇÕES** 🎟️
*(Impulsionar vendas)*

**O que é:** Sistema de descontos e promoções

**Funcionalidades:**
- ✅ Criar cupom (código: PRIMEIRACOMPRA20)
- ✅ % desconto ou valor fixo
- ✅ Limite de uso (ex: 100 cupons)
- ✅ Data de expiração
- ✅ Uso mínimo (ex: R$100+)
- ✅ Cupom por categoria de cliente
- ✅ Promoção em data específica (Black Friday)
- ✅ Rastreamento de uso

**Exemplo de Cupom:**
```
Código: PRIMEIRACOMPRA15
Tipo: Porcentagem (15%)
Valor Mínimo: R$80
Limite: 500 usos
Validade: até 31/12/2026
Desconto Máximo: R$50
```

---

### 1️⃣4️⃣ **MÓDULO DE RELATÓRIOS** 📋
*(Dados para tomar decisões)*

**O que é:** Geração de relatórios e análises

**Funcionalidades:**
- ✅ Relatório de faturamento (período custom)
- ✅ Ranking de serviços mais vendidos
- ✅ Análise de clientes (novo, churned, VIP)
- ✅ Desempenho de profissional
- ✅ ROI de campanhas (cupons vs receita)
- ✅ Exportar em PDF/CSV/Excel
- ✅ Agendamento de relatórios automáticos

**Exemplo de Relatório:**
```
📊 RELATÓRIO DE FEVEREIRO/2026

Total Faturado: R$ 45.230,00
Agendamentos: 156 (+12% vs jan)
Ticket Médio: R$ 289,80
Ticket Máximo: R$ 1.200,00 (limpeza profunda)
Taxa Cancelamento: 3.8%
NPS Score: 47/100

TOP 3 SERVIÇOS:
1. Limpeza Comum    - 78 bookings (50%)
2. Limpeza Profunda - 44 bookings (28%)
3. Organização      - 34 bookings (22%)

TOP 3 PROFISSIONAIS:
1. Maria Silva   - 32 bookings (9.2★)
2. João Santos   - 28 bookings (8.7★)
3. Ana Costa     - 24 bookings (8.9★)
```

---

### 1️⃣5️⃣ **MÓDULO MOBILE APP** 📱
*(Acesso em qualquer lugar)*

**O que é:** Aplicativo nativo para iOS/Android (futuro)

**Funcionalidades iniciais:**
- ✅ Download da plataforma web
- ✅ Push notifications
- ✅ Localização GPS para profissional
- ✅ Câmera para vor-antes/depois

---

---

## 🏗️ ARQUITETURA TÉCNICA

### Frontend (Cliente)
```
React 18 + Vite
├── Pages
│   ├── Home.jsx
│   ├── Booking.jsx                 ← Agendamento
│   ├── Payment.jsx                 ← Pagamento
│   ├── Dashboard.jsx               ← Admin
│   ├── Profile.jsx                 ← Perfil
│   ├── Chat.jsx                    ← Suporte
│   └── Reviews.jsx                 ← Avaliações
├── Components
│   ├── Calendar.jsx
│   ├── StripeCheckout.jsx
│   ├── Map.jsx
│   └── ServiceSelector.jsx
└── Services/API.js                 ← Chamadas backend
```

### Backend (Servidor)
```
Node.js + Express
├── Routes
│   ├── bookings.js
│   ├── payments.js
│   ├── users.js
│   ├── staff.js
│   ├── services.js
│   ├── reviews.js
│   ├── chat.js
│   ├── loyalty.js
│   ├── referral.js
│   ├── coupons.js
│   └── reports.js
├── Services
│   ├── BookingService.js           ← Lógica de agendamento
│   ├── PaymentService.js           ← Stripe + PIX
│   ├── NotificationService.js      ← Email + WhatsApp
│   ├── LoyaltyService.js           ← Pontos
│   ├── PriceCalculator.js          ← Cálculo de preço
│   └── ReportService.js            ← Relatórios
├── Models/DB
│   ├── users.js
│   ├── bookings.js
│   ├── payments.js
│   └── ... (10+ tabelas)
└── Middlewares
    ├── auth.js                     ← Validar JWT
    ├── admin.js                    ← Checar permissão admin
    └── rateLimiting.js             ← Proteção DDoS
```

### Banco de Dados
```
SQLite (dev) / PostgreSQL (prod)

Tabelas Principais:
├── users (clientes)
├── bookings (agendamentos)
├── payments (transações)
├── staff (profissionais)
├── services (tipos de serviço)
├── reviews (avaliações)
├── loyalty_points (pontos)
├── referrals (indicações)
├── coupons (cupons)
├── messages (chat)
├── notifications (histórico)
└── ... (mais 10+ tabelas)
```

---

## 💰 FLUXO DE RECEITA

### Como o negócio ganha dinheiro:

```
Cliente faz agendamento
        ↓
Sistema calcula preço (base + variáveis)
        ↓
Cliente paga (Stripe ou PIX)
        ↓
Sistema recebe renda (Stripe tira taxa ~2.9%)
        ↓
Profissional recebe comissão (ex: 70% da receita)
        ↓
Empresa fica com margem (30%)
```

### Exemplo Prático:
```
Agendamento: 3 horas de limpeza comum
Preço base: R$50/hora
Total: R$150

Cliente paga: R$150
Stripe deduz: -R$4,35 (2.9%)
Receita líquida: R$145,65

Profissional ganha: R$101,95 (70%)
Empresa lucra: R$43,70 (30%)
```

---

## 🔒 SEGURANÇA IMPLEMENTADA

✅ **PCI-DSS Compliance:**
- Cartão tokenizado via Stripe (não toca servidor)
- Sem armazenamento de dados sensíveis

✅ **Autenticação:**
- JWT 24h + Refresh Token
- 2FA (autenticação 2 fatores)
- Password reset seguro

✅ **Proteção de Dados:**
- Criptografia SSL/TLS
- Hash de senhas (bcrypt)
- SQL Injection prevention (prepared statements)
- XSS prevention (sanitização)
- CSRF tokens

✅ **Rate Limiting:**
- 100 requisições/15 min por IP
- Proteção contra brute force

---

## 📈 MÉTRICAS DE NEGÓCIO

O sistema rastreia/calcula automaticamente:

```
📊 KPIs Financeiros
├── Receita total/mensal
├── Receita por serviço
├── Ticket médio
├── Receita por cliente
└── Margem de lucro

👥 KPIs de Clientes
├── Total de clientes
├── Clientes ativos
├── Taxa de retenção
├── Churn rate
├── Lifetime value
└── NPS (satisfação)

⭐ KPIs operacionais
├── Taxa de cancelamento
├── Taxa de atraso
├── Rating médio (profissional)
├── Agendamentos pendentes
├── Taxa de conclusão
└── Tempo de resposta chat
```

---

## 🚀 COMO COMEÇAR

### 1. Instalação Local
```bash
git clone <repositório>
cd backend && npm install
cd ../frontend && npm install

# Rodar testes
npm test

# Iniciar em desenvolvimento
cd backend && npm start     # http://localhost:3001
cd ../frontend && npm start # http://localhost:3000
```

### 2. Configurar Integrações
```bash
# Stripe
export STRIPE_PUBLIC_KEY=pk_...
export STRIPE_SECRET_KEY=sk_...

# Twilio (WhatsApp)
export TWILIO_ACCOUNT_SID=AC...
export TWILIO_AUTH_TOKEN=...

# Email
export SMTP_HOST=smtp.gmail.com
export SMTP_USER=seu-email@gmail.com
export SMTP_PASS=sua-senha-app
```

### 3. Deploy em Produção
```bash
# Vercel (Frontend)
vercel deploy

# Railway (Backend)
railway deploy

# Supabase (Database)
# Importar schema via admin
```

---

## 📞 SUPORTE

- **Documentação**: `/docs` (API, workflows, deployment)
- **Testes**: `npm test` (39/39 passando)
- **Chat Admin**: `/admin/support`

---

## 🎯 PRÓXIMOS PASSOS

- [ ] Mobile app (iOS/Android)
- [ ] Integração com Google Calendar
- [ ] Agendamento inteligente por IA
- [ ] Análises preditivas
- [ ] Programa de franquia
- [ ] Marketplace de terceirizados

---

**Versão:** 1.0.0  
**Status:** ✅ Pronto para produção  
**Última atualização:** Fevereiro 2026

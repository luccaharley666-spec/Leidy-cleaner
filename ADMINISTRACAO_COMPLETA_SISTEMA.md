# 🏢 ADMINISTRAÇÃO COMPLETA DO SISTEMA

**Guia detalhado sobre administração, fluxo de pagamentos, validação de profissionais, agendas e cálculos de preços.**

---

## 👤 QUEM ADMINISTRA O SISTEMA?

### 1. **SUPER ADMIN** (Dono/Gerente geral)
```
Funções:
├─ Acesso total ao sistema
├─ Criar/aprovar profissionais
├─ Definir preços e margens
├─ Gerar relatórios financeiros
├─ Gerenciar banco de dados
├─ Configurar integrações
├─ Definir políticas de retenção
└─ Autorizar grandes reembolsos

Acesso Menu Admin:
├─ Dashboard executivo
├─ Gestão financeira
├─ Gestão de usuários
├─ Configurações do sistema
├─ Relatórios e BI
└─ Auditoria/logs
```

### 2. **ADMIN FINANCEIRO** (Controller)
```
Funções:
├─ Ver todos os pagamentos
├─ Autorizar reembolsos
├─ Reconciliação bancária
├─ Relatórios de caixa
├─ Gestão de contas a pagar/receber
├─ Auditoria de transações
└─ Integração contábil (NFe)

Acesso Menu:
├─ Dashboard financeiro
├─ Transações/pagamentos
├─ Relatórios contábeis
├─ Contas bancárias
└─ Análises fiscais
```

### 3. **ADMIN OPERACIONAL** (Gerente)
```
Funções:
├─ Gerenciar agendamentos
├─ Aprovar/reprovar profissionais
├─ Validar documentos
├─ Atender suporte
├─ Resolver conflitos
├─ Gerenciar equipe
└─ Monitorar qualidade (ratings)

Acesso Menu:
├─ Dashboard operacional
├─ Agendamentos
├─ Profissionais (aprovação)
├─ Clientes (verificação)
├─ Suporte/tickets
└─ Relatórios de performance
```

### 4. **ADMIN MARKETING** (Growth)
```
Funções:
├─ Criar cupons/promoções
├─ Campanhas de email
├─ Gestão de referências
├─ Análise de conversão
├─ A/B testing
└─ ROI de campanhas

Acesso Menu:
├─ Cupons e promoções
├─ Campanhas
├─ Referências (ranking)
├─ Analytics/conversão
└─ Relatórios de marketing
```

---

## 💳 FLUXO DE CONTAS BANCÁRIAS

### ESTRUTURA DE CONTAS

```
┌─────────────────────────────────────────────────────────┐
│                  FLUXO DE DINHEIRO                      │
└─────────────────────────────────────────────────────────┘

CLIENTE
  │
  ├─ Cartão de crédito (Stripe)
  │  └─ Transação criptografada
  │     └─ PCI-DSS compliant
  │
  └─ PIX (instantâneo)
     └─ Recebimento em < 30s
        │
        ↓
    CONTA STRIPE/PIX DA EMPRESA
    ├─ Saldo pendente
    ├─ Saldo disponível (2-3 dias)
    └─ Extrato histórico
        │
        ├─ TAXA STRIPE: -2.9% (debitado)
        │
        ├─ PROFISSIONAL: 70% (transferência)
        │  └─ Enviado para conta profissional
        │     via PIX/TED semanalmente
        │
        └─ EMPRESA: 30% (fica com você)
           └─ Para conta bancária da empresa
              ou reinvestimento
```

---

## 💰 CONTAS DE CADA ATOR

### 1. **CLIENTE** 
```
Não faz transações financeiras diretas(exceto pagamento inicial)

Saldo virtual (créditos):
├─ Pontos de fidelidade (1 ponto = R$0,10)
├─ Cupom desconto (código: PRIMEIRACOMPRA20)
├─ Crédito por referência (amigo novo = ambos ganham)
├─ Crédito por reembolso (se cancelar)
└─ Crédito por promoção sazonal

Exemplo:
│ Saldo de pontos: 250 pontos = R$ 25
│ Cupom ativo: PRIMEIRA COMPRA (-20%)
│ Crédito referência: R$ 50 (convidou João)
│ Desconto próx compra: R$ 25 + 20% + R$5 resgate
└─ Total possível desconto: R$ 50
```

### 2. **PROFISSIONAL** (Faxineira/Equipe)
```
Conta bancária vinculada:
├─ Banco: Qualquer um (BB, Caixa, Itaú, etc)
├─ Tipo: Corrente ou poupança
├─ Titularidade: CPF da pessoa
└─ Status: Validada e certificada

Recebimentos:
├─ Cronograma: Toda segunda-feira
├─ Método: PIX/TED
├─ Valor: 70% de cada agendamento
├─ Desconto: Apenas impostos (se autônomo)
└─ Extrato: Visualiza no app

Exemplo de semana:
│ Seg 10/fev - Agend 1: R$100 → R$70 nesta semana
│ Ter 11/fev - Agend 2: R$150 → +R$105
│ Qua 12/fev - Agend 3: R$80  → +R$56
│ Total para transferência: R$231
│ Transferência PIX → Conta profissional
└─ Status: ✓ Recebido segunda-feira

Dados de conta:
├─ Nome completo
├─ CPF
├─ Banco
├─ Agência
├─ Conta
├─ Tipo (corrente/poupança)
└─ Validação: Prova de propriedade
```

### 3. **EMPRESA** (Você/Dono)
```
Conta bancária principal:
├─ Banco: Seu banco preferido
├─ Tipo: Corrente comercial (recomendado)
├─ Titularidade: Empresa (CNPJ)
├─ Status: Integrada com sistema

Recebimentos:
├─ Origem: Stripe (cartão cliente)
├─ Origem: PIX (cliente)
├─ Cronograma: D+2 para D+3
├─ Método: Transferência automática
├─ Líquido: Total - taxa Stripe (2.9%)
└─ Extrato: Dashboard sistema

Exemplo mensal:
│ Total faturado: R$ 10.000
│ Taxa Stripe: -R$ 290 (2.9%)
│ Profissionais pagos: -R$ 6.825 (70% de 9.750)
│ Receita empresa: R$ 2.885 (30%)
│
│ Relatório de caixa:
│ ├─ Cartão (Stripe): R$ 6.000 → Conta em 3 dias
│ ├─ PIX: R$ 4.000 → Conta em 30 segundos
│ ├─ Pagto profissionais: -R$ 6.825 (segunda-feira)
│ └─ Saldo final: R$ 2.885 + taxas bancárias
```

---

## 📋 VALIDAÇÃO & LIBERAÇÃO DE PROFISSIONAIS

### PROCESSO COMPLETO

```
ETAPA 1: CADASTRO INICIAL
┌─────────────────────────────────────┐
│ Profissional acessa app/site        │
│ Clica: "Quero ganhar com limpeza"   │
│                                     │
│ Preenche:                           │
│ ├─ Nome completo                    │
│ ├─ CPF                              │
│ ├─ Email                            │
│ ├─ Telefone                         │
│ ├─ Data nascimento                  │
│ ├─ Gênero                           │
│ ├─ Foto perfil                      │
│ ├─ Banco/agência/conta              │
│ └─ Aceita termos                    │
│                                     │
│ Status: "Pendente Documentos"       │
└─────────────────────────────────────┘
           ↓
ETAPA 2: UPLOAD DE DOCUMENTOS
┌─────────────────────────────────────┐
│ Sistema pede:                       │
│                                     │
│ 📷 DOCUMENTOS DE IDENTIDADE:        │
│ ├─ RG (frente + verso)              │
│ ├─ CPF (frente + verso)             │
│ └─ OPCIONAL: CNH                    │
│                                     │
│ 🏦 DOCUMENTOS BANCÁRIOS:            │
│ ├─ Comprovante de conta             │
│ │  (extrato com IBAN/chave PIX)     │
│ └─ Validação PIX                    │
│    (sistema envia R$0,01 de teste)  │
│                                     │
│ 🏥 DOCUMENTOS DE SAÚDE:             │
│ ├─ Cartão vacina (COVID-19 + gripe)│
│ ├─ Atestado saúde (recente)         │
│ └─ OPCIONAL: Teste COVID            │
│                                     │
│ 📋 DOCUMENTOS DE BACKGROUND:        │
│ ├─ Certificado antecedentes         │
│ │  (sem registro criminal)          │
│ └─ Referências (2-3 clientes ant.)  │
│                                     │
│ Status: "Em análise"                │
└─────────────────────────────────────┘
           ↓
ETAPA 3: VERIFICAÇÃO AUTOMÁTICA
┌─────────────────────────────────────┐
│ Sistema valida:                     │
│                                     │
│ ✓ CPF válido (verifica RFC)         │
│ ✓ RG legível (OCR)                  │
│ ✓ Conta bancária ativa              │
│ ✓ Prova PIX funciona                │
│ ✓ Idade mínima (18+ anos)           │
│ ✓ Email/telefone verificado         │
│ ✓ Sem duplicidade (mesmo CPF)       │
│                                     │
│ Se OK : continua próxima etapa      │
│ Se falha: notifica profissional     │
│ (Rescarregar docu/corrigir dados)   │
│                                     │
│ Status: "Aguardando análise admin"  │
└─────────────────────────────────────┘
           ↓
ETAPA 4: ANÁLISE MANUAL (Admin Ops)
┌─────────────────────────────────────┐
│ Admin operacional revisa:           │
│                                     │
│ 👁️ Documentos:                      │
│ ├─ Foto legível e recente           │
│ ├─ RG/CPF sem danificações          │
│ ├─ Extrato bancário recente (<90d)  │
│ ├─ Vacina em dia                    │
│ └─ Sem registro criminal            │
│                                     │
│ 📞 Verificação por telefone:        │
│ ├─ Confirma telefone                │
│ ├─ Valida referências               │
│ ├─ Pergunta experiência prévias     │
│ ├─ Comunica termos de serviço       │
│ └─ Colhe assinatura digital         │
│                                     │
│ ✓ Aprova → próxima etapa            │
│ ✗ Rejeita → notifica com motivo     │
│                                     │
│ Status: "Análise OK" / "Rejeitado"  │
└─────────────────────────────────────┘
           ↓
ETAPA 5: VERIFICAÇÃO CRIMINAL
┌─────────────────────────────────────┐
│ Sistema faz consulta:               │
│                                     │
│ ⚖️ VERIFICAÇÕES:                    │
│ ├─ Consulta GCPP (coligado PJ)      │
│ ├─ Verifica antecedentes públicos   │
│ ├─ Consulta registros PF/policiais  │
│ └─ Se houver registro: rejeita auto │
│                                     │
│ Tempo: 1-2 dias                     │
│ Status: "Liberada para ativar"      │
└─────────────────────────────────────┘
           ↓
ETAPA 6: ACEITA TERMO DIGITAL
┌─────────────────────────────────────┐
│ Profissional recebe email:          │
│                                     │
│ "Parabéns! Você foi aprovado!       │
│                                     │
│ Antes de começar, aceite:           │
│ ✓ Termos de serviço                 │
│ ✓ Políticas de privacidade          │
│ ✓ Código de conduta                 │
│ ✓ Tabela de comissão (70%)          │
│ ✓ Política de cancelamento          │
│                                     │
│ Ao clicar 'Aceitar', ativa conta"   │
│                                     │
│ Status: "Conta Ativa!"              │
└─────────────────────────────────────┘
           ↓
ETAPA 7: CONFIGURAÇÃO FINAL
┌─────────────────────────────────────┐
│ Profissional completa:              │
│                                     │
│ 🗓️ DISPONIBILIDADE:                 │
│ ├─ Dias da semana (seg-dom)         │
│ ├─ Horários (ex: 06:00-18:00)       │
│ ├─ Pausas/intervalos                │
│ └─ Férias/bloqueios                 │
│                                     │
│ 📍 LOCALIZAÇÃO:                     │
│ ├─ Bairros que atende              │
│ ├─ Raio máximo de ação             │
│ ├─ Especialidades (comum/profunda)  │
│ └─ Agendamentos simultâneos (max 1) │
│                                     │
│ 💰 DADOS FINANCEIROS:               │
│ ├─ Taxa comissão: 70%               │
│ ├─ Limite agendamento: Ilimitado    │
│ └─ Forma pagamento: PIX/TED         │
│                                     │
│ ✓ Sistema notifica: "Pronto!"       │
│ Status: "Operacional"               │
└─────────────────────────────────────┘
```

### VALIDAÇÃO CONTÍNUA

```
Após liberação, sistema monitora:

📊 MÉTRICAS AUTOMÁTICAS:
├─ Rating (se cair < 3.5★ → revisar)
├─ Cancelamentos (se > 20% → avisar)
├─ Reviews negativos (analisar)
├─ Tempo resposta (se > 2h → notificar)
└─ Documentos vencendo (vacina, CNH)

🚨 BLOQUEIO AUTOMÁTICO:
├─ Rating < 2.0★ → Desativar
├─ Múltiplos cancelamentos → Investigar
├─ Documentos vencidos → Suspender
├─ Falta de pagamento/débito > R$500 → Bloquear
└─ Reclamação de cliente → Análise

📜 REVALIDAÇÃO ANUAL:
├─ Profissional refaz todos documentos
├─ Verifica antecedentes novamente
├─ Confirma dados bancários (se mudou)
└─ Aceita termos atualizados
```

---

## 🗓️ SISTEMA DE AGENDAS

### AGENDA DO CLIENTE

```
┌──────────────────────────────────────────────┐
│ VER SERVIÇOS DISPONÍVEIS                     │
│ Data: 15 de fevereiro                        │
│ Tipo: Limpeza Comum                          │
│ Duração: 2 horas                             │
│                                              │
│ ✓ Horários disponíveis (verde):              │
│ ├─ 08:00                                     │
│ ├─ 09:00                                     │
│ ├─ 10:00                                     │
│ ├─ 11:00                                     │
│ ├─ 13:00 ← Cliente clica aqui                │
│ ├─ 14:00                                     │
│ └─ ...                                       │
│                                              │
│ ✗ Horários indisponíveis (cinza):            │
│ ├─ 12:00 (profissional em almoço)            │
│ ├─ 16:00 (falta profissional)                │
│ └─ 17:30 (após horário)                      │
│                                              │
│ → Sistema calcula:                           │
│    Horário: 13:00-15:00                      │
│    Profissional: Maria Silva (4.8★)          │
│    Preço: R$100 (2h × R$50/h)                │
│                                              │
│ ✓ CONFIRMA AGENDAMENTO                       │
└──────────────────────────────────────────────┘
```

### AGENDA DO PROFISSIONAL

```
╔══════════════════════════════════════════════╗
║ MINHA AGENDA - Fevereiro 2026                ║
╚══════════════════════════════════════════════╝

Seg 10/fev | Ter 11/fev | Qua 12/fev | Qui 13/fev
──────────┼───────────┼───────────┼───────────
 08:00    │  08:00    │  08:00    │  FOLGA
 LIVRE    │  AGEND#1  │  LIVRE    │  (repouso)
          │  João     │           │
          │  Apt 101  │           │
          │ 2 horas   │           │
          │           │           │
 10:00    │  10:30    │  10:00    │
 ALMOÇO   │  LIVRE    │  AGEND#2  │  14:00
 12:00    │           │  Maria    │  AGEND#3
          │  13:00    │  Casa 22  │  Carlos
          │  AGEND#2  │  3 horas  │  Galpão
          │  Pedro    │           │  1 hora
          │  Condomínio           │
          │ 2.5 horas            │

RESUMO SEMANA:
Total agendamentos: 4 (João, Pedro, Maria, Carlos)
Horas trabalhadas: 8.5h
Faturamento bruto: 8.5h × R$50 = R$425
Comissão (70%): R$297,50

☞ PRÓXIMA TRANSFERÊNCIA: SEGUNDA-FEIRA 10:00
```

### AGENDA DO ADMIN (Gerente)

```
╔══════════════════════════════════════════════╗
║ AGENDA OPERACIONAL - 15 fevereiro            ║
╚══════════════════════════════════════════════╝

AGENDAMENTOS HOJE (15 agendados):

✓ CONFIRMADOS (14):
├─ 08:00 | Maria Silva → João Santos
├─ 09:00 | João Pedro → Casa de Maria
├─ 10:00 | Ana Costa → Condomínio X
├─ 11:00 | Carlos M. → Escritório Saúde
├─ 13:00 | Maria Silva → Apto 302
├─ ... (mais 9)
└─ 17:00 | João Pedro → Casa Pedro

⚠️  PENDENTE (1):
├─ 14:00 | Paulo Silva (cancelou 1h atrás)
│   Motivo: Imprevisto particular
│   Reembolso: R$50 → Crédito cliente
│   Próf. afetado: Avisado
│   Status: Remoçado de agenda

❌ ATRASOS/PROBLEMAS (0):
└─ Nenhum hoje

📊 KPIs AGORA:
├─ Taxa ocupação: 93% (14/15)
├─ Taxa clientes novos: 2 (14%)
├─ Ticket médio hoje: R$125
├─ Faturamento até agora: R$1.750
└─ Profissionais ativos: 5/6
```

---

## 💵 TABELA DE PREÇOS E CÁLCULOS

### ESTRUCTURA DE PREÇO BASE

```
TABELA PADRÃO (por tipo de serviço):

1. LIMPEZA COMUM
   ├─ Preço base: R$50/hora
   ├─ Mínimo: 1 hora
   ├─ Inclui: Varrer, passar, limpar banheiro, cozinha
   ├─ Equipe: 1 profissional
   └─ Exemplo: 2h = R$100

2. LIMPEZA PROFUNDA
   ├─ Preço base: R$70/hora
   ├─ Mínimo: 2 horas
   ├─ Inclui: Tudo acima + encerar, higienizar profundo
   ├─ Equipe: 1-2 profissionais
   └─ Exemplo: 4h = R$280

3. LIMPEZA PÓS-OBRA
   ├─ Preço base: R$80/hora
   ├─ Mínimo: 3 horas
   ├─ Inclui: Remoção pó, limpeza profunda, detritos
   ├─ Equipe: 2-3 profissionais
   └─ Exemplo: 6h = R$480

4. ORGANIZAÇÃO
   ├─ Preço base: R$60/hora
   ├─ Mínimo: 2 horas
   ├─ Inclui: Arranjar, organizar, descartar lixo
   ├─ Equipe: 1 profissional
   └─ Exemplo: 3h = R$180
```

### CÁLCULO DE PREÇO FINAL

```
FÓRMULA COMPLETA:

┌─────────────────────────────────────────────────┐
│  PREÇO FINAL = (PREÇO BASE + AJUSTES)          │
│               - DESCONTOS                       │
│               + TAXAS                           │
│                                                 │
│  = [(Base × Duração) + Extras]                 │
│    - (Desconto Recorrência)                    │
│    - (Desconto Fidelidade/Pontos)              │
│    - (Cupom/Promoção)                          │
│    + (Taxa Deslocamento se > 5km)              │
│    + (Taxa Urgência se < 24h)                  │
│    = VALOR FINAL A PAGAR                       │
└─────────────────────────────────────────────────┘

EXEMPLO PRÁTICO 1: Cliente novo, limpeza comum

Dados:
├─ Tipo: Limpeza Comum
├─ Duração: 2 horas
├─ Distância: 3 km (dentro raio grátis)
├─ Agendado: 7 dias antes
├─ Cliente: Novo (sem pontos)
└─ Cupom: Nenhum

Cálculo:
├─ Preço base: R$50 × 2h = R$100
├─ Taxa deslocamento: R$0 (< 5km)
├─ Desconto novo cliente: -R$10 (10% promo)
├─ Desconto recorrência: R$0 (primeira compra)
├─ Cupom: R$0
└─ TOTAL = R$100 - R$10 = R$90 ✓

EXEMPLO PRÁTICO 2: Cliente recorrente, limpeza profunda

Dados:
├─ Tipo: Limpeza Profunda
├─ Duração: 4 horas
├─ Distância: 8 km (3 km além do raio)
├─ Agendado: hoje mesmo (urgente)
├─ Cliente: Ouro (Gold tier)
├─ Pontos: 200 pontos (= R$20)
└─ Cupom: Nenhum (já usou este mês)

Cálculo:
├─ Preço base: R$70 × 4h = R$280
├─ Taxa deslocamento: R$15 × (3 km) = R$45
│  (Fórmula: R$15 base + R$5 por km adicional)
├─ Desconto recorrência: -R$28 (10% de 280)
├─ Desconto Gold tier: -R$10 (5% extra cliente retido)
├─ Resgate pontos: -R$20 (200 pontos)
├─ Taxa urgência: +R$30 (agendado < 24h)
└─ TOTAL = 280+45-28-10-20+30 = R$297 ✓

EXEMPLO PRÁTICO 3: Com cupom + profunda + referência

Dados:
├─ Tipo: Limpeza Profunda
├─ Duração: 3 horas
├─ Distância: 2 km (grátis)
├─ Cliente: Bronze (novo)
├─ Cupom: PRIMEIRACOMPRA20 (20% desconto)
├─ Referência: João indicou (ambos ganham R$50)
└─ Pontos: 0 (nova)

Cálculo:
├─ Preço base: R$70 × 3h = R$210
├─ Taxa deslocamento: R$0 (< 5km)
├─ Desconto cupom: -R$42 (20% de 210)
├─ Crédito referência: -R$50 (ambos ganham)
│  (João e novo cliente cada um recebem R$50)
├─ Desconto novo cliente: -R$10 (5% base)
└─ TOTAL = 210-42-50-10 = R$108 ✓

APÓS PAGAMENTO:
├─ Cliente paga: R$108
├─ Profissional recebe: R$75,60 (70% de 108)
├─ Empresa lucra: R$32,40 (30%)
├─ Bônus referência: Ambos ganham R$50 de crédito
└─ Pontos cliente: +108 pontos (1 por real)
```

### REGRAS DE CÁLCULO

```
DESCONTOS (Aplicados em ordem):

1. CUPOM DESCONTO
   └─ Máximo: R$50 OU % máximo conforme cupom
      Exemplo: PRIMEIRACOMPRA20 = 20% até R$50

2. DESCONTO RECORRÊNCIA
   ├─ Se agendamento recorrente (2+ vezes/mês)
   ├─ Desconto: 10% do valor final
   └─ Máximo: R$30 por agendamento

3. DESCONTO FIDELIDADE (OURO/PLATINA)
   ├─ Ouro: 5% extra desconto
   ├─ Platina: 10% extra desconto
   └─ Não cumulativo

4. RESGATE DE PONTOS
   ├─ 100 pontos = R$10 desc
   ├─ Cliente escolhe quantos resgatar
   └─ Máximo: 50% do valor final

TAXAS ADICIONADAS:

1. TAXA DESLOCAMENTO
   ├─ Se distância > 5 km
   ├─ R$15 (taxa base) + R$5 por km adicional
   └─ Máximo: R$50
      Exemplo: 12 km = R$15 + R$35 = R$50

2. TAXA URGÊNCIA
   ├─ Se agendado < 24 horas
   ├─ +R$30 (15% do min ticket)
   └─ Máximo: 1 agendamento urgente/dia

3. TAXA DE EQUIPE (múltiplos profissionais)
   ├─ Se 2+ profissionais necessários
   ├─ +50% do preço total
   └─ Para pós-obra/grande volume

MÚLTIPLAS APLICAÇÕES:

⚠️ Desconto NÃO é cumulativo, máximo:
├─ Cupom: -20%
├─ + Recorrência: -10%
├─ + Fidelidade: -5%
└─ = Máximo desconto: -35%

✓ Mas CAN acumular:
├─ Cupom: -20%
├─ + Pontos fidelidade: -R$20
├─ + Taxa deslocamento: +R$15
└─ = Valor final com todos
```

---

## 🧮 MOTOR DE CÁLCULOS (BACKEND)

### CÓDIGO DE CÁLCULO

```javascript
// Este é o coração do sistema
// Arquivo: backend/src/utils/priceCalculator.js

function calculatePrice(booking, service) {
  // 1. PREÇO BASE
  const basePrice = service.base_price * booking.duration_hours;
  
  // 2. AJUSTES
  let priceAdjustment = 0;
  
  // Taxa de deslocamento
  if (booking.distance > 5) {
    priceAdjustment += 15 + (booking.distance - 5) * 5;
  }
  
  // Taxa urgência (< 24h)
  if (booking.hoursUntilScheduled < 24) {
    priceAdjustment += 30;
  }
  
  // Taxa múltiplos profissionais
  if (booking.staff_count > 1) {
    priceAdjustment += basePrice * 0.5;
  }
  
  // 3. DESCONTOS
  let discount = 0;
  
  // Cupom
  if (booking.coupon) {
    discount += basePrice * (booking.coupon.percent / 100);
  }
  
  // Recorrência
  if (booking.isRecurring) {
    discount += basePrice * 0.10;
  }
  
  // Fidelidade (Gold/Platina excepto)
  if (client.tier === 'GOLD') {
    discount += basePrice * 0.05;
  } else if (client.tier === 'PLATINUM') {
    discount += basePrice * 0.10;
  }
  
  // Resgate pontos
  discount += booking.pointsRedeemed * 0.10;
  
  // 4. CÁLCULO FINAL
  const subtotal = basePrice + priceAdjustment - discount;
  const tax = subtotal * ISS_TAX; // 5% ISS em SP
  const finalPrice = Math.max(subtotal + tax, service.min_price);
  
  return {
    basePrice,
    adjustment: priceAdjustment,
    discount,
    subtotal,
    tax,
    finalPrice: Math.round(finalPrice * 100) / 100 // 2 casas decimais
  };
}
```

---

## 📊 EXEMPLO COMPLETO DE AGENDAMENTO

```
╔═══════════════════════════════════════════════╗
║ AGENDAMENTO COMPLETO COM TODOS OS DADOS       ║
╚═══════════════════════════════════════════════╝

CLIENTE:
├─ Nome: Maria Silva
├─ CPF: 123.456.789-00
├─ Email: maria@email.com
├─ Telefone: (11) 98765-4321
├─ Tier: GOLD (1.200 pontos)
└─ Banco: Conta xxxxx-1 validada

AGENDAMENTO:
├─ ID: BOOKING_20260215_001
├─ Data: 15 de fevereiro de 2026
├─ Horário: 14:00-16:00
├─ Duração: 2 horas
├─ Tipo serviço: Limpeza Profunda
│  └─ Base: R$70/hora
├─ Local: Rua das Flores, 123, Apt 402
└─ Distância: 8 km (3 km além raio)

PROFISSIONAL SELECIONADO:
├─ Nome: João Santos
├─ CPF: 987.654.321-00
├─ Rating: 4.9★ (98 reviews)
├─ Comissão: 70%
├─ Banco: PIX xxxxx (validado)
└─ Horário disponível: Confirmado

CUPOM APLICADO:
├─ Código: PRIMEIRACOMPRA20
├─ Tipo: 20% desconto
├─ Válido até: 01/03/2026
├─ Usos deixados: 85/100
└─ Valor máximo: R$50

CÁLCULO FINAL (CONFORME ACIMA):
├─ Preço base: R$70 × 2h = R$140
├─ Taxa deslocamento: R$15 + R$15 (3km extra) = R$30
├─ Desconto cupom: -R$28 (20% de 140)
├─ Desconto recorrência: R$0 (primeira compra tipo pofunda)
├─ Desconto Gold: -R$7 (5% de 140)
├─ Resgate pontos: -R$0 (não quis usar)
├─ Subtotal: 140+30-28-7 = R$135
├─ ISS (5%): +R$6,75
└─ TOTAL A PAGAR: R$141,75 ✓

PAGAMENTO:
├─ Método: Cartão de crédito (Stripe)
├─ Status: Processando...
├─ Confirmação: ✓ Autorizado
├─ TID: STRIPE_TX_20260215_ABC123
└─ Timestamp: 15/02/2026 13:47:23

CONFIRMAÇÃO ENVIADA:

📧 EMAIL CLIENTE:
"Seu agendamento foi confirmado!
Serviço: Limpeza Profunda
Data/Hora: 15/02 às 14:00
Profissional: João Santos (4.9★)
Local: Rua das Flores, 123, Apt 402
Preço: R$ 141,75
Pontos ganhos: +141 (próxima compra)
Cancelar até: 14/02 às 14:00 (grátis)"

📱 WHATSAPP PROFISSIONAL:
"Novo agendamento!
Cliente: Maria Silva
Data: 15/02 às 14:00 (2h)
Local: Rua das Flores, 123, Apt 402
Fone: (11) 98765-4321
Ganho: R$ 99,25 (70% de 141,75)"

📊 DASHBOARD ADMIN:
"Agendamento #001 criado
Receita: +R$141,75
Comissão profissional: -R$99,25
Margin: +R$42,50
Taxa Stripe: -R$4,11
Lucro real: +R$38,39"

FLUXO DE DINHEIRO (PASSO A PASSO):

15/02 13:47:
├─ Cliente paga: R$141,75 (Stripe cartão)
└─ Status: Pendente autorização banco

15/02 14:30:
├─ Stripe confirma: ✓ Autorizado
├─ Entra na conta Stripe: R$141,75
├─ Taxa Stripe cobra: -R$4,11 (2.9%)
└─ Saldo Stripe: +R$137,64

15/02 15:00:
├─ Serviço iniciado
├─ João marca: "Em andamento"
└─ Fotos before geradas

15/02 17:00:
├─ Serviço concluído
├─ João marca: "Finalizado"
├─ Fotos after anexadas
└─ Tempo real: 2h 05min (cobrado 2h)

15/02 20:00:
├─ Maria avalia: ⭐⭐⭐⭐⭐
├─ Comentário: "Excelente! Recomendo"
├─ Pontos ganhos: + 141 pontos no saldo
└─ Próximo cupom oferecido

17/02 (segunda-feira):
├─ Stripe transfere para banco empresa:
│  ├─ Taxa processamento: -R$2,07
│  └─ Saldo (empresa): +R$135,57
│
├─ Sistema calcula comissão João:
│  └─ Valor: R$99,25 (70%)
│
└─ PIX para conta João:
   └─ Hora: 10:00 ✓ Recebido

RESUMO EVENTO:
├─ Cliente: Maria Silva
├─ Gasto: R$141,75
├─ Ganho pontos: 141
├─ Profissional: João Santos
├─ Earned: R$99,25
├─ Empresa lucra: R$38,39
├─ Rating: 5 estrelas
└─ Status: ✅ COMPLETO
```

---

## 🎯 CONCLUSÃO

Este é um **sistema completo de negócio** com:

✅ **Administração** - Super admin, financeiro, operacional, marketing  
✅ **Fluxo financeiro** - Cliente → Stripe/PIX → Empresa → Profissional  
✅ **Validação rigorosa** - 7 etapas de verificação profissional  
✅ **Agendas inteligentes** - Cliente, profissional e admin  
✅ **Cálculo transparente** - Todos descontos/ajustes documentados  
✅ **Rastreamento total** - Cada transação registrada e auditável  

**Uma plataforma pronta para negócio real de limpeza.**


# 🧾 MÓDULO 12: INTEGRAÇÃO CONTÁBIL AUTOMÁTICA (NFe/DPS)

> **Substitui o Chat & Suporte**  
> Emisão automática de Notas Fiscais Eletrônicas (NFe) e Documentos de Prestação de Serviço (DPS)

---

## 📑 VISÃO GERAL

```
ANTES (Módulo 12 - Chat & Suporte):
├─ Chat com profissionais
├─ Histórico de mensagens
├─ Compartilhamento arquivos
└─ Notificações em tempo real

DEPOIS (Novo Módulo 12 - Contabilidade Automática):
├─ Emissão automática de NFe para cada serviço
├─ Geração de DPS para profissionais autônomos
├─ Integração com software contábil (ERP)
├─ Relatórios fiscais mensais/anuais
├─ Compliance com SPED Fiscal
├─ Recibos digitais para clientes
├─ Controle de impostos (ISS, INSS, IRretido)
└─ Auditoria fiscal completa
```

---

## 🎯 FUNCIONALIDADES

### 1. **EMISSÃO AUTOMÁTICA NFe**

```
FLUXO AUTOMÁTICO:

┌─────────────────────────────────────┐
│ Cliente agendou serviço              │
│ Data: 15/02/2026                    │
│ Status: CONFIRMADO E PAGO            │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ SISTEMA AUTO-GERA NFe:              │
│                                     │
│ Número NFe: 000000000000001         │
│ Série: 1                            │
│ Modelo: 55 (NF-e de serviço)        │
│ Emissor: Sua empresa CNPJ           │
│ Tomador: CPF do cliente             │
│ Descrição: Limpeza Profunda - 2h    │
│ Valor: R$ 141,75                    │
│ ISS retido: R$ 7,08 (5% em SP)      │
│ Data emissão: 15/02/2026 14:00      │
│ Data saída: 15/02/2026 14:00        │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ SISTEMA ENVIA PARA SEFAZ:           │
│                                     │
│ ✓ Assinatura digital (certificado) │
│ ✓ Validação schema XML              │
│ ✓ Autenticação N-Serie              │
│ ✓ Envio SOAP/HTTPS                  │
│ ✓ Recebe protocolo de autorização   │
│                                     │
│ Status: AUTORIZADA                  │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ CLIENTE RECEBE:                     │
│                                     │
│ 📧 Email com:                       │
│ ├─ NFe em PDF imprimível            │
│ ├─ XML assinado                     │
│ ├─ DANFE (Documento auxiliar)       │
│ ├─ Chave acesso (44 dígitos)        │
│ └─ QR code para consulta SEFAZ      │
│                                     │
│ 📱 App:                             │
│ └─ "Nota fiscal gerada"             │
│    Clique para baixar PDF           │
│                                     │
│ Status: ✓ DISPONÍVEL                │
└─────────────────────────────────────┘

EXEMPLO DANFE (Documento Auxiliar da NFe):

═══════════════════════════════════════════════
               NOTA FISCAL ELETRÔNICA
═══════════════════════════════════════════════
Série: 1             Nº: 000000000000001
Emissão: 15/02/2026  Chave: 3626021300012345612345678901234567891234

DADOS DO EMITENTE:
Razão Social: Minha Empresa Limpeza Ltda
CNPJ: 26.120.123/0001-45
Inscrição Estadual: 123.456.789.012
Endereço: Rua das Flores, 1000 - São Paulo/SP

DADOS DO CLIENTE (TOMADOR):
Nome: Maria Silva
CPF: 123.456.789-00
Endereço: Rua das Flores, 123 - São Paulo/SP

DESCRIÇÃO DO SERVIÇO:
Limpeza profunda residencial - 2 horas

VALORES:
Valor total: R$ 141,75
ISS retido (5%): R$ 7,08
Valor líquido: R$ 134,67

QR CODE [████████████████████]
      consultar.sefaz.sp.gov.br

═══════════════════════════════════════════════
```

### 2. **GERAÇÃO DE DPS (RECIBO DO PROFISSIONAL)**

```
DADOS DO PROFISSIONAL (Autônomo):

┌─────────────────────────────────────┐
│ João Santos (CPF: 987.654.321-00)   │
│ Profissional autônomo               │
│ Não tem CNPJ                        │
│ Não emite NFe                       │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ POR CADA SERVIÇO CONCLUÍDO:         │
│                                     │
│ Sistema gera automaticamente:       │
│ ├─ Recibo Digital (DPS)            │
│ ├─ Informação de renda              │
│ └─ Prova de trabalho                │
│                                     │
│ Status: ✓ REGISTRADO                │
└─────────────────────────────────────┘

EXEMPLO RECIBO (DPS):

═══════════════════════════════════════════════
         RECIBO DE PRESTAÇÃO DE SERVIÇO
                    (DPS)
═══════════════════════════════════════════════

PRESTADOR DE SERVIÇO (AUTÔNOMO):
Nome: João Santos
CPF: 987.654.321-00
Profissão: Técnico em Limpeza
Data nasc: 15/08/1990

TOMADOR DO SERVIÇO (CLIENTE):
Nome: Maria Silva
CPF: 123.456.789-00
Endereço: Rua das Flores, 123

DESCRIÇÃO DO SERVIÇO:
Limpeza profunda residencial
Data: 15 de fevereiro de 2026
Duração: 2 horas
Horário: 14:00 - 16:00

VALOR:
Valor bruto: R$ 141,75
Comissão plataforma: -R$ 42,50 (30%)
   ├─ Operação: -R$ 30
│  └─ ISS retido plataforma: -R$ 12,50
Valor líquido para João: R$ 99,25

OBSERVAÇÕES:
Serviço realizado conforme especificado
Profissional: Certificado ✓
Cliente:  Código BOOKING_20260215_001

Código Recibo: RC_20260215_001
Data emissão: 15/02/2026 17:00
Assinado digitalmente

═══════════════════════════════════════════════

✓ Enviado para João via WhatsApp
✓ Disponível no app do profissional
✓ Pode usar para declaração IR
```

---

## 💼 INTEGRAÇÃO COM CONTADORA/ERP

### **RELATÓRIOS AUTOMÁTICOS PARA CONTABILIDADE**

```
┌──────────────────────────────────────────────┐
│ A CADA MÊS, SISTEMA GERA AUTOMATICAMENTE:   │
└──────────────────────────────────────────────┘

1. RELATÓRIO DE RECEITA (R$ 10.000 exemplo)

   Fevereiro 2026
   ─────────────────────────
   Total faturado: R$ 10.000,00
   
   Composição:
   ├─ Limpeza comum: R$ 4.000
   ├─ Limpeza profunda: R$ 4.500
   ├─ Limpeza pós-obra: R$ 1.200
   ├─ Organização: R$ 300
   └─ Serviços extras: R$ 0
   
   ✓ XML para contabilidade
   ✓ PDF para auditoria
   ✓ CSV para ERP

2. RELATÓRIO FISCAL (ISS E IMPOSTOS)

   ISS (5% em São Paulo):
   ├─ ISS retido plataforma: -R$ 500
   │  (Retenção de 5% na fonte)
   ├─ ISS recolhido estado: R$ 0
   │  (Já retirado, não paga mais)
   └─ Saldo ISS: R$ 0
   
   PIS/COFINS (9.65%):**
   ├─ Acumulado mês: -R$ 965
   ├─ Pode deduzir? Verificar se LP/LC
   └─ Saldo: -R$ 965
   
   IRPJ/CSL (25%):
   ├─ Faturamento tributável: R$ 9.500
   ├─ Deduções: R$ 1.200 (operação)
   ├─ Lucro líquido: R$ 8.300
   ├─ Imposto devido: -R$ 2.075
   └─ Saldo: -R$ 2.075

3. RELATÓRIO CUSTOS OPERACIONAIS

   ├─ Pagamentos profissionais: -R$ 7.000 (70%)
   ├─ Taxa Stripe/PIX: -R$ 300 (3%)
   ├─ Infraestrutura TI: -R$ 500
   │  └─ Servidor AWS, SSL, etc
   ├─ Multas/devoluções: -R$ 50
   └─ Total despesas: -R$ 7.850

4. RELATÓRIO LUCRO DO PERÍODO

   Receita bruta: R$ 10.000
   - ISS retenção: -R$ 500
   - Custos operacionais: -R$ 7.850
   ─────────────────────────────
   Lucro bruto: R$ 1.650
   - Impostos (IRPJ 25%): -R$ 412
   ─────────────────────────────
   Lucro líquido: R$ 1.238
   
   ROI mês: 12.38%

5. RELATÓRIO DE CLIENTES TAX

   Dados para SPED:
   ├─ Total NF-e emitidas: 125
   ├─ CPF únicos faturados: 89
   ├─ CNPJs faturados: 8
   ├─ Total geral faturado: R$ 10.000,00
   ├─ Total ISS retido: R$ 500
   └─ Registro fiscal: ✓ COMPLETO

   ✓ XML SPED Fiscal
   ✓ ECF (Escrituração Contábil)
   ✓ Enviado para governo

6. EXTRATO CONTA PROFISSIONAL

   Profissional: João Santos (CPF 987.654.321-00)
   
   Período: Fevereiro 2026
   
   Agendamentos realizados: 12
   ├─ 15/02: R$ 99,25 (Agend. Maria)
   ├─ 15/02: R$ 105,00 (Agend. Pedro)
   ├─ 16/02: R$ 84,00 (Agend. Ana)
   ├─ ... (9 mais)
   └─ Total ganho: R$ 1.175,00
   
   Transferências PIX:
   ├─ 17/02: -R$ 1.175,00 ✓ Recebido
   │  Banco: Nubank
   │  Conta: xxxxx-1
   └─ Status: COMPLETO
   
   Saldo: R$ 0,00
   Próximo pagamento: 24/02/2026

7. ARQUIVO ERP/INTEGRAÇÃO

   Formato: XML | JSON | CSV
   
   Exemplo JSON para integração:
   
   {
     "mes": "2026-02",
     "empresa_cnpj": "26.120.123/0001-45",
     "total_faturado": 10000.00,
     "total_iss_retido": 500.00,
     "total_custos": 7850.00,
     "lucro_bruto": 1650.00,
     "impostos": 412.00,
     "lucro_liquido": 1238.00,
     "nfs_emitidas": 125,
     "clientes_unicos": 89,
     "arquivo_nf_xml": "url_para_zip",
     "data_geracao": "2026-03-01T08:00:00Z"
   }
   
   ✓ Enviado para contadora via SFTP seguro
   ✓ Backup automático na nuvem
   ✓ Assinado digitalmente
```

---

## 🔐 COMPLIANCE E SEGURANÇA FISCAL

### **CERTIFICADO DIGITAL PARA EMISSÃO NFe**

```
REQUISITOS (OBRIGATÓRIO):

1. CERTIFICADO DIGITAL (A1 ou A3)
   ├─ Emissor: Certificadora ICP-Brasil
   ├─ Tipo: ICP-Empresa (PJ)
   ├─ Válido até: 1 ano
   ├─ Custo: ~ R$ 300/ano
   └─ Armazenamento: Seguro no servidor (criptografado)

2. CADASTRO NA SEFAZ
   ├─ CNPJ empresa registrado
   ├─ Regime tributário informado
   ├─ Série NFe criada
   ├─ Endereço para devolução
   └─ Email autorizado

3. AUTORIZAÇÃO PARA EMISSÃO
   ├─ Contadora solicita à SEFAZ
   ├─ Documento fiscal autorizado
   ├─ Primeiro número: 1
   ├─ Última série testada
   └─ Status: ATIVA ✓

PROCESSO DE EMISSÃO (TÉCNICO):

┌─────────────────────────────────────┐
│ 1. Dados agendamento capturados     │
│    ├─ Cliente (CPF/CNPJ)            │
│    ├─ Valor                         │
│    ├─ Serviço descrito              │
│    └─ Data/hora                     │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 2. Gerar XML conforme padrão ABNT   │
│    ├─ Validar schema XSD            │
│    ├─ Preencher campos obrigatórios │
│    ├─ Incluir ICMS/ISS              │
│    └─ Gerar número sequencial       │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 3. Assinar digitalmente (Cert. ICP) │
│    ├─ Carregar certificado privado  │
│    ├─ Aplicar assinatura            │
│    ├─ Validar assinatura            │
│    └─ Salvar XML assinado           │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 4. Enviar à SEFAZ                   │
│    ├─ Conectar SOAP/HTTPS           │
│    ├─ Enviar XML assinado           │
│    ├─ Aguardar resposta             │
│    ├─ Receber protocolo             │
│    └─ Armazenar resposta            │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 5. Registrar no banco (BD local)    │
│    ├─ ID nota: protocol número      │
│    ├─ Status: AUTORIZADA            │
│    ├─ Chave nota: 44 dígitos        │
│    ├─ Link XML assinado             │
│    └─ Timestamp: 15/02/26 14:00     │
└─────────────────────────────────────┘

BANCO DE DADOS (notas_fiscais):
├─ id_nota_fiscal (PK)
├─ numero_nf (sequencial)
├─ serie
├─ cnpj_empresa
├─ cpf_cliente
├─ valor_total
├─ iss_retido
├─ data_emissao
├─ protocolo_sefaz
├─ chave_nf (44 dígitos)
├─ xml_assinado (BLOB)
├─ status ('AUTORIZADA', 'REJEITADA', 'CANCELADA')
├─ motivo_rejeicao (se houver)
└─ timestamp_envio
```

---

## 📊 DASHBOARD FISCAL

### **PAINEL PARA ADMINISTRADOR**

```
╔═══════════════════════════════════════════════════════╗
║ DASHBOARD - CONTROLE FISCAL & FINANCEIRO              ║
║ Período: Fevereiro 2026                               ║
╚═══════════════════════════════════════════════════════╝

┌─────────────────┬────────────────┬────────────────┐
│ RECEITA DO MÊS  │ IMPOSTOS A PAGAR│ LUCRO DO MÊS   │
├─────────────────┼────────────────┼────────────────┤
│ R$ 10.000,00    │ R$ 2.987,50    │ R$ 1.238,00    │
│ ↑ 12% vs jan    │ 💰 de espaço   │ ↑ 8% vs jan    │
└─────────────────┴────────────────┴────────────────┘

RECEITA X DESPESAS:
┌─────────────────────────────────────────────┐
│ Receita bruta: ███████████████ R$10.000     │
│ - Custos prof: ███████████   R$ 7.000 (70%)│
│ - Operação:    ██             R$ 800 (8%)  │
│ - Impostos:    ███            R$ 962 (9.6%)│
│ ────────────────────────────────────────── │
│ = Lucro:       ██             R$ 1.238     │
│   (12.38% ROI)                              │
└─────────────────────────────────────────────┘

NFe EMITIDAS:
├─ Total: 125 notas ✓
├─ Autorizadas: 125 ✓
├─ Rejeitadas: 0 ✓
├─ Canceladas: 0 ✓
└─ Taxa sucesso: 100% ✓

ISS RETIDO:
├─ Fevereiro: R$ 500,00
├─ Janeiro: R$ 456,00
├─ Dez (ant): R$ 520,00
├─ Acumulado 3m: R$ 1.476,00
└─ Já enviado SEFAZ: ✓

IMPOSTOS MENSAIS:
├─ PIS/COFINS: R$ 965,00 (9.65%)
├─ ISS: R$ 500,00 (5%) ← retido
├─ IRPJ: R$ 412,00 (4.1% do lucro)
├─ Contribuição Social: R$ 110,50 (1.1%)
└─ Total: R$ 1.987,50

PROFISSIONAIS PAGOS:
├─ Total: 8 profissionais
├─ Valor total: R$ 7.000,00
├─ Transferências: 8/8 ✓
├─ Pendentes: 0
└─ Status: Tudo pago

ARCHIVOS FISCAIS:
├─ XML NFe (zip): 📥 Baixar
├─ SPED Fiscal: 📥 Baixar
├─ Relatório ISS: 📥 Baixar
├─ Extrato profissionais: 📥 Baixar
├─ Recibos (DPS): 📥 Baixar
└─ Últimas 10 NFe: Ver detalhes

ALERTAS FISCAIS:
├─ ✓ Conhecimento de Débito: Não há
├─ ✓ Amostra fiscal SEFAZ: Não pendente
├─ ✓ Certific. digital: Válido até 02/2027
├─ ✓ Contingência: Não ativada
└─ ⚠️ ATENÇÃO: Enviar DPS a contadora até 05/mar
```

---

## 🔄 FLUXO AUTOMÁTICO DO MÊS

```
TIMELINE AUTOMÁTICA (Ex: FEVEREIRO 2026)

15/02 - Agend realizado
        └─ NFe emite automaticamente ✓
        
17/02 - Segunda-feira (pagto profissionais)
        ├─ Calcula comissões ✓
        ├─ Transfências PIX saem ✓
        └─ DPS gerado para cada prof ✓

28/02 - Última sexta do mês
        └─ Nada (sistema continua 24/7)

01/03 - Virada de mês (00:00 sistema)
        ├─ Relatório mensal gera ✓
        ├─ ISS calcula e pronto ✓
        ├─ XML SPED monte ✓
        ├─ Email admin sai: "Fev finalizado" ✓
        └─ Contadora recebe via SFTP ✓

05/03 - Prazo deadline (exemplo)
        └─ ⚠️ Alerta: "Enviar DPS até hoje"

10/03 - Verificação trimestral
        └─ Conferir antecedentes (opcional)

15/06 - DARF trimestral due
        ├─ ✓ Informar contadora
        └─ Sistema lembra admin
```

---

## 💻 IMPLEMENTAÇÃO TÉCNICA

### **STACK TECNOLÓGICO**

```javascript
// Backend (Node.js + Express)

// 1. Biblioteca para gerar NFe
npm install xml2js xmlsec1 soap

// 2. Certificado digital A1
// Armazenar em: /server/certs/nfe.p12 (criptografado)
const certificatePath = process.env.CERT_PATH;
const certificatePassword = process.env.CERT_PASSWORD; // env var

// 3. Função para emitir NFe
async function emitirNFe(booking) {
  const xmlNFe = gerarXmlNFe(booking);
  const xmlAssinado = assinarXml(xmlNFe, certificPath, password);
  const protocolo = await enviarSefaz(xmlAssinado);
  
  // Salvar no BD
  await notas_fiscais.create({
    numero_nf: getProxNumero(),
    cnpj_empresa: process.env.EMPRESA_CNPJ,
    cpf_cliente: booking.cliente_cpf,
    valor_total: booking.valor_final,
    protocolo_sefaz: protocolo,
    status: 'AUTORIZADA'
  });
  
  return protocolo;
}

// 4. Agendador para emitir NFe (após pagto confirmado)
cron.schedule('*/5 * * * *', async () => {
  const bookingsNovos = await bookings.find({
    pagto_confirmado: true,
    nfe_emitida: false
  });
  
  for (let booking of bookingsNovos) {
    try {
      await emitirNFe(booking);
      booking.nfe_emitida = true;
      await booking.save();
    } catch (err) {
      console.error('Erro NFe:', err);
      notificarAdminErroFiscal(err);
    }
  }
});

// 5. Relatório mensal (automático dia 1º)
cron.schedule('0 0 1 * *', async () => {
  const mes = new Date().getMonth();
  const ano = new Date().getFullYear();
  
  const relatorio = {
    total_faturado: await calcularTotalFaturado(mes, ano),
    total_nfe: await contarNFe(mes, ano),
    iss_retido: await calcularISS(mes, ano),
    custos: await calcularCustos(mes, ano)
  };
  
  const pdfRelatorio = gerarPdf(relatorio);
  enviarParaContadora(pdfRelatorio);
  notificarAdminRelatorioMes(relatorio);
});
```

---

## 📈 BENEFÍCIOS

```
✅ PARA A EMPRESA:
├─ Compliance fiscal automático (zero erros)
├─ Relatórios prontos para contadora
├─ Economia: sem contador "manual"
├─ Transparência total de lucros/impostos
└─ Auditoria facilitada

✅ PARA O PROFISSIONAL:
├─ Recibo digital para IR
├─ Transparência de ganhos
├─ Histórico de trabalho registrado
├─ Maior credibilidade (ISS pago)
└─ Facilita empréstimo/crédito

✅ PARA O CLIENTE:
├─ NFe oficial (dedutor):
├─ Comprovante fiscal válido
├─ Recibo para garantia
├─ Transparência completa
└─ Segurança jurídica

✅ PARA O GOVERO:
├─ Arrecadação completa
├─ Zero sonegação (rastreável)
├─ Dados confiáveis SPED
├─ Economia (menos fiscalização)
└─ Dados para estatísticas
```

---

## 🎯 CONCLUSÃO

**Módulo 12 NEW: Integração Contábil** substitui Chat internalizando toda a contabilidade:

- ✅ NFe automática por agendamento
- ✅ DPS para profissionais autônomos  
- ✅ Relatórios fiscais prontos
- ✅ Compliance SPED automático
- ✅ ISS e impostos controlados
- ✅ Auditoria total do negócio

**Este módulo torna o negócio profissional e legal, pronto para crescimento.**


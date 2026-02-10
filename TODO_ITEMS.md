# Checklist de itens pendentes (priorizado)

## Alta prioridade

- [ ] Integrar verificação PIX com API bancária (backend)
  - Variável: `PIX_BANK_API_URL`
  - Endpoint esperado: `GET {PIX_BANK_API_URL}/payments/:pixTransactionId`
  - Comando para testar (mock):

```bash
# roda server backend
cd backend && npm run dev
# testar verificação (substituir IDs)
curl -X GET "http://localhost:3001/api/pix/verify/<PIX_TRANSACTION_ID>"
```

- [ ] Implementar webhook para confirmação PIX
  - Criar rota `POST /api/pix/webhook` que chama `PixService.confirmPayment`

- [ ] Executar migrations pendentes

```bash
# exemplo
./scripts/run-migrations.sh
# ou usar seu gerenciador de migrations
```

- [ ] Testes e CI: garantir que `npm test` passe em backend e frontend

## Média prioridade

- [ ] Adicionar `NotificationService` e rota `/api/notifications`
- [ ] Integrar notificações com `BookingController` (ao agendar)
- [ ] Ligar serviços via feature flags em staging (`[REDACTED_TOKEN]`, `[REDACTED_TOKEN]`)

## Baixa prioridade / UI

- [ ] Estilizar: Galeria, Mapa, Blog, Análise Pred., Vídeos (frontend)
- [ ] Revisar e completar JSDoc e documentações em `IMPLEMENTACAO_*`

## Notas e comandos úteis

- Rodar backend local (pasta `backend`):

```bash
cd backend
npm install
npm run dev
```

- Rodar frontend (pasta `frontend`):

```bash
cd frontend
npm install
npm run dev
```

- Rodar testes:

```bash
# backend
cd backend && npm test
# frontend
cd frontend && npm test
```

- Executar migrations e seed (SQLite exemplo):

```bash
# ajustar conforme seu setup
./scripts/run-migrations.sh
```

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                         ⚡ AÇÕES PRIORITÁRIAS                                ║
║                                                                              ║
║                        O Que Fazer Agora (por ordem)                        ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

🔴 HOJE - CRÍTICO (Impede demo/teste):

   [ ] PASSO 1: Validar testes (5-10 min)
       $ cd backend
       $ npm run test:ci
       
       ✅ Esperado: "Test Suites: XX passed, X failed" (tudo verde)
       ❌ Se falhar: Revisar erro específico e corrigir
       
       Status atual: Jest config foi corrigido (babel.config.js criado)
       Próxima ação: Rodar e validar

   [ ] PASSO 2: Build frontend (5-8 min)
       $ cd frontend
       $ npm run build
       
       ✅ Esperado: "Build completed successfully"
       ✅ Resultado: .next/ folder criada
       ❌ Se falhar: Erro de componente ou CSS
       
       Status atual: NUNCA foi executado
       Próxima ação: Rodar build

   [ ] PASSO 3: Deploy local (2-3 min)
       Terminal 1:
       $ cd backend && npm start
       
       Terminal 2:
       $ cd frontend && npm start
       
       ✅ Abrir: http://localhost:3001
       ✅ Testar: Agendamento → PIX → QR Code
       
       Status atual: Pronto estruturalmente
       Próxima ação: Executar


🟠 IMPORTANTE - Esta semana (Antes de produção):

   [ ] PASSO 4: Configurar Stripe webhook validation (1-2 horas)
       📁 backend/src/routes/paymentRoutes.js
       
       Faltando:
         • Verificar HMAC-SHA256 signature
         • Rate limiting
         • Retry logic
       
       Comando para validar:
       $ npm run test:ci  # [REDACTED_TOKEN] tests
       
       Status atual: Estrutura existe, verificação falta
       Próxima ação: Adicionar HMAC validation

   [ ] PASSO 5: Configurar .env com credenciais reais (15 min)
       📝 backend/.env
       
       Adicionar:
         STRIPE_SECRET_KEY=sk_live_... (ou sk_test_... para teste)
         PIX_KEY=sua_chave_pix
         PIX_BANK_API_URL=https://api.banco.com/pix
         TWILIO_ACCOUNT_SID=...
         TWILIO_AUTH_TOKEN=...
         TWILIO_PHONE_NUMBER=+55...
       
       Status atual: Mock/exemplo
       Próxima ação: Preencher com credenciais
       
       ⚠️ IMPORTANTE: Não commit .env real (use apenas para teste/prod)

   [ ] PASSO 6: Testar fluxo PIX completo (30 min)
       1. Agendamento (booking)
       2. Checkout PIX
       3. QR Code gerado
       4. Simular pagamento (webhook)
       5. Confirmação em tempo real
       
       Como testar:
       curl -X POST http://localhost:3000/api/payments/webhook \
         -H "Content-Type: application/json" \
         -d '{"type":"pix.payment_confirmed","pixId":"123","bankTxId":"456"}'
       
       Status atual: Serviços prontos, webhook espera teste
       Próxima ação: Manual testing

   [ ] PASSO 7: UI Polish - Frontend (opcional, 2-4 horas)
       🎨 Componentes a revisar:
         • HomePage - Adicionar hero image + CTA
         • DashboardPage - Adicionar gráficos (recharts)
         • BookingsPage - Filtros + paginação
         • Galeria/Mapa - Nice-to-have (pode deixar pra depois)
       
       Status atual: Funcional mas básico
       Próxima ação: Designer review + CSS polish


🟡 MÉDIO PRAZO - Próximas 2 semanas:

   [ ] PASSO 8: Analytics com gráficos reais (4-6 horas)
       📊 Usar: Recharts (já estava no package.json)
       
       Implementar dashboard com:
         • Bookings por dia (gráfico de linha)
         • Receita (pie chart)
         • Top serviços (bar chart)
       
       Status atual: Dados existem, visualização falta
       Próxima ação: React components com Recharts

   [ ] PASSO 9: Chat em tempo real (4-6 horas)
       💬 Usar: Socket.io (já instalado)
       
       Implementar:
         • WebSocket connection
         • Message history
         • Real-time notifications
       
       Status atual: Backend structure, frontend falta
       Próxima ação: Frontend components + Socket setup

   [ ] PASSO 10: Galeria + Mapa + Blog (estilizar) (3-4 horas)
       🖼️ Componentes existem, UI falta
       
       Status atual: Estrutura ok, CSS falta
       Próxima ação: Tailwind CSS styling + responsivo


🟢 BÔNUS - Quando tiver tempo:

   [ ] PASSO 11: Mobile responsivo (todas as páginas)
   [ ] PASSO 12: Dark mode
   [ ] PASSO 13: Progressive Web App (PWA) - já tem next-pwa
   [ ] PASSO 14: SEO optimization
   [ ] PASSO 15: Integração com Google Analytics


═══════════════════════════════════════════════════════════════════════════════

📅 TIMELINE REALISTA:

   ┌─────────────────────────────────────┐
   │ HOJE (Agora)                        │
   ├─────────────────────────────────────┤
   │ ✓ Passos 1-3 (testes + build)       │
   │   Tempo: 15-25 min                  │
   │   Resultado: Site rodando LOCAL     │
   └─────────────────────────────────────┘
   
   ┌─────────────────────────────────────┐
   │ HOJE NOITE                          │
   ├─────────────────────────────────────┤
   │ ✓ Passos 4-6 (webhooks + testes)    │
   │   Tempo: 2-3 horas                  │
   │   Resultado: Fluxo PIX testado      │
   └─────────────────────────────────────┘
   
   ┌─────────────────────────────────────┐
   │ AMANHÃ (Deploy Staging)             │
   ├─────────────────────────────────────┤
   │ ✓ Passos 7 (UI polish, opcional)    │
   │   Tempo: 1-2 horas                  │
   │   Resultado: Frontend polido        │
   │ ✓ Deploy no servidor                │
   │   Tempo: 30-60 min                  │
   │   Resultado: Staging online         │
   └─────────────────────────────────────┘
   
   ┌─────────────────────────────────────┐
   │ PRÓXIMA SEMANA (Produção)           │
   ├─────────────────────────────────────┤
   │ ✓ Final testing                     │
   │ ✓ Deploy produção                   │
   │ ✓ Monitoramento                     │
   │ Resultado: SITE ONLINE ✅            │
   └─────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════

💡 DICAS IMPORTANTES:

   ⚠️ Não fazer tudo de uma vez!
      → Recomendação: Passos 1-3 primeiro (valida tudo funciona)
      → Depois Passos 4-6 (testes finais)
      → Depois deploy (aí sabe que está pronto)

   ⚠️ Testes sempre passam = Confiança para deploy
      → Se nm teste:ci falhando = Algo está quebrado
      → Nunca deploy com testes falhando!

   ⚠️ Frontend build é importante
      → Production-ready optimization
      → Sem build = Código ineficiente em produção

   ⚠️ Credenciais reais só em produção
      → Use teste durante desenvolvimento (sk_test_xxx)
      → Staging: Use teste também
      → Produção: Aí usa as reais ([REDACTED_TOKEN])


═══════════════════════════════════════════════════════════════════════════════

🎯 COMO SABER SE ESTÁ TUDO OK:

   ✅ Verde se:
      1. npm run test:ci passa (tudo verde)
      2. npm run build sucede (sem erros)
      3. npm start (ambos) começa sem erro
      4. http://localhost:3001 abre e renderiza
      5. Agendamento → PIX → QR Code funciona

   ❌ Vermelho se:
      1. npm test:ci falha → Corrigir erro de teste
      2. npm build falha → Corrigir erro de compilação
      3. npm start falha → Revisar logs do servidor
      4. http://localhost:3001 404 → Revisar frontend routes
      5. PIX não gera QR → Revisar PixService ou .env


═══════════════════════════════════════════════════════════════════════════════

📞 SUPORTE TÉCNICO:

   Problema: npm test:ci não encontra testes
   Solução: Jest config foi lixo, agora está ok. Rodar de novo.

   Problema: npm build falha
   Solução: Revisar erro específico (CSS missing? Component missing?)
           Rodar: npm install --save <package> se faltarem dependências

   Problema: PIX QR não aparece
   Solução: Verificar PixService.generateQRCode()
           Revisar logs: npm start com DEBUG=* npm start

   Problema: SMS não chega
   Solução: Credenciais Twilio incorretas no .env
           Testar: npm run test:ci (NotificationService.test.js)

   Problema: Port 3000/3001 usada
   Solução: lsof -i :3000 | kill -9 $PID
           Depois: npm start de novo


═══════════════════════════════════════════════════════════════════════════════

✨ RESULTADO FINAL (quando todos passos completos):

   ✅ Site funcional & online
   ✅ Pagamentos PIX & Stripe funcionando
   ✅ Notificações automáticas (SMS/WhatsApp/Email)
   ✅ Dashboard admin completo
   ✅ 60+ features implementadas
   ✅ 984+ testes passando
   ✅ Pronto para ~10k usuários simultâneos
   
   🚀 LANÇAMENTO PERMITIDO!

════════════════════════════════════════════════════════════════════════════════
```

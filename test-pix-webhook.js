#!/usr/bin/env node

/**
 * test-pix-webhook.js - Teste local do webhook PIX
 * 
 * Uso:
 *   node test-pix-webhook.js
 */

const crypto = require('crypto');
const http = require('http');

// Configuração
const WEBHOOK_SECRET = process.env.[REDACTED_TOKEN] || 'test-secret-key-123';
const BACKEND_URL = 'http://localhost:3001';
const WEBHOOK_PATH = '/webhooks/pix';

// Dados de exemplo do webhook
const webhookData = {
  pixTransactionId: 'uuid-test-' + Date.now(),
  pixQrCodeId: 'qrcode-123',
  amount: 150.00,
  bankTransactionId: 'bank-tx-456-' + Date.now(),
  bankName: 'banco-do-brasil',
  senderAccount: '12345678-0',
  timestamp: new Date().toISOString(),
  orderId: 'booking-789'
};

// Computar assinatura HMAC-SHA256
const webhookString = JSON.stringify(webhookData);
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(webhookString)
  .digest('hex');

// Preparar headers
const options = {
  hostname: 'localhost',
  port: 3001,
  path: WEBHOOK_PATH,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': webhookString.length,
    'x-bank-signature': signature,
    'x-bank-timestamp': new Date().toISOString()
  }
};

console.log('\n🧪 Teste PIX Webhook\n');
console.log('📋 Dados do webhook:');
console.log(JSON.stringify(webhookData, null, 2));
console.log('\n🔐 Assinatura HMAC-SHA256:');
console.log(signature);

console.log('\n📤 Enviando webhook para:', `${BACKEND_URL}${WEBHOOK_PATH}`);

// Fazer requisição
const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n✅ Resposta do servidor:');
    console.log(`Status: ${res.statusCode}`);
    console.log('Headers:', res.headers);
    console.log('Body:', data);

    if (res.statusCode === 200) {
      console.log('\n✅ Webhook processado com sucesso!');
      process.exit(0);
    } else {
      console.log('\n❌ Erro ao processar webhook');
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error('\n❌ Erro na requisição:', err.message);
  console.error('   Certifique-se que backend está rodando em http://localhost:3001');
  process.exit(1);
});

req.write(webhookString);
req.end();

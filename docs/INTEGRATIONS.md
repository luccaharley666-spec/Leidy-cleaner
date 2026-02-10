# Guia de Integrações - LimpezaPro

## 1. Google Maps API

### Setup
```bash
npm install @googlemaps/js-client-library
```

### Configuração
```javascript
const googleMapsClient = require('@googlemaps/js-client-library').createClient({
  key: process.env.GOOGLE_MAPS_API_KEY
});
```

### Uso
```javascript
// Calcular distância e tempo
const response = await googleMapsClient.distancematrix({
  origins: ['Rua A, São Paulo'],
  destinations: ['Rua B, São Paulo']
});

// Otimizar rota
const directions = await googleMapsClient.directions({
  origin: addresses[0],
  destination: addresses[addresses.length - 1],
  waypoints: addresses.slice(1, -1),
  optimizeWaypoints: true
});
```

---

## 2. Stripe (Pagamentos)

### Setup
```bash
npm install stripe
```

### Configuração
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
```

### Uso
```javascript
// Criar cobrança
const charge = await stripe.charges.create({
  amount: 13000, // R$ 130.00 em centavos
  currency: 'brl',
  source: token,
  description: 'Agendamento #123'
});

// Processar reembolso
const refund = await stripe.refunds.create({
  charge: charge.id,
  amount: 13000
});
```

---

## 3. Mercado Pago

### Setup
```bash
npm install mercadopago
```

### Configuração
```javascript
const mercadopago = require('mercadopago');
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_TOKEN
});
```

### Uso
```javascript
// Criar pagamento
const payment = await mercadopago.payment.create({
  items: [{
    title: 'Limpeza Padrão',
    unit_price: 130,
    quantity: 1
  }],
  payer: {
    email: user.email,
    phone: { area_code: '11', number: user.phone }
  }
});
```

---

## 4. Twilio (SMS/WhatsApp)

### Setup
```bash
npm install twilio
```

### Configuração
```javascript
const twilio = require('twilio')(
  process.env.TWILIO_SID, 
  process.env.TWILIO_TOKEN
);
```

### Uso - SMS
```javascript
// Enviar SMS
await twilio.messages.create({
  body: 'Seu agendamento é amanhã!',
  from: '+5511999999999',
  to: '+5511988888888'
});
```

### Uso - WhatsApp
```javascript
// Enviar WhatsApp
await twilio.messages.create({
  body: 'Seu agendamento foi confirmado!',
  from: 'whatsapp:+5511999999999',
  to: 'whatsapp:+5511988888888'
});
```

---

## 5. Google Calendar

### Setup
```bash
npm install googleapis google-auth-library
```

### Configuração
```javascript
const {google} = require('googleapis');
const calendar = google.calendar('v3');

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.[REDACTED_TOKEN],
  scopes: ['https://www.googleapis.com/auth/calendar']
});
```

### Uso
```javascript
// Criar evento
await calendar.events.insert({
  auth: auth,
  calendarId: 'primary',
  resource: {
    summary: 'Limpeza Padrão',
    description: 'Endereço: Rua A, 123',
    start: { dateTime: bookingDate },
    end: { dateTime: addHours(bookingDate, 2) },
    location: booking.address
  }
});
```

---

## 6. OpenAI (Chatbot IA)

### Setup
```bash
npm install openai
```

### Configuração
```javascript
const { Configuration, OpenAIApi } = require('openai');

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));
```

### Uso
```javascript
// Gerar resposta de chatbot
const response = await openai.[REDACTED_TOKEN]({
  model: 'gpt-3.5-turbo',
  messages: [
    { role: 'user', content: userMessage }
  ],
  temperature: 0.7,
  max_tokens: 150
});

const botReply = response.data.choices[0].message.content;
```

---

## 7. SendGrid (Email)

### Setup
```bash
npm install @sendgrid/mail
```

### Configuração
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
```

### Uso
```javascript
// Enviar email
await sgMail.send({
  to: user.email,
  from: 'noreply@limpezapro.com',
  subject: 'Agendamento Confirmado',
  html: emailTemplate
});
```

---

## 8. Firebase Cloud Messaging (Push Notifications)

### Setup
```bash
npm install firebase-admin
```

### Configuração
```javascript
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json'))
});
```

### Uso
```javascript
// Enviar notificação push
await admin.messaging().send({
  notification: {
    title: 'Agendamento Confirmado',
    body: 'Seu agendamento foi confirmado!'
  },
  token: userDeviceToken
});
```

---

## 9. PostgreSQL (Banco de Dados)

### Setup
```bash
npm install pg
```

### Configuração
```javascript
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

await client.connect();
```

### Uso
```javascript
// Executar query
const result = await client.query(
  'SELECT * FROM bookings WHERE user_id = $1',
  [userId]
);

await client.end();
```

---

## 10. Redis (Cache)

### Setup
```bash
npm install redis
```

### Configuração
```javascript
const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL
});

await client.connect();
```

### Uso
```javascript
// Armazenar em cache
await client.setEx('booking_' + bookingId, 3600, JSON.stringify(booking));

// Recuperar do cache
const cached = await client.get('booking_' + bookingId);
```

---

## Variáveis de Ambiente Necessárias

```
GOOGLE_MAPS_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_PUBLIC_KEY=
MERCADOPAGO_TOKEN=
TWILIO_SID=
TWILIO_TOKEN=
TWILIO_PHONE=
SENDGRID_API_KEY=
OPENAI_API_KEY=
FIREBASE_PROJECT_ID=
REDIS_URL=
DATABASE_URL=
```

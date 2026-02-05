# 🎯 Plano de Ação - Melhorias Específicas

## 1️⃣ E2E TESTS - PRIORIDADE CRÍTICA

### Implementação com Cypress

```javascript
// cypress/e2e/homepage.cy.js
describe('Homepage', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('deve carregar homepage sem erros', () => {
    cy.get('header').should('be.visible')
    cy.get('main').should('be.visible')
  })

  it('animar componentes ao scroll', () => {
    cy.get('[data-cy=benefits-section]').scrollIntoView()
    cy.get('[data-cy=benefit-card]').first().should('be.visible')
  })

  it('newsletter signup funciona', () => {
    cy.get('[data-cy=newsletter-email]').type('test@example.com')
    cy.get('[data-cy=newsletter-submit]').click()
    cy.get('[data-cy=newsletter-success]').should('be.visible')
  })
})

// cypress/e2e/booking.cy.js
describe('Agendamento', () => {
  beforeEach(() => {
    cy.login('user@test.com', 'password123')
    cy.visit('/agendar')
  })

  it('deve completar agendamento com sucesso', () => {
    cy.get('[data-cy=select-service]').select('limpeza-residencial')
    cy.get('[data-cy=select-date]').click()
    cy.get('[data-cy=calendar-day]').first().click()
    cy.get('[data-cy=select-time]').select('10:00')
    cy.get('[data-cy=submit-booking]').click()
    cy.url().should('include', '/checkout')
  })

  it('validação de dados funcionando', () => {
    cy.get('[data-cy=submit-booking]').click()
    cy.get('[data-cy=error-message]').should('be.visible')
  })
})

// cypress/e2e/payment.cy.js
describe('Pagamento', () => {
  it('stripe payment funciona', () => {
    cy.visit('/checkout')
    cy.fillStripeForm()
    cy.get('[data-cy=pay-button]').click()
    cy.url().should('include', '/sucesso')
  })

  it('pix payment pode ser iniciado', () => {
    cy.visit('/checkout')
    cy.get('[data-cy=pix-option]').click()
    cy.get('[data-cy=pix-qrcode]').should('be.visible')
  })
})
```

### Setup Cypress

```bash
# Install
npm install --save-dev cypress

# cypress.config.js
module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {},
  },
}

# Run
npm run cypress open  # Modo visual
npm run cypress run   # Modo headless
```

---

## 2️⃣ LOAD TESTING - PRIORIDADE ALTA

### Com K6

```javascript
// load-test.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Ramp-up
    { duration: '1m30s', target: 20 }, // Hold
    { duration: '30s', target: 0 },    // Ramp-down
  ],
  thresholds: {
    'http_req_duration': ['p(99)<1500'], // 99% dentro de 1.5s
    'http_req_failed': ['<0.1'],          // Menos de 0.1% falhas
  },
}

export default function () {
  // Homepage
  let res = http.get('http://localhost:3000/')
  check(res, {
    'homepage status 200': (r) => r.status === 200,
    'homepage time < 2s': (r) => r.timings.duration < 2000,
  })

  sleep(1)

  // API Booking
  res = http.get('http://localhost:3001/api/services')
  check(res, {
    'services API 200': (r) => r.status === 200,
  })

  sleep(1)

  // Simulat booking
  const payload = {
    serviceId: 1,
    date: new Date().toISOString(),
    userId: 'test-user',
  }
  res = http.post('http://localhost:3001/api/bookings', payload)
  check(res, {
    'booking created': (r) => r.status === 201,
  })

  sleep(1)
}
```

---

## 3️⃣ CI/CD PIPELINE - GitHub Actions

### Implementação

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        working-directory: ./backend
        run: npm ci
      
      - name: Run tests
        working-directory: ./backend
        run: npm test -- --coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/coverage-final.json

  frontend-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
      
      - name: Run linter
        working-directory: ./frontend
        run: npm run lint
      
      - name: Build
        working-directory: ./frontend
        run: npm run build
      
      - name: Run Jest tests
        working-directory: ./frontend
        run: npm test

  e2e-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - uses: cypress-io/github-action@v5
        with:
          start: npm run dev
          browser: chrome

  deploy:
    needs: [backend-tests, frontend-tests, e2e-tests]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # Deploy scripts aqui
          echo "Deploying to production..."
```

---

## 4️⃣ GOOGLE ANALYTICS INTEGRATION

```javascript
// frontend/lib/gtag.js
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID

export const pageview = (url) => {
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  })
}

export const event = (action, category, label, value) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}

// pages/_app.jsx
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import * as gtag from '../lib/gtag'

export default function App({ Component, pageProps }) {
  const router = useRouter()

  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url)
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  useEffect(() => {
    // Track booking completion
    gtag.event('booking_created', 'booking', 'success')
    
    // Track newsletter signup
    gtag.event('newsletter_signup', 'conversion', 'email_captured')
    
    // Track payment
    gtag.event('purchase', 'ecommerce', 'payment_completed', 100)
  }, [])

  return <Component {...pageProps} />
}

// .env.local
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## 5️⃣ 2FA - Two Factor Authentication

### TOTP Implementation

```javascript
// backend/src/controllers/AuthController.js
const speakeasy = require('speakeasy')
const QRCode = require('qrcode')

class AuthController {
  // Gerar secret TOTP
  static async generateTwoFactorSecret(req, res) {
    const { userId } = req.user
    
    const secret = speakeasy.generateSecret({
      name: `Leidy Cleaner (${req.user.email})`,
      issuer: 'Leidy Cleaner',
    })

    const qrCode = await QRCode.toDataURL(secret.otpauth_url)

    res.json({
      secret: secret.base32,
      qrCode,
      manualEntry: secret.base32,
    })
  }

  // Validar TOTP
  static async verifyTwoFactorToken(req, res) {
    const { token } = req.body
    const user = await User.findById(req.user.id)

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    })

    if (!verified) {
      return res.status(401).json({ error: 'Invalid 2FA token' })
    }

    // Gerar novo JWT com 2FA verificado
    const jwtToken = jwt.sign(
      { userId: user.id, twoFactorVerified: true },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({ token: jwtToken })
  }

  // Enable 2FA
  static async enableTwoFactor(req, res) {
    const { token, secret } = req.body
    const user = await User.findById(req.user.id)

    // Validar token antes de salvar
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
    })

    if (!verified) {
      return res.status(400).json({ error: 'Invalid token' })
    }

    user.twoFactorSecret = secret
    user.twoFactorEnabled = true
    user.backupCodes = generateBackupCodes()
    await user.save()

    res.json({ 
      message: '2FA enabled',
      backupCodes: user.backupCodes 
    })
  }
}
```

### Frontend 2FA Setup

```jsx
// frontend/components/TwoFactorSetup.jsx
import { useState } from 'react'
import QRCode from 'qrcode.react'

export default function TwoFactorSetup() {
  const [step, setStep] = useState('generate')
  const [qrCode, setQRCode] = useState(null)
  const [secret, setSecret] = useState(null)
  const [token, setToken] = useState('')

  const generateSecret = async () => {
    const res = await fetch('/api/auth/2fa/generate', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const data = await res.json()
    setSecret(data.secret)
    setQRCode(data.qrCode)
    setStep('verify')
  }

  const verifyAndEnable = async () => {
    const res = await fetch('/api/auth/2fa/enable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, secret }),
    })
    const data = await res.json()
    
    if (res.ok) {
      // Save backup codes
      setStep('backup')
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      {step === 'generate' && (
        <button 
          onClick={generateSecret}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Enable 2FA
        </button>
      )}

      {step === 'verify' && (
        <div>
          <img src={qrCode} alt="2FA QR Code" className="w-48 mx-auto mb-4" />
          <input
            type="text"
            placeholder="6-digit code"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            maxLength="6"
            className="w-full border p-2 mb-4"
          />
          <button 
            onClick={verifyAndEnable}
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            Verify & Enable
          </button>
        </div>
      )}

      {step === 'backup' && (
        <div>
          <h3>Backup Codes</h3>
          <pre className="bg-gray-100 p-4 text-sm overflow-auto">
            {/* Mostrar backup codes */}
          </pre>
        </div>
      )}
    </div>
  )
}
```

---

## 6️⃣ DATABASE INDEXING - Performance

```sql
-- Backend Database Optimizations
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Composite indexes para queries comuns
CREATE INDEX idx_user_bookings ON bookings(user_id, booking_date DESC);
CREATE INDEX idx_service_available ON services(service_type, active);
```

---

## 7️⃣ PERFORMANCE MONITORING

```javascript
// pages/_app.jsx - Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(value) {
  console.log(value)
  // Send to analytics endpoint
  fetch('/api/vitals', {
    method: 'POST',
    body: JSON.stringify(value),
    keepalive: true,
  })
}

getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

---

## 📊 MATRIZ DE IMPACTO

| Melhoria | Impacto | Esforço | Score |
|----------|---------|---------|-------|
| E2E Tests | Alto | Médio | 9/10 |
| Load Tests | Médio | Médio | 8/10 |
| CI/CD Pipeline | Alto | Médio | 9/10 |
| Google Analytics | Médio | Baixo | 7/10 |
| 2FA | Alto | Médio | 8/10 |
| DB Indexing | Médio | Baixo | 8/10 |
| Monitoring | Médio | Médio | 7/10 |

---

## 🎯 PRÓXIMAS STEPS

1. **Semana 1-2:** E2E Tests + CI/CD Pipeline
2. **Semana 2-3:** Load Testing
3. **Semana 3-4:** 2FA + Analytics
4. **Semana 4-5:** Database Optimization
5. **Semana 5+:** Advanced monitoring e alerting

---

Documento criado: 2026-02-05

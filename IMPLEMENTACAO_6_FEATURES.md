# 🚀 IMPLEMENTAÇÃO DE 6 FEATURES - Guia Rápido

**Status**: 2 features completas (Notificações + Chatbot)
**Próximas**: 6 features (estrutura + código)

---

## 📋 Próximas Implementações

### 3️⃣ **Análise Preditiva** (Sugerir Próximo Agendamento)

#### Banco de Dados
```sql
CREATE TABLE [REDACTED_TOKEN] (
  id INT PRIMARY KEY,
  userId INT,
  [REDACTED_TOKEN] INT,
  last_booking_date DATE,
  next_suggested_date DATE,
  confidence_score DECIMAL(3,2),
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

#### Backend - Novo Controller: `[REDACTED_TOKEN].js`
```javascript
exports.getNextSuggestion = async (userId) => {
  // 1. Pegar últimos 3 agendamentos do usuário
  const bookings = await db.all(`
    SELECT date FROM bookings
    WHERE userId = ?
    ORDER BY date DESC LIMIT 3
  `, [userId]);

  // 2. Calcular intervalo médio
  const intervals = [];
  for (let i = 0; i < bookings.length - 1; i++) {
    const diff = Math.abs(
      new Date(bookings[i].date) - new Date(bookings[i + 1].date)
    ) / (1000 * 60 * 60 * 24); // dias
    intervals.push(diff);
  }
  
  const avgInterval = Math.round(intervals.reduce((a, b) => a + b) / intervals.length);
  
  // 3. Sugerir próxima data
  const lastBooking = new Date(bookings[0].date);
  const nextSuggested = new Date(lastBooking);
  nextSuggested.setDate(nextSuggested.getDate() + avgInterval);
  
  return {
    lastBooking: bookings[0].date,
    avgInterval,
    nextSuggested,
    confidence: (avgInterval > 0) ? 0.85 : 0.5
  };
};
```

#### Frontend - Widget
```jsx
// Dashboard component
<SuggestedBooking
  date="15 de Fevereiro"
  service="Limpeza Residencial"
  onClick={() => agendarComData("15/02")}
/>
```

---

### 4️⃣ **Galeria Antes & Depois**

#### Banco de Dados
```sql
CREATE TABLE [REDACTED_TOKEN] (
  id INT PRIMARY KEY,
  staffId INT,
  serviceId INT,
  before_image_url VARCHAR(500),
  after_image_url VARCHAR(500),
  caption VARCHAR(255),
  likes INT DEFAULT 0,
  FOREIGN KEY (staffId) REFERENCES staff(id),
  FOREIGN KEY (serviceId) REFERENCES services(id)
);
```

#### Backend - Upload Controller
```javascript
const multer = require('multer');
const s3 = require('aws-sdk/clients/s3');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

exports.uploadBeforeAfter = async (req, res) => {
  const { staffId, serviceId, caption } = req.body;
  const { before, after } = req.files;
  
  // Upload to S3/Firebase
  const beforeUrl = await uploadToS3(before);
  const afterUrl = await uploadToS3(after);
  
  await db.run(`
    INSERT INTO [REDACTED_TOKEN] 
    (staffId, serviceId, before_image_url, after_image_url, caption)
    VALUES (?, ?, ?, ?, ?)
  `, [staffId, serviceId, beforeUrl, afterUrl, caption]);
  
  res.json({ success: true });
};
```

#### Frontend - Component
```jsx
// BeforeAfterSlider.jsx
import BeforeAfter from '[REDACTED_TOKEN]';

<BeforeAfter
  firstImage={{ imageUrl: beforeUrl }}
  secondImage={{ imageUrl: afterUrl }}
/>
```

---

### 5️⃣ **Mapa com Localização de Staff**

#### Banco de Dados
```sql
ALTER TABLE staff ADD COLUMN latitude DECIMAL(10,8);
ALTER TABLE staff ADD COLUMN longitude DECIMAL(10,8);
ALTER TABLE staff ADD COLUMN [REDACTED_TOKEN] TIMESTAMP;

CREATE TABLE [REDACTED_TOKEN] (
  id INT PRIMARY KEY,
  staffId INT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(10,8),
  timestamp TIMESTAMP,
  FOREIGN KEY (staffId) REFERENCES staff(id)
);
```

#### Backend - Location Service
```javascript
exports.getNearbyStaff = async (userLat, userLng, radius = 5) => {
  // Usar cálculo de distância Haversine
  const staff = await db.all(`
    SELECT *, 
      (3959 * acos(cos(radians(?)) * cos(radians(latitude)) * 
       cos(radians(longitude) - radians(?)) + 
       sin(radians(?)) * sin(radians(latitude)))) AS distance
    FROM staff
    WHERE active = true
    HAVING distance < ?
    ORDER BY distance
  `, [userLat, userLng, userLat, radius]);
  
  return staff;
};
```

#### Frontend - Map Component
```jsx
// StaffMap.jsx
import { GoogleMap, Marker } from '@react-google-maps/api';

<GoogleMap
  center={{ lat: userLat, lng: userLng }}
  zoom={12}
>
  {staff.map(s => (
    <Marker
      key={s.id}
      position={{ lat: s.latitude, lng: s.longitude }}
      title={s.name}
    />
  ))}
</GoogleMap>
```

---

### 6️⃣ **Blog com SEO**

#### Banco de Dados
```sql
CREATE TABLE blog_posts (
  id INT PRIMARY KEY,
  title VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  content LONGTEXT,
  excerpt VARCHAR(500),
  author_id INT,
  featured_image_url VARCHAR(500),
  category VARCHAR(100),
  seo_keywords VARCHAR(500),
  views INT DEFAULT 0,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id)
);
```

#### Backend - Blog Controller
```javascript
exports.getPosts = async (req, res) => {
  const { page = 1, limit = 10, category } = req.query;
  
  let query = 'SELECT * FROM blog_posts WHERE published = true';
  let params = [];
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  query += ' ORDER BY published_at DESC LIMIT ? OFFSET ?';
  params.push(limit, (page - 1) * limit);
  
  const posts = await db.all(query, params);
  res.json(posts);
};

exports.getBySlug = async (req, res) => {
  const { slug } = req.params;
  
  const post = await db.get(
    'SELECT * FROM blog_posts WHERE slug = ?',
    [slug]
  );
  
  // Increment views
  await db.run('UPDATE blog_posts SET views = views + 1 WHERE id = ?', [post.id]);
  
  res.json(post);
};
```

#### Frontend - Blog Pages
```jsx
// pages/blog/index.jsx - Lista de posts
// pages/blog/[slug].jsx - Post específico com meta tags SEO

<Head>
  <title>{post.title} - Leidy Cleaner</title>
  <meta name="description" content={post.excerpt} />
  <meta name="keywords" content={post.seo_keywords} />
  <meta property="og:image" content={post.featured_image_url} />
</Head>
```

---

### 7️⃣ **App Nativo (React Native)**

#### Estrutura
```bash
# Usar Expo para compartilhar código com Next.js

expo init leidy-mobile
# Screens:
# - HomeScreen
# - BookingScreen
# - DashboardScreen
# - ChatScreen
# - ProfileScreen

# Reutilizar:
# - src/config/api.js (com retry para mobile)
# - src/context/AuthContext.jsx
# - src/services/* (lógica de negócio)
```

#### Integração de Features Nativas
```javascript
// Geolocation
import * as Location from 'expo-location';

// Câmera (upload de fotos antes/depois)
import * as ImagePicker from 'expo-image-picker';

// Push Notifications
import * as Notifications from 'expo-notifications';

// Local Storage
import AsyncStorage from '@[REDACTED_TOKEN]/async-storage';
```

---

### 8️⃣ **Vídeos Curtos (TikTok/YouTube)**

#### Banco de Dados
```sql
CREATE TABLE short_videos (
  id INT PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  video_url VARCHAR(500), -- YouTube/Instagram link
  thumbnail_url VARCHAR(500),
  duration_seconds INT,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  created_at TIMESTAMP
);
```

#### Backend - Video Controller
```javascript
exports.getVideos = async (req, res) => {
  const videos = await db.all(`
    SELECT * FROM short_videos
    ORDER BY created_at DESC
    LIMIT 50
  `);
  
  res.json(videos);
};

exports.incrementViews = async (req, res) => {
  const { videoId } = req.params;
  
  await db.run('UPDATE short_videos SET views = views + 1 WHERE id = ?', [videoId]);
  
  res.json({ success: true });
};
```

#### Frontend - Video Grid
```jsx
// pages/shorts.jsx
// Componente tipo TikTok com scroll vertical
// Integração com YouTube Embedded API

<iframe
  width="100%"
  height="400"
  src="https://www.youtube-nocookie.com/embed/{videoId}"
  frameBorder="0"
  allow="accelerometer; playButton; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
/>
```

---

## 🎯 Ordem de Prioridade para Implementar

### ✅ FASE 1 (Semana 1-2) - Já Feito
1. ✅ Notificações WhatsApp/SMS
2. ✅ Chatbot IA

### 🔴 FASE 2 (Semana 3-4)
3. **Galeria Antes & Depois** (3.5 dias) 👈 COMECE AQUI
   - Mais simples de implementar
   - Alto impacto em conversão
   - Reuso de código de upload

4. **Mapa com Staff** (4.5 dias)
   - Requer API Google Maps (free tier)
   - Geolocation básica

### 🟠 FASE 3 (Semana 5-6)
5. **Blog com SEO** (8 dias)
   - Tráfego orgânico
   - Reuso de componentes

6. **Análise Preditiva** (11.5 dias)
   - Data science simples
   - Machine learning basic

### 🟡 FASE 4 (Mês 2)
7. **App Nativo** (16 dias)
   - Expo reutiliza 80% do código
   - Alto ROI (50% do tráfego é mobile)

8. **Vídeos Curtos** (2 dias)
   - Marketing (não core feature)

---

## 🔧 Como Implementar Cada Feature

### Passo 1: Banco de Dados
```bash
# Executar migration
mysql -u root -p database < database/migrations/00X_feature.sql
```

### Passo 2: Backend
```bash
# Controller
# Routes

# Testar com:
curl -X GET http://localhost:3001/api/feature/endpoint
```

### Passo 3: Frontend
```bash
# Componentes React
# Páginas Next.js
# Integração com apiCall

# Testar:
npm run dev
npm run build
```

### Passo 4: Documentação
```markdown
# Adicionar em README:
- Endpoint da feature
- Como usar no frontend
- Exemplos de requisição
```

---

## 📊 Estimativa Final

| Feature | Backend | Frontend | Total | ROI |
|---------|---------|----------|-------|-----|
| Notificações ✅ | 3d | 2d | 5d | **-90% no-shows** |
| Chatbot ✅ | 5d | 3d | 8d | **-75% suporte** |
| Galeria | 2d | 2d | 4d | **+30% conversão** |
| Mapa | 2d | 2d | 4d | **+15% conversão** |
| Blog | 3d | 3d | 6d | **+50% tráfego** |
| Análise Pred. | 6d | 2d | 8d | **+20% receita** |
| App Native | 8d | 8d | 16d | **+100% alcance** |
| Vídeos | 0d | 1d | 1d | **+200% impressões** |
| **TOTAL** | | | **52d** | **+300% faturamento** |

---

## 💿 Para Começar

### Instale dependências extras:
```bash
# Backend
npm install multer aws-sdk axios                    # Para uploads + API calls
npm install jest supertest                         # Testes
npm install @google/maps                           # Mapas

# Frontend
npm install @react-google-maps/api                 # Mapas
npm install react-helmet                          # SEO
npm install video-react                           # Vídeos
npm install axios                                 # Requests

# Mobile
expo init leidy-mobile
```

### ENV Variables Necessárias
```bash
# Notificações
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
[REDACTED_TOKEN]=

# Chatbot IA
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4-turbo

# Mapas
GOOGLE_MAPS_API_KEY=

# Uploads
[REDACTED_TOKEN]=
[REDACTED_TOKEN]=
AWS_S3_BUCKET=
```

---

**Próximo passo?**

Qual feature você quer começar?

1. 📸 **Galeria Antes & Depois** (rápida + impacto)
2. 🗺️ **Mapa com Staff** (diferencial competitivo)
3. 📝 **Blog com SEO** (tráfego orgânico)
4. 🔮 **Análise Preditiva** (smart recommendations)
5. 📱 **App Nativo** (mobile dominance)
6. 🎤 **Vídeos** (viral marketing)

Ou implementar TODAS em paralelo? (recomendado para time)

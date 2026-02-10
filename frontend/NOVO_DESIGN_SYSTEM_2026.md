# 🎨 Design System Reformulado 2026 - Moderno & Empresarial

## 📋 Visão Geral

Total reformulação estética do site com:
- ✅ **Paleta profissional** (Azul marinho + Cyan moderno)
- ✅ **Tipografia elegante** (Sora + Inter)
- ✅ **Componentes de layout** (Header, Footer, Sidebar)
- ✅ **Página landing moderna**
- ✅ **Página de serviços completa**
- ✅ **Totalmente responsivo**

---

## 🎨 Nova Paleta de Cores

### Cores Primárias (Blue Navy)
```
--primary-900: rgb(15 23 42)       /* Main brand - Dark Navy */
--primary-800: rgb(30 41 59)       /* Hover states */
--primary-700: rgb(51 65 85)       /* Active states */
```

### Cores Secundárias (Cyan Moderno)
```
--secondary-600: rgb(8 145 178)    /* Dark Cyan */
--secondary-500: rgb(6 182 212)    /* Main Accent */
--secondary-400: rgb(34 211 238)   /* Light Cyan */
```

### Cores Semânticas
```
--success: rgb(16 185 129)         /* Emerald green */
--warning: rgb(251 146 60)         /* Orange */
--danger: rgb(239 68 68)           /* Red */
--info: rgb(59 130 246)            /* Blue */
```

### Escala de Cinza (Profissional)
```
--gray-50 até --gray-900
Cores neutras para backgrounds e borders
```

---

## 📐 Espaçamento & Layout

### Spacing Scale
```css
--spacing-xs: 0.25rem    /* 4px */
--spacing-sm: 0.5rem     /* 8px */
--spacing-md: 1rem       /* 16px */
--spacing-lg: 1.5rem     /* 24px */
--spacing-xl: 2rem       /* 32px */
--spacing-2xl: 2.5rem    /* 40px */
--spacing-3xl: 3rem      /* 48px */
--spacing-4xl: 4rem      /* 64px */
```

### Container
```css
max-width: 1440px
Responsive padding: md → lg → 2xl
```

---

## 🎯 Componentes Novos

### 1. Header (Navegação Principal)
```jsx
import { Header } from '@/components/Layout';

<Header currentPage="home" />
```

**Features:**
- Logo com ícone gradiente
- Navegação responsiva (desktop/mobile)
- Menu mobile dropdown
- CTA "Agendar Agora" destacado
- Sticky ao scroll

### 2. Footer (Rodapé Profissional)
```jsx
import { Footer } from '@/components/Layout';

<Footer />
```

**Features:**
- 4 colunas (Brand, Serviços, Empresa, Contato)
- Links sociais
- Copyright automático
- Gradiente escuro profissional

### 3. MainLayout (Wrapper)
```jsx
import { MainLayout } from '@/components/Layout';

<MainLayout showHeader={true} showFooter={true}>
  {children}
</MainLayout>
```

**Features:**
- Header/Footer integrados
- Altura mínima 100vh
- Flexbox layout

### 4. Sidebar (Menu Lateral)
```jsx
import { Sidebar } from '@/components/Layout';

const [sidebarOpen, setSidebarOpen] = useState(false);

<Sidebar 
  isOpen={sidebarOpen} 
  onClose={() => setSidebarOpen(false)}
  items={[
    { href: '/dashboard', label: 'Dashboard', icon: '📊' }
  ]}
/>
```

---

## 🎨 Estilos Base Aprimorados

### Buttons
```css
.btn-primary         /* Navy background */
.btn-secondary       /* Cyan background */
.btn-outline         /* Transparent with border */
.btn-subtle          /* Light background */
.btn-danger          /* Red background */

/* Sizes */
.btn-sm
.btn-lg
.btn-full
```

**Exemplo:**
```jsx
<button className="btn-primary rounded-lg">
  Agendar
</button>
```

### Cards
```css
.card              /* White with border, shadow on hover */
.card-compact      /* Padding menor */
.card-minimal      /* Light background, sem sombra */
.card-elevated     /* Shadow sempre visível */
```

**Exemplo:**
```jsx
<div className="card p-8">
  Conteúdo
</div>
```

### Forms
```css
Input:
- 2px border (cinza)
- Focus: Cyan border + shadow
- Rounded lg
- Padding 0.75rem 1rem

.form-group         /* Wrapper */
.form-hint          /* Texto cinza pequeno */
.form-error         /* Texto vermelho pequeno */
.has-error          /* Border vermelho */
```

**Exemplo:**
```jsx
<div className="form-group">
  <label>Nome *</label>
  <input type="text" placeholder="Seu nome" />
  <p className="form-hint">Max 50 caracteres</p>
</div>
```

### Badges
```css
.badge             /* Default cinza */
.badge-success     /* Fundo verde claro */
.badge-warning     /* Fundo laranja claro */
.badge-danger      /* Fundo vermelho claro */
.badge-info        /* Fundo azul claro */
.badge-primary     /* Fundo cyan claro */
```

**Exemplo:**
```jsx
<span className="badge badge-success">✓ Ativo</span>
```

### Alerts
```css
.alert             /* Default */
.alert-success     /* Verde */
.alert-warning     /* Laranja */
.alert-danger      /* Vermelho */
.alert-info        /* Azul */
```

**Exemplo:**
```jsx
<div className="alert alert-success">
  ✓ Operação realizada com sucesso!
</div>
```

---

## 📄 Páginas de Exemplo

### 1. Landing Page (index-new.jsx)
```
✅ Hero Section com gradient
✅ 6 cards de features
✅ Grid de serviços (4 colunas)
✅ Seção de testimonials
✅ CTA final
```

**Acesso:** `/index-new`

### 2. Services Page (servicos-new.jsx)
```
✅ Hero com descrição
✅ Grid de serviços (6 cards)
✅ "How it works" section
✅ Pricing info
✅ CTA final
```

**Acesso:** `/servicos-new`

---

## 🔧 Implementação Prática

### Passo 1: Substituir globals.css
```bash
# Backup do antigo
cp src/styles/globals.css src/styles/globals-old.css

# Usar o novo
cp src/styles/globals-new.css src/styles/globals.css
```

### Passo 2: Adicionar componentes de layout
```javascript
// Componentes já criados em:
src/components/Layout/index.jsx
```

### Passo 3: Testar páginas novas
```bash
npm run dev

# Visite:
http://localhost:3000/index-new       # Landing
http://localhost:3000/servicos-new    # Services
```

---

## 🎯 Best Practices

### 1. Use Classes CSS (não inline styles)
```jsx
// ✓ Correto
<div className="p-8 bg-white rounded-lg shadow-lg">

// ✗ Evite
<div style={{ padding: '32px', background: 'white' }}>
```

### 2. Use as variáveis de cor
```jsx
// HTML com classes
<div className="bg-gradient-to-r from-blue-900 to-cyan-500">

// Ou CSS custom
background: linear-gradient(
  to right,
  var(--primary-900),
  var(--secondary-500)
);
```

### 3. Espaçamento consistente
```jsx
// Use classes de spacing
<div className="mt-xl mb-lg gap-2xl">

// Não misture sistemas
```

### 4. Responsive Design
```jsx
// Mobile-first
<div className="text-base lg:text-2xl p-md lg:p-4xl">
```

---

## 📱 Responsividade

### Breakpoints
```
Mobile: < 640px
Tablet: 640px - 1024px
Desktop: > 1024px
```

### Classes Responsivas
```css
.mobile-only      /* Visível só em mobile */
.tablet-only      /* Visível só em tablet */
.desktop-only     /* Visível só em desktop */
```

### Grid Responsivo
```jsx
{/* 1 col mobile, 2 tablet, 3-4 desktop */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
```

---

## 🌙 Dark Mode (Futuro)

O sistema já suporta dark mode via:
```css
@media ([REDACTED_TOKEN]: dark) {
  /* Cores ajustadas automaticamente */
}
```

### Ou implementar toggle:
```jsx
const [isDark, setIsDark] = useState(false);

// Aplicar atributo
<html data-theme={isDark ? 'dark' : 'light'}>
```

---

## 🚀 Como Migrar Páginas Existentes

### 1. Atualize o import de styles
```jsx
// Usar novo globals.css depois de rename
```

### 2. Use novos componentes
```jsx
import { MainLayout } from '@/components/Layout';

export default function MinhaPage() {
  return (
    <MainLayout>
      <div className="container py-16">
        {/* Seu conteúdo */}
      </div>
    </MainLayout>
  );
}
```

### 3. Substitua classes antigas
```jsx
// De:
<button className="btn-purple">

// Para:
<button className="btn-primary">
```

### 4. Atualize cores
```jsx
// De:
className="text-purple-600"

// Para:
className="text-cyan-500"
```

---

## 📊 Sombras (Profissionais)

```css
--shadow-xs: 0 1px 2px rgba(15, 23, 42, 0.05)
--shadow-sm: 0 1px 3px rgba(15, 23, 42, 0.1)
--shadow-md: 0 4px 6px rgba(15, 23, 42, 0.07)
--shadow-lg: 0 10px 15px rgba(15, 23, 42, 0.1)
--shadow-xl: 0 20px 25px rgba(15, 23, 42, 0.1)
--shadow-2xl: 0 25px 50px rgba(15, 23, 42, 0.15)
--shadow-3xl: 0 35px 60px rgba(15, 23, 42, 0.2)
```

---

## ⚡ Transições

```css
--transition-xs: 75ms
--transition-sm: 100ms
--transition-base: 150ms
--transition-md: 200ms
--transition-lg: 300ms
```

**Uso:**
```jsx
className="transition-all duration-300 hover:scale-105"
```

---

## 🎓 Tipografia

### Fonts
```
Display: Sora (H1-H6)
Body: Inter (paragraphs, text)
```

### Font Weights
```
Light: 300
Normal: 400
Medium: 500
Semibold: 600
Bold: 700
Extrabold: 800
Black: 900
```

---

## ✅ Checklist de Implementação

- [ ] Backup do globals.css antigo
- [ ] Renomear globals-new.css para globals.css
- [ ] Instalar komponentes de layout
- [ ] Testar /index-new (landing)
- [ ] Testar /servicos-new (services)
- [ ] Migrar homepage existente para novo design
- [ ] Testar responsividade (mobile, tablet, desktop)
- [ ] Testar em múltiplos navegadores
- [ ] Verificar performance (Lighthouse)
- [ ] Deploy para staging
- [ ] QA testing
- [ ] Merge para main

---

## 📞 Suporte

Para dúvidas sobre o novo design system, consulte:
- [ARCHITECTURE_VISUAL.md] - Diagramas da arquitetura
- [DESIGN_SYSTEM.md] - Sistema de design original
- [COMPONENT_INDEX.md] - Índice de componentes

---

**Pronto para transformar o site! 🚀**

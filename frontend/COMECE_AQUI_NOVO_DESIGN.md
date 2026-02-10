# ⚡ Início Rápido - Novo Design System 2026

## 🎯 Em 3 Minutos

### Passo 1: Veja o Novo Design
```bash
cd /workspaces/mmmm/frontend
npm run dev
```

**Abra no navegador:**
- 👉 **http://localhost:3000/index-new** (Landing page nova)
- 👉 **http://localhost:3000/servicos-new** (Services page nova)

### Passo 2: Leia a Documentação
```
Abra: [REDACTED_TOKEN].md
Tempo: 10 minutos
Aprenda: Como usar o novo design
```

### Passo 3: Implemente na Home
```bash
# Backup do antigo (segurança)
cp src/styles/globals.css src/styles/globals-old-backup.css

# Usar o novo
cp src/styles/globals-new.css src/styles/globals.css

# Teste novamente
npm run dev
```

---

## 📁 Arquivos Principais (Use Estes!)

### 1. globals-new.css (O Novo Design System)
```
Localização: src/styles/globals-new.css
Tamanho: 900+ linhas
O que é: Todo o design visual em CSS
Quando usar: Renomeie para globals.css e pronto
```

### 2. Layout Wrapper (Componente Reutilizável)
```
Localização: src/components/Layout/index.jsx
Exporta: Header, Footer, Sidebar, MainLayout
Quando usar: Em TODAS as páginas (substitui repetição)

Exemplo:
```jsx
import { MainLayout } from '@/components/Layout';

export default function MinhaPage() {
  return (
    <MainLayout>
      {seu conteúdo aqui}
    </MainLayout>
  );
}
```
```

### 3. Landing Page (Para Copiar o Padrão)
```
Localização: src/pages/index-new.jsx
Tamanho: 400+ linhas
O que aprender: Estrutura de seções, grids responsivos
Como usar: Copie a estrutura para suas páginas
```

### 4. Services Page (Para Copiar o Padrão)
```
Localização: src/pages/servicos-new.jsx
Tamanho: 400+ linhas
O que aprender: Cards, grids, lists, CTAs
Como usar: Copie a estrutura para suas páginas
```

---

## 🎨 Cores Novas (Memorize Estas!)

```css
/* Primária - Navy Blue (Empresarial) */
--color-primary: #0f172a
--color-primary-light: #1f2937
--color-primary-dark: #1a202c

/* Secundária - Cyan (Destaque) */
--color-secondary: #06b6d4
--[REDACTED_TOKEN]: #22d3ee
--[REDACTED_TOKEN]: #0891b2

/* Neutros - Escala de Cinzentos */
--color-slate-50 a --color-slate-950
```

---

## 🔘 Componentes CSS Prontos

### Botões
```html
<!-- Primário (destaque) -->
<button class="btn-primary">Clique aqui</button>

<!-- Secundário -->
<button class="btn-secondary">Opção</button>

<!-- Outline (border) -->
<button class="btn-outline">Simples</button>

<!-- Danger (vermelho) -->
<button class="btn-danger">Deletar</button>

<!-- Subtle (cinza) -->
<button class="btn-subtle">Opção</button>

<!-- Tamanhos -->
<button class="btn-primary sm:hidden md:inline">Small</button>
<button class="btn-primary">Default</button>
<button class="btn-primary size-lg">Large</button>
<button class="btn-primary w-full">Full width</button>
```

### Cards
```html
<!-- Card básico -->
<div class="card">
  Conteúdo aqui
</div>

<!-- Card com padding extra -->
<div class="card p-8">
  Conteúdo importante
</div>

<!-- Card com hover effect -->
<div class="card hover:shadow-xl transition-shadow">
  Conteúdo interativo
</div>
```

### Alertas
```html
<!-- Info (azul) -->
<div class="alert alert-info">
  <strong>Info:</strong> Informação importante
</div>

<!-- Success (verde) -->
<div class="alert alert-success">
  ✅ Sucesso!
</div>

<!-- Warning (amarelo) -->
<div class="alert alert-warning">
  ⚠️ Cuidado!
</div>

<!-- Danger (vermelho) -->
<div class="alert alert-danger">
  ❌ Erro!
</div>
```

### Badges
```html
<span class="badge">Default</span>
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-danger">Danger</span>
<span class="badge badge-info">Info</span>
```

---

## 📏 Layout Grid Responsivo

### Grid 2 Colunas
```html
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
</div>
```

### Grid 3 Colunas
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>
```

### Grid 4 Colunas
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {cards 4 cols}
</div>
```

---

## 🎯 Padrão de Seção (Use Este Modelo!)

```jsx
{/* Seção com padding padrão */}
<section className="py-16 lg:py-32 bg-white">
  <div className="container">
    
    {/* Título + Descrição */}
    <div className="mb-12">
      <h2 className="text-3xl lg:text-4xl font-bold mb-4">
        Título da Seção
      </h2>
      <p className="text-lg text-slate-600 max-w-2xl">
        Descrição da seção é colocada aqui.
        Usando text-lg para leitura melhor.
      </p>
    </div>

    {/* Grid de Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="card p-6">
        <h3 className="text-xl font-semibold mb-2">Card 1</h3>
        <p className="text-slate-600">Descrição</p>
      </div>
      {/* Mais cards */}
    </div>

  </div>
</section>
```

---

## 📱 Breakpoints (Memorize!)

```css
/* Mobile first */
Default     /* 0px+ - mobile */
sm:         /* 640px+ - small tablet */
md:         /* 768px+ - tablet */
lg:         /* 1024px+ - desktop */
xl:         /* 1280px+ - large desktop */
2xl:        /* 1536px+ - very large */

/* Exemplo */
<div class="text-base md:text-lg lg:text-xl">
  Tamanho aumenta conforme tela fica maior
</div>
```

---

## 🚀 Checklist Rápido

- [ ] Testei /index-new?
- [ ] Testei /servicos-new?
- [ ] Li [REDACTED_TOKEN].md?
- [ ] Sei como importar MainLayout?
- [ ] Sei quais cores usar (.btn-primary, .badge-success)?
- [ ] Entendo grid responsivo (grid-cols-1 md:grid-cols-2)?
- [ ] Entendo breakpoints (md:, lg:)?

---

## ❓ FAQ

**P: Como mudo a cor de um botão?**
```html
<!-- Azul (primary) -->
<button class="btn-primary">Clique</button>

<!-- Cinza (subtle) -->
<button class="btn-subtle">Opção</button>

<!-- Vermelho (danger) -->
<button class="btn-danger">Deletar</button>
```

**P: Como faço um card com sombra?**
```html
<div class="card shadow-lg">Conteúdo</div>
```

**P: Como faço grid responsivo?**
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

**P: Como centralizo conteúdo?**
```html
<div class="flex justify-center items-center">
  Centralizado
</div>
```

**P: Como defino espaçamento?**
```html
<!-- Classes disponíveis: p-4, m-6, mb-8, px-4, py-6, etc -->
<div class="p-6 mb-4">Conteúdo</div>
```

---

## 🎬 Próximos Passos

1. ✅ Veja o novo design (`/index-new`)
2. ✅ Leia `[REDACTED_TOKEN].md`
3. ✅ Renomeie `globals-new.css` para `globals.css`
4. ✅ Migre suas páginas (copie o padrão de `index-new.jsx`)
5. ✅ Teste tudo
6. ✅ Commit & Deploy

---

## 📞 Precisa de Ajuda?

```
Sobre cores:        Veja globals-new.css linhas 1-100
Sobre botões:       Veja globals-new.css linhas 200-300
Sobre cards:        Veja globals-new.css linhas 300-350
Sobre forms:        Veja globals-new.css linhas 350-450
Exemplo completo:   Veja src/pages/index-new.jsx
Componentes:        Veja src/components/Layout/index.jsx
Documentação:       Veja [REDACTED_TOKEN].md
```

---

**🎉 Agora é só colocar em prática! Começar por copiar o padrão de index-new.jsx nas suas páginas.**

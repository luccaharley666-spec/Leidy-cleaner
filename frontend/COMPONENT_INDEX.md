# 🚀 Índice Completo - Design System & Componentes

## 📚 Documentação

### Guias Principais
- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - Sistema de cores, tipografia, espaçamento, componentes
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Como migrar antigas páginas para novos componentes
- **[Novo Dashboard](./src/pages/dashboard-new.jsx)** - Exemplo completo de página redesenhada

---

## 🎨 Estilos & Design Tokens

### Arquivo Principal
📄 **`[src/styles/globals.css](./src/styles/globals.css)`** (500+ linhas)

#### O que contém:
```
✅ Paleta de cores (purple, cyan, green, red, blue)
✅ Tipografia responsive (Poppins + Inter)
✅ Espaçamento scale (xs → 3xl)
✅ Sombras (sm → 2xl)
✅ Estilos base (cards, buttons, inputs, forms)
✅ Classes utilitárias (.badge, .alert, .divider, .skeleton)
✅ Animações (.fade-in, .skeleton loading)
✅ Responsivos clamp() para font-size dinâmico
```

#### Tokens CSS Disponíveis
```css
/* Cores */
--accent (purple-600)
--accent-light (purple-400)
--accent-secondary (cyan-500)
--success (green-500)
--warning (red-500)
--info (blue-500)

/* Espaçamento */
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-2xl: 48px
--spacing-3xl: 64px

/* Sombras */
--shadow-sm
--shadow-md
--shadow-lg
--shadow-xl
--shadow-2xl

/* Tipografia */
--font-heading: 'Poppins'
--font-sans: 'Inter'
```

---

## 📦 Componentes Reutilizáveis

### 1. Dashboard Widgets

📄 **`[src/components/Dashboard/DashboardWidgets.jsx](./src/components/Dashboard/DashboardWidgets.jsx)`** (6 componentes)

#### Exported Components

##### `<StatsCard />`
Métrica com ícone, valor, trend e cor.
```jsx
import { StatsCard } from '@/components/Dashboard/DashboardWidgets';

<StatsCard
  icon="📅"           // emoji
  label="Agendamentos"
  value={12}          // número ou string
  change={25}         // % de mudança
  trend="up"          // "up" | "down" | "neutral"
  color="purple"      // "purple" | "green" | "cyan" | "orange"
/>
```

##### `<ActivityTimeline />`
Lista de atividades com timestamps.
```jsx
<ActivityTimeline
  activities={[
    {
      icon: '✓',
      title: 'Agendamento Concluído',
      description: 'Limpeza Residencial',
      time: '2 dias atrás'
    }
  ]}
/>
```

##### `<QuickActions />`
Grid de botões de ação rápida (4 colunas responsivo).
```jsx
<QuickActions
  actions={[
    { icon: '→', label: 'Agendar', onClick: () => {} },
    { icon: '👤', label: 'Perfil', onClick: () => {} }
  ]}
/>
```

##### `<UpcomingCard />`
Card de próximas eventos/agendamentos.
```jsx
<UpcomingCard
  icon="🏠"
  title="Limpeza Residencial"
  date="15 de Fev"
  time="14:00"
  location="Av. Paulista, 1000"
  status="confirmed"  // "confirmed" | "pending"
  actions={[
    { label: 'Ver Detalhes', onClick: () => {} }
  ]}
/>
```

##### `<InfoBox />`
Caixa highlight com gradiente.
```jsx
<InfoBox
  icon="⭐"
  title="Pontos"
  value="450"
  color="purple"  // color variant
/>
```

##### `<EmptyState />`
Placeholder para nenhum dado.
```jsx
<EmptyState
  icon="📭"
  title="Nenhum Agendamento"
  description="Você não tem agendamentos próximos"
  action={{
    label: 'Criar Agendamento',
    onClick: () => {}
  }}
/>
```

---

### 2. UI Components

📄 **`[src/components/Common/UIComponents.jsx](./src/components/Common/UIComponents.jsx)`** (9 componentes)

#### Exported Components

##### `<[REDACTED_TOKEN] />`
Sistema de toast notifications.
```jsx
import { useNotification } from '@/hooks/useDashboard';

const { notifications, success, error, warning } = useNotification();

<[REDACTED_TOKEN] notifications={notifications} />

// Usar em componente:
success('Operação realizada!');
error('Algo deu errado');
warning('Atenção!');
```

##### `<Modal />`
Dialog modal com actions.
```jsx
<Modal
  isOpen={true}
  title="Confirmar Ação"
  onClose={() => setOpen(false)}
  actions={[
    { 
      label: 'Cancelar', 
      onClick: () => setOpen(false),
      variant: 'secondary'
    },
    { 
      label: 'Confirmar',
      onClick: handleConfirm,
      variant: 'primary'
    }
  ]}
>
  É você tem certeza dessa ação?
</Modal>
```

##### `<Tooltip />`
Tooltip com posições: top, bottom, left, right.
```jsx
<Tooltip text="Clique para editar" position="top">
  <button>Editar</button>
</Tooltip>
```

##### `<Dropdown />`
Menu dropdown com alignment.
```jsx
<Dropdown
  trigger={<button>Menu</button>}
  items={[
    { label: 'Editar', onClick: () => {} },
    { label: 'Deletar', onClick: () => {} }
  ]}
  align="right"
/>
```

##### `<Spinner />`
Loading spinner animado (3 tamanhos, 3 cores).
```jsx
<Spinner size="md" color="purple" /> {/* "sm" | "md" | "lg" */}
<Spinner size="sm" color="green" />
<Spinner size="lg" color="cyan" />
```

##### `<Skeleton />`
Animated placeholder loader.
```jsx
<Skeleton width="w-full" height="h-6" count={3} />
{/* Mostra 3 linhas de placeholder animado */}
```

##### `<Collapsible />`
Seção expansível/colapsível.
```jsx
<Collapsible title="Mostrar Mais Opções" defaultOpen={false}>
  Conteúdo colapsível aqui
</Collapsible>
```

##### `<ProgressBar />`
Barra de progresso com % visual.
```jsx
<ProgressBar progress={75} color="purple" />
{/* Mostra 75% preenchido */}
```

##### `<RatingStars />`
Avaliação com 5 stars interativo.
```jsx
<RatingStars
  rating={4}
  maxRating={5}
  onRate={(newRating) => console.log(newRating)}
/>
```

---

### 3. Form Components

📄 **`[src/components/Common/FormComponents.jsx](./src/components/Common/FormComponents.jsx)`** (6 componentes)

#### Exported Components

##### `<DataTable />`
Tabela com sorting, filtering, seleção, actions.
```jsx
<DataTable
  columns={[
    { 
      key: 'name', 
      label: 'Nome',
      sortable: true,
      render: (value) => <strong>{value}</strong>
    },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'status', label: 'Status' }
  ]}
  data={users}
  selectable={true}
  onRowClick={(row) => console.log('clicked', row)}
  actions={[
    { label: 'Editar', onClick: (row) => editUser(row.id) },
    { label: 'Deletar', onClick: (row) => deleteUser(row.id) }
  ]}
  loading={isLoading}
/>
```

##### `<CardGrid />`
Grid layout responsivo (1 col mobile → 4 cols desktop).
```jsx
<CardGrid>
  {items.map(item => (
    <div key={item.id} className="card">
      {item.title}
    </div>
  ))}
</CardGrid>
```

##### `<FormSection />`
Agrupa campos de formulário com título.
```jsx
<FormSection 
  title="Dados Pessoais"
  description="Informações básicas da sua conta"
>
  {/* FormGroup components aqui */}
</FormSection>
```

##### `<FormGroup />`
Wrapper para input + label + erro + hint.
```jsx
<FormGroup
  label="Email"
  required
  error={errors.email}
  hint="Ex: seu@email.com"
>
  <input
    type="email"
    name="email"
    value={values.email}
    onChange={handleChange}
  />
</FormGroup>
```

##### `<StatRow />`
Linha de estatística com trend indicator.
```jsx
<StatRow
  label="Faturamento"
  value="R$ 5.250,00"
  trend={12}  // % positive/negative
  trendLabel="vs semana passada"
/>
```

##### `<TagInput />`
Input com tags removíveis (enter/comma delimited).
```jsx
<TagInput
  tags={['react', 'tailwind', 'nextjs']}
  onChange={(newTags) => setTags(newTags)}
  placeholder="Adicione tags..."
/>
```

---

## 🎯 Custom Hooks

📄 **`[src/hooks/useDashboard.js](./src/hooks/useDashboard.js)`** (10 hooks)

### Exported Hooks

#### `useNotification()`
Gerenciar notificações toast.
```javascript
const { 
  notifications,      // Array de notificações ativas
  success,           // (msg) => void
  error,            // (msg) => void
  warning,          // (msg) => void
  info,             // (msg) => void
  dismiss           // (id) => void
} = useNotification();

success('Salvo com sucesso!');
```

#### `useForm(initialValues, onSubmit)`
Manage form state com validação.
```javascript
const {
  values,           // Objeto com valores do form
  errors,           // Objeto com erros por campo
  touched,          // Campos já focados
  isSubmitting,     // Boolean durante submit
  handleChange,     // (e) => void para inputs
  handleBlur,       // (e) => void para blur
  handleSubmit,     // (e) => void para form submit
  setFieldValue,    // (name, value) => void
  resetForm         // () => void
} = useForm({ email: '', password: '' }, async (values) => {
  console.log('Submitting:', values);
});
```

#### `useAsync(asyncFunction, deps?)`
Execute async operations com loading state.
```javascript
const {
  value,            // Resultado do async
  error,            // Erro se houver
  status            // "idle" | "pending" | "success" | "error"
} = useAsync(() => fetch('/api/data').then(r => r.json()));

if (status === 'pending') return <Spinner />;
if (error) return <Error>{error.message}</Error>;
return <Data>{value}</Data>;
```

#### `useLocalStorage(key, initialValue)`
Persist state em localStorage.
```javascript
const [token, setToken] = useLocalStorage('token', null);

setToken('novo-token'); // Salva em localStorage
// localStorage.getItem('token') === 'novo-token'
```

#### `usePagination(items, itemsPerPage)`
Paginate arrays.
```javascript
const {
  currentItems,     // Items da página atual
  currentPage,      // Número da página atual
  totalPages,       // Total de páginas
  goToPage,         // (num) => void
  nextPage,         // () => void
  prevPage          // () => void
} = usePagination(largeArray, 10);

{currentItems.map(item => <Card key={item.id} {...item} />)}
<button onClick={nextPage}>Próximo</button>
```

#### `useDebounce(value, delay)`
Debounce valor com delay customizável.
```javascript
const [searchTerm, setSearchTerm] = useState('');
const debouncedValue = useDebounce(searchTerm, 300);

useEffect(() => {
  // Executado 300ms após parar de digitar
  searchAPI(debouncedValue);
}, [debouncedValue]);
```

#### `useModal()`
Toggle modal visibility.
```javascript
const { isOpen, open, close, toggle } = useModal();

<button onClick={open}>Abrir Modal</button>
<Modal isOpen={isOpen} onClose={close}>
  Conteúdo do modal
</Modal>
```

#### `useClickOutside(ref)`
Detectar cliques fora de elemento.
```javascript
const modalRef = useRef(null);
useClickOutside(modalRef, () => {
  console.log('Clicou fora do modal');
  close();
});

<div ref={modalRef}>...</div>
```

#### `useWindowSize()`
Track dimensões da janela (responsive).
```javascript
const { width, height } = useWindowSize();

if (width < 768) return <MobileLayout />;
return <DesktopLayout />;
```

#### `usePrevious(value)`
Acessar valor anterior de prop/state.
```javascript
const [count, setCount] = useState(0);
const prevCount = usePrevious(count);

return (
  <div>
    Now: {count}, before: {prevCount}
  </div>
);
```

---

## 🎨 Classe CSS Úteis (Em globals.css)

### Buttons
```html
<button class="btn-primary">Primary</button>
<button class="btn-secondary">Secondary</button>
<button class="btn-outline">Outline</button>
<button class="btn-danger">Danger</button>
```

### Badges
```html
<span class="badge">Default</span>
<span class="badge badge-success">✓ Success</span>
<span class="badge badge-warning">⚠ Warning</span>
<span class="badge badge-error">✗ Error</span>
```

### Alerts
```html
<div class="alert">Info</div>
<div class="alert alert-success">✓ Success!</div>
<div class="alert alert-warning">⚠ Warning</div>
<div class="alert alert-error">✗ Error!</div>
```

### Cards & Layout
```html
<div class="card">Card com sombra</div>
<div class="gradient-text">Texto com Gradiente</div>
<div class="divider">Divisor</div>
<div class="skeleton w-full h-6"></div>
```

### Mobile Visibility
```html
<div class="mobile-only">Só em mobile</div>
<div class="tablet-only">Só em tablet</div>
<div class="desktop-only">Só em desktop</div>
```

---

## 🔌 Como Importar

### Components
```javascript
// Dashboard Widgets
import { 
  StatsCard, 
  ActivityTimeline, 
  QuickActions 
} from '@/components/Dashboard/DashboardWidgets';

// UI Components
import { 
  Modal, 
  Spinner, 
  Tooltip 
} from '@/components/Common/UIComponents';

// Form Components
import { 
  DataTable, 
  FormGroup, 
  FormSection 
} from '@/components/Common/FormComponents';
```

### Hooks
```javascript
import {
  useForm,
  useNotification,
  useModal,
  useAsync,
  usePagination,
  useDebounce,
  useLocalStorage,
  useClickOutside,
  useWindowSize,
  usePrevious
} from '@/hooks/useDashboard';
```

---

## 📊 Grid Responsivo

Using Tailwind classes (já configurado):
```jsx
{/* 1 coluna mobile, 2 tablet, 3+ desktop */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

{/* Ou usar CardGrid wrapper */}
<CardGrid>
  {items.map(item => <Card key={item.id} {...item} />)}
</CardGrid>
```

---

## 🎬 Exemplo Completo: Criar Página

```jsx
// pages/novo-exemplo.jsx
import React from 'react';
import Head from 'next/head';
import { 
  StatsCard, 
  UpcomingCard,
  QuickActions 
} from '@/components/Dashboard/DashboardWidgets';
import { 
  DataTable, 
  FormSection, 
  FormGroup 
} from '@/components/Common/FormComponents';
import { 
  Spinner, 
  Modal 
} from '@/components/Common/UIComponents';
import { 
  useForm, 
  useNotification, 
  useAsync,
  useModal 
} from '@/hooks/useDashboard';

export default function NovaPagina() {
  const { success, error } = useNotification();
  const { isOpen, open, close } = useModal();
  const { values, handleChange, handleSubmit } = useForm(
    { name: '', email: '' },
    async (vals) => {
      success('Salvo com sucesso!');
    }
  );

  const { value: data, status } = useAsync(
    () => fetch('/api/items').then(r => r.json())
  );

  if (status === 'pending') return <Spinner />;

  return (
    <>
      <Head>
        <title>Nova Página</title>
      </Head>

      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Bem-vindo 👋</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            icon="📅" 
            label="Total" 
            value={data?.count} 
            color="purple"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions 
            actions={[
              { icon: '+', label: 'Novo', onClick: open }
            ]}
          />
        </div>

        {/* Data Table */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-4">Itens</h2>
          <DataTable 
            columns={[
              { key: 'name', label: 'Nome', sortable: true }
            ]}
            data={data?.items || []}
          />
        </div>

        {/* Modal */}
        <Modal
          isOpen={isOpen}
          title="Novo Item"
          onClose={close}
          actions={[
            { label: 'Cancelar', onClick: close },
            { label: 'Criar', onClick: handleSubmit }
          ]}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormGroup label="Nome">
              <input
                name="name"
                value={values.name}
                onChange={handleChange}
              />
            </FormGroup>
          </form>
        </Modal>
      </div>
    </>
  );
}
```

---

## ⚡ Performance Tips

1. **Use `React.memo()`** para evitar re-renders desnecessários:
```javascript
export default React.memo(MyComponent);
```

2. **Lazy load componentes** quando possível:
```javascript
const HeavyComponent = dynamic(() => import('./Heavy'), 
  { loading: () => <Spinner /> }
);
```

3. **Otimize imagens** com `next/image`:
```javascript
import Image from 'next/image';
<Image src="/logo.png" alt="Logo" width={100} height={100} />
```

---

## 🆘 Troubleshooting

### Problema: Componentes não importam
**Solução:** Verificar caminho correto:
```javascript
// ✗ Errado
import StatsCard from '@/components/DashboardWidgets'

// ✓ Correto
import { StatsCard } from '@/components/Dashboard/DashboardWidgets'
```

### Problema: Estilos não aplicam
**Solução:** Verificar Tailwind é importado em globals.css:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Problema: Hook useState não funciona
**Solução:** Verificar componente é client-side (adicione 'use client' no Next 13+)

---

## 📞 Support & Referências

- **Tailwind Docs:** https://tailwindcss.com/docs
- **React Docs:** https://react.dev
- **Next.js Docs:** https://nextjs.org/docs
- **CSS Variables:** https://developer.mozilla.org/en-US/docs/Web/CSS/--*

---

**Última Atualização:** ${new Date().toLocaleDateString('pt-BR')}
**Versão:** 2.0 (Design System Completo)

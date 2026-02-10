# 🎨 Guia de Design & Componentes Frontend

## 📋 Índice
1. [Design System](#design-system)
2. [Componentes Disponíveis](#componentes-disponíveis)
3. [Maior Amplidão de Layout](#amplidão-layout)
4. [Funcionalidades Úteis](#funcionalidades-úteis)
5. [Exemplos de Uso](#exemplos-de-uso)

---

## 🎨 Design System

### Paleta de Cores
```css
/* Cores Principais */
--accent: rgb(124 58 237)         /* Violet-600 */
--accent-light: rgb(167 139 250)  /* Violet-400 */
--accent-secondary: rgb(6 182 212) /* Cyan-500 */
--success: rgb(34 197 94)          /* Green-500 */
--warning: rgb(248 113 113)        /* Red-500 */
--info: rgb(59 130 246)            /* Blue-500 */
```

### Tipografia
```css
/* Font Families */
--font-heading: 'Poppins', sans-serif  /* H1-H6 */
--font-sans: 'Inter', sans-serif       /* Body text */

/* Font Sizes */
h1: clamp(2rem, 5vw, 3.5rem)    /* Responsivo */
h2: clamp(1.75rem, 4vw, 2.5rem)
h3: clamp(1.25rem, 3vw, 1.75rem)
```

### Espaçamento
```css
--spacing-xs: 0.25rem   (4px)
--spacing-sm: 0.5rem    (8px)
--spacing-md: 1rem      (16px)
--spacing-lg: 1.5rem    (24px)
--spacing-xl: 2rem      (32px)
--spacing-2xl: 3rem     (48px)
--spacing-3xl: 4rem     (64px)
```

---

## 📦 Componentes Disponíveis

### Dashboard Widgets (`components/Dashboard/DashboardWidgets.jsx`)

#### StatsCard
Exibe métrica com ícone, valor e trend.
```jsx
<StatsCard
  icon="📅"
  label="Agendamentos"
  value={12}
  change={25}
  trend="up"
  color="purple"
/>
```

#### ActivityTimeline
Lista atividades com timestamps.
```jsx
<ActivityTimeline activities={[
  { 
    icon: '✓', 
    title: 'Agendamento concluído',
    description: 'Limpeza Residencial',
    time: '2 dias atrás'
  }
]} />
```

#### QuickActions
Botões de ação rápida em grid.
```jsx
<QuickActions actions={[
  { 
    icon: '→', 
    label: 'Agendar',
    onClick: () => {}
  }
]} />
```

#### UpcomingCard
Card de próximos agendamentos.
```jsx
<UpcomingCard
  icon="🏠"
  title="Limpeza Residencial"
  date="15 de Fev"
  time="14:00"
  location="Av. Paulista, 1000"
  status="confirmed"
  actions={[
    { label: 'Ver', onClick: () => {} }
  ]}
/>
```

#### InfoBox
Caixa de informação destacada.
```jsx
<InfoBox
  icon="⭐"
  title="Pontos"
  value="450"
  color="purple"
/>
```

### UI Components (`components/Common/UIComponents.jsx`)

#### [REDACTED_TOKEN]
Sistema de notificações toast.
```jsx
const { notifications, success, error } = useNotification();
success('Operação realizada com sucesso!');
<[REDACTED_TOKEN] notifications={notifications} />
```

#### Modal
Modal com actions.
```jsx
<Modal
  isOpen={true}
  title="Confirmar"
  onClose={() => {}}
  actions={[
    { label: 'Confirm', onClick: () => {} }
  ]}
>
  Tem certeza?
</Modal>
```

#### Spinner & Skeleton
Loading states.
```jsx
<Spinner size="md" color="purple" />
<Skeleton width="w-full" height="h-6" count={3} />
```

#### Collapsible
Seção expansível.
```jsx
<Collapsible title="Mais Opções" defaultOpen={false}>
  Conteúdo aqui
</Collapsible>
```

#### RatingStars
Avaliação com stars.
```jsx
<RatingStars 
  rating={4} 
  maxRating={5}
  onRate={(rating) => console.log(rating)}
/>
```

### Form Components (`components/Common/FormComponents.jsx`)

#### DataTable
Tabela com sorting, filtering, seleção.
```jsx
const columns = [
  { key: 'name', label: 'Nome', sortable: true },
  { key: 'email', label: 'Email' }
];

<DataTable
  columns={columns}
  data={users}
  onRowClick={(row) => {}}
  selectable={true}
  actions={[
    { label: 'Editar', onClick: (row) => {} }
  ]}
/>
```

#### FormSection & FormGroup
Organizar formulários.
```jsx
<FormSection title="Dados Pessoais">
  <FormGroup label="Nome" required error="">
    <input type="text" />
  </FormGroup>
</FormSection>
```

#### TagInput
Input com tags removíveis.
```jsx
<TagInput 
  tags={['react', 'node']}
  onChange={(tags) => {}
/>
```

---

## 📏 Amplidão de Layout

### Container Principal
- **Máx Width**: 1400px (vs 72rem anterior)
- **Padding**: Responsivo (md → lg → xl)
- **Sem bordas laterais**: Layout totalmente amplo

```jsx
<div className="container mx-auto">
  {/* Conteúdo amplo */}
</div>
```

### Grid Responsivo
```jsx
{/* 4 colunas em lg, automático em mobile */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Cards */}
</div>

{/* Ou usar helper */}
<div className="grid-cols-auto">
  {/* Auto-fit responsivo */}
</div>
```

### Cards com Hover
Cards agora têm hover effect:
```css
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

---

## 🛠️ Funcionalidades Úteis

### Custom Hooks

#### useNotification
```jsx
const { success, error, warning, info } = useNotification();

success('Salvo com sucesso!');
error('Erro ao salvar');
```

#### useForm
```jsx
const { values, errors, handleChange, handleSubmit } = useForm(
  { email: '', password: '' },
  async (values) => { /* submit */ }
);

<form onSubmit={handleSubmit}>
  <input name="email" value={values.email} onChange={handleChange} />
</form>
```

#### useModal
```jsx
const { isOpen, open, close } = useModal();

<button onClick={open}>Abrir</button>
<Modal isOpen={isOpen} onClose={close}>...</Modal>
```

#### useAsync
```jsx
const { value, error, status } = useAsync(
  () => fetch('/api/data').then(r => r.json())
);

if (status === 'pending') return <Spinner />;
if (error) return <Error />;
return <Data value={value} />;
```

#### useLocalStorage
```jsx
const [token, setToken] = useLocalStorage('token', null);

setToken('novo-token-aqui');
// Persiste em localStorage automaticamente
```

#### usePagination
```jsx
const { currentItems, totalPages, nextPage, prevPage } = usePagination(
  items,
  10 // items per page
);

{currentItems.map(item => <Card key={item.id} {...item} />)}
```

#### useWindowSize
```jsx
const { width, height } = useWindowSize();

if (width < 768) return <MobileLayout />;
return <DesktopLayout />;
```

---

## 📚 Exemplos de Uso

### Dashboard Moderno
```jsx
import { StatsCard, ActivityTimeline, UpcomingCard } from '../components/Dashboard/DashboardWidgets';
import { useNotification } from '../hooks/useDashboard';

export default function Dashboard() {
  const { success } = useNotification();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Bem-vindo 👋</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard icon="📅" label="Agendamentos" value={12} />
        <StatsCard icon="💰" label="Total" value="R$ 1.850,50" color="green" />
      </div>

      {/* Upcoming Bookings */}
      <div className="space-y-4 mb-8">
        <h2 className="text-2xl font-bold">Próximos Agendamentos</h2>
        {bookings.map(b => <UpcomingCard key={b.id} {...b} />)}
      </div>
    </div>
  );
}
```

### Página com Formulário
```jsx
import { FormSection, FormGroup, DataTable } from '../components/Common/FormComponents';
import { useForm, useNotification } from '../hooks/useDashboard';

export default function ManageUsers() {
  const { values, handleChange, handleSubmit } = useForm(
    { name: '', email: '' },
    async (vals) => {
      await api.createUser(vals);
      success('Usuário criado!');
    }
  );

  return (
    <div className="container mx-auto py-8">
      <FormSection title="Novo Usuário">
        <FormGroup label="Nome" required>
          <input 
            name="name" 
            value={values.name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border-2"
          />
        </FormGroup>
        <button onClick={handleSubmit} className="btn-primary">
          Criar
        </button>
      </FormSection>

      <DataTable 
        columns={[
          { key: 'name', label: 'Nome', sortable: true },
          { key: 'email', label: 'Email' }
        ]}
        data={users}
        actions={[
          { label: 'Editar', onClick: (user) => {} }
        ]}
      />
    </div>
  );
}
```

---

## 🚀 Best Practices

### CSS Classes úteis
```jsx
/* Text gradient */
<h1 className="text-gradient">Título Colorido</h1>

/* Badges */
<span className="badge badge-success">✓ Ativo</span>
<span className="badge badge-warning">⚠ Atenção</span>

/* Alerts */
<div className="alert alert-success">Sucesso!</div>
<div className="alert alert-error">Erro!</div>

/* Divider */
<div className="divider"></div>

/* Skeleton loading */
<div className="skeleton w-full h-6"></div>
```

### Responsive Design
```jsx
{/* Mobile-first */}
<div className="mobile-only">Mobile</div>
<div className="tablet-only">Tablet</div>
<div className="desktop-only">Desktop</div>

{/* Ou Tailwind */}
<div className="md:hidden">Mobile</div>
<div className="hidden md:block">Desktop</div>
```

### Dark Mode
Suportado nativamente via CSS variables:
```css
[data-theme="dark"] {
  --bg: 10 15 32;
  --surface: 20 30 50;
}
```

---

## 📞 Suporte

Para dúvidas ou novos componentes, consulte:
- [Tailwind CSS](https://tailwindcss.com)
- [Componentes criados](./components)
- [Hooks customizados](./hooks)

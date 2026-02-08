# 📱 Guia de Migração - Aplicar Novo Design

## 🎯 Objetivo
Aplicar o novo design system e componentes reusáveis às páginas existentes (login, register, booking, etc).

## 📋 Checklist de Migração

### ✅ Dashboard
- [x] Nova página em `/pages/dashboard-new.jsx`
- [ ] Testar no navegador
- [ ] Adicionar ao menu principal
- [ ] Remover dashboard antigo

### ⏳ Páginas a Migrar

#### 1. Login Page
```
Status: ⏳ Pendente
Arquivo: /frontend/src/pages/login.jsx
Atualizações Necessárias:
- [x] Usar FormGroup para inputs
- [x] Botão com classe .btn-primary
- [x] Spacing usando --spacing-lg
- [x] Card wrapper com sombra
- [x] Espaçamento amplo horizontal (px-4 md:px-0)
```

#### 2. Register Page
```
Status: ⏳ Pendente
Arquivo: /frontend/src/pages/register.jsx
Atualizações Necessárias:
- [ ] FormSection para agrupar campos
- [ ] FormGroup para cada input
- [ ] Validação de erros com feedback visual
- [ ] Spinner durante submit
- [ ] useForm hook para state
```

#### 3. Booking/Scheduling
```
Status: ⏳ Pendente
Arquivo: /frontend/src/pages/[servico]/booking.jsx
Atualizações Necessárias:
- [ ] CardGrid para mostrar serviços
- [ ] Collapsible para options
- [ ] DataTable para horários disponíveis
- [ ] QuickActions para próximos passos
- [ ] useModal para confirmação
```

#### 4. Profile/Account
```
Status: ⏳ Pendente
Arquivo: /frontend/src/pages/profile.jsx
Atualizações Necessárias:
- [ ] FormSection com tabs (dados, endereço, pagamento)
- [ ] FormGroup para cada input
- [ ] useForm para validação
- [ ] DataTable para histórico
- [ ] Avatar com badge de status
```

#### 5. Payments
```
Status: ⏳ Pendente
Arquivo: /frontend/src/pages/payments.jsx
Atualizações Necessárias:
- [ ] CardGrid para métodos pagamento
- [ ] DataTable para transações
- [ ] StatRow para resumo
- [ ] Modal para adicionar card
- [ ] useForm para payment data
```

#### 6. Services/Listings
```
Status: ⏳ Pendente
Arquivo: /frontend/src/pages/services.jsx
Atualizações Necessárias:
- [ ] CardGrid para grid responsivo
- [ ] UpcomingCard customizado para serviço
- [ ] Filtros com tags
- [ ] RatingStars para avaliações
- [ ] QuickActions para ações
```

---

## 🔄 Template de Migração

### Antes (Estilo Antigo)
```jsx
import React from 'react';
import styles from './login.module.css';

export default function Login() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  return (
    <div className={styles.container}>
      <form className={styles.form}>
        <label className={styles.label}>Email:</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />
        
        <label className={styles.label}>Senha:</label>
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
        />
        
        <button type="submit" className={styles.button}>
          Entrar
        </button>
      </form>
    </div>
  );
}
```

### Depois (Novo Design System)
```jsx
import React from 'react';
import { FormSection, FormGroup } from '@/components/Common/FormComponents';
import { useForm, useNotification } from '@/hooks/useDashboard';
import { Spinner } from '@/components/Common/UIComponents';

export default function Login() {
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    { email: '', password: '' },
    async (values) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(values)
      });
      
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard';
      }
    }
  );
  
  const { error } = useNotification();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-cyan-50">
      <div className="w-full max-w-md px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8">Entrar</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormGroup 
              label="Email" 
              required
              error={errors.email}
            >
              <input
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
              />
            </FormGroup>

            <FormGroup 
              label="Senha"
              required
              error={errors.password}
            >
              <input
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
              />
            </FormGroup>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" /> Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Não tem conta?{' '}
              <a href="/register" className="text-purple-600 font-bold hover:underline">
                Criar conta
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🎨 Padrões Comuns

### 1. Cards Responsivos
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <div key={item.id} className="card">
      <h3 className="text-xl font-bold">{item.title}</h3>
      <p className="text-gray-600 mb-4">{item.description}</p>
      <button className="btn-primary">Ver Mais</button>
    </div>
  ))}
</div>
```

### 2. Formulários com Validação
```jsx
const { values, errors, handleChange, handleSubmit } = useForm(
  { 
    name: '',
    email: '',
    phone: ''
  },
  async (values) => {
    // Submit logic
  }
);

return (
  <form onSubmit={handleSubmit} className="space-y-6">
    <FormSection title="Informações Pessoais">
      <FormGroup label="Nome" required error={errors.name}>
        <input
          name="name"
          value={values.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border-2 rounded-lg"
        />
      </FormGroup>
      
      <FormGroup label="Email" required error={errors.email}>
        <input
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border-2 rounded-lg"
        />
      </FormGroup>
    </FormSection>
    
    <button type="submit" className="btn-primary">
      Salvar
    </button>
  </form>
);
```

### 3. Tabelas com Dados
```jsx
const [users, setUsers] = React.useState([]);

<DataTable
  columns={[
    { key: 'name', label: 'Nome', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Telefone' },
    { key: 'status', label: 'Status', render: (value) => (
      <span className={`badge badge-${value === 'active' ? 'success' : 'gray'}`}>
        {value === 'active' ? 'Ativo' : 'Inativo'}
      </span>
    )}
  ]}
  data={users}
  selectable={true}
  actions={[
    { label: 'Editar', onClick: (user) => console.log('edit', user) },
    { label: 'Deletar', onClick: (user) => console.log('delete', user) }
  ]}
/>
```

### 4. Modais e Confirmação
```jsx
const { isOpen, open, close } = useModal();
const { success } = useNotification();

const handleDelete = async (id) => {
  open();
  // Show confirmation modal
};

return (
  <>
    <button onClick={handleDelete} className="btn-danger">
      Deletar
    </button>

    <Modal
      isOpen={isOpen}
      title="Confirmar Exclusão"
      onClose={close}
      actions={[
        { 
          label: 'Cancelar', 
          onClick: close,
          variant: 'secondary'
        },
        { 
          label: 'Deletar',
          onClick: async () => {
            await api.delete(`/users/${selectedId}`);
            success('Deletado com sucesso!');
            close();
          },
          variant: 'danger'
        }
      ]}
    >
      Tem certeza que deseja deletar este item?
    </Modal>
  </>
);
```

### 5. Loading e Estados
```jsx
const { value: data, status, error } = useAsync(
  () => fetch('/api/data').then(r => r.json())
);

if (status === 'pending') {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="lg" />
    </div>
  );
}

if (error) {
  return (
    <div className="alert alert-error">
      Erro ao carregar dados: {error.message}
    </div>
  );
}

return (
  <div className="space-y-4">
    {data?.items.map(item => (
      <div key={item.id} className="card">
        {item.title}
      </div>
    ))}
  </div>
);
```

---

## 📊 Ordem de Prioridade

**1️⃣ Alta Prioridade (Fazer Hoje)**
- Login & Register (páginas de entrada)
- Dashboard Navigation (integração do novo dashboard)

**2️⃣ Média Prioridade (Esta Semana)**
- Profile/Account
- Services/Listings
- Booking Flow

**3️⃣ Baixa Prioridade (Próximas Semanas)**
- Payment Pages
- Admin Panels
- Reporting Pages

---

## 🔗 Links Úteis

- Design System: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
- Components: [/components](./src/components)
- Hooks: [/hooks](./src/hooks)
- Tailwind Docs: https://tailwindcss.com
- React Docs: https://react.dev

---

## ✅ Checklist Final

Antes de fazer deploy, verificar:
- [ ] Todas as páginas responsivas (mobile, tablet, desktop)
- [ ] Formulários com validação
- [ ] Loading states durante API calls
- [ ] Error boundaries implementados
- [ ] Dark mode testado (se aplicável)
- [ ] Acessibilidade (keyboard nav, screen reader)
- [ ] Performance (no bundle bloat)
- [ ] Testes em navegadores modernos (Chrome, Firefox, Safari)

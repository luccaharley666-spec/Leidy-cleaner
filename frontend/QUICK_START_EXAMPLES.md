# 🚀 Quick Start - Exemplos Prontos Para Usar

## 📋 Templates Prontos - Copy & Paste

Todos os exemplos abaixo funcionam imediatamente. Copie e adapte aos seus dados!

---

## 1️⃣ Dashboard Simples

```jsx
// pages/dashboard-exemplo.jsx
import React from 'react';
import Head from 'next/head';
import { StatsCard, QuickActions, UpcomingCard } from '@/components/Dashboard/DashboardWidgets';
import { useNotification } from '@/hooks/useDashboard';

export default function DashboardExemplo() {
  const { success } = useNotification();

  return (
    <>
      <Head><title>Dashboard</title></Head>
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold mb-8">Bem-vindo! 👋</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            icon="📅" 
            label="Agendamentos"
            value={12}
            trend={5}
            color="purple"
          />
          <StatsCard 
            icon="💰" 
            label="Faturamento"
            value="R$ 2.500"
            trend={12}
            color="green"
          />
          <StatsCard 
            icon="⭐" 
            label="Avaliação"
            value="4.8"
            trend={3}
            color="cyan"
          />
          <StatsCard 
            icon="👥" 
            label="Clientes"
            value={45}
            trend={8}
            color="orange"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions 
            actions={[
              { icon: '📅', label: 'Agendar', onClick: () => success('Agendar clicado') },
              { icon: '👤', label: 'Perfil', onClick: () => success('Perfil clicado') },
              { icon: '💳', label: 'Pagamento', onClick: () => success('Pagamento clicado') },
              { icon: '⚙️', label: 'Configurar', onClick: () => success('Config clicado') },
            ]}
          />
        </div>

        {/* Upcoming Events */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Próximos Agendamentos</h2>
          <div className="space-y-4">
            <UpcomingCard
              icon="🏠"
              title="Limpeza Residencial"
              date="15 de Fevereiro"
              time="14:00"
              location="Av. Paulista, 1000"
              status="confirmed"
              actions={[
                { label: 'Ver Detalhes', onClick: () => console.log('clicked') }
              ]}
            />
            <UpcomingCard
              icon="🏢"
              title="Limpeza Comercial"
              date="18 de Fevereiro"
              time="09:00"
              location="Rua Augusta, 500"
              status="pending"
              actions={[
                { label: 'Confirmar', onClick: () => console.log('clicked') }
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
}
```

---

## 2️⃣ Página com Formulário

```jsx
// pages/novo-usuario.jsx
import React from 'react';
import Head from 'next/head';
import { FormSection, FormGroup } from '@/components/Common/FormComponents';
import { useForm, useNotification } from '@/hooks/useDashboard';
import { Spinner } from '@/components/Common/UIComponents';

export default function NovoUsuario() {
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    {
      nome: '',
      email: '',
      telefone: '',
      endereco: '',
      cidade: '',
      cep: ''
    },
    async (dados) => {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });

      if (res.ok) {
        success('Usuário criado com sucesso!');
        setTimeout(() => window.location.href = '/usuarios', 1500);
      } else {
        error('Erro ao criar usuário');
      }
    }
  );

  const { success, error } = useNotification();

  return (
    <>
      <Head><title>Novo Usuário</title></Head>

      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <h1 className="text-4xl font-bold mb-8">Novo Usuário</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Seção 1: Dados Pessoais */}
          <FormSection
            title="Dados Pessoais"
            description="Informações básicas do usuário"
          >
            <FormGroup
              label="Nome Completo"
              required
              error={errors.nome}
            >
              <input
                type="text"
                name="nome"
                value={values.nome}
                onChange={handleChange}
                placeholder="João da Silva"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </FormGroup>

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
                placeholder="joao@example.com"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </FormGroup>

            <FormGroup
              label="Telefone"
              required
              error={errors.telefone}
              hint="Formato: (11) 99999-9999"
            >
              <input
                type="tel"
                name="telefone"
                value={values.telefone}
                onChange={handleChange}
                placeholder="(11) 99999-9999"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
              />
            </FormGroup>
          </FormSection>

          {/* Seção 2: Endereço */}
          <FormSection
            title="Endereço"
            description="Localização do usuário"
          >
            <FormGroup
              label="Endereço"
              required
              error={errors.endereco}
            >
              <input
                type="text"
                name="endereco"
                value={values.endereco}
                onChange={handleChange}
                placeholder="Rua/Av, número"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
              />
            </FormGroup>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup
                label="Cidade"
                required
                error={errors.cidade}
              >
                <input
                  type="text"
                  name="cidade"
                  value={values.cidade}
                  onChange={handleChange}
                  placeholder="São Paulo"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
                />
              </FormGroup>

              <FormGroup
                label="CEP"
                required
                error={errors.cep}
              >
                <input
                  type="text"
                  name="cep"
                  value={values.cep}
                  onChange={handleChange}
                  placeholder="12345-678"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
                />
              </FormGroup>
            </div>
          </FormSection>

          {/* Botão Submit */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" /> Criando...
                </>
              ) : (
                'Criar Usuário'
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
```

---

## 3️⃣ Página com Tabela de Dados

```jsx
// pages/usuarios.jsx
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { DataTable } from '@/components/Common/FormComponents';
import { Modal, Spinner } from '@/components/Common/UIComponents';
import { useModal, useNotification, useAsync } from '@/hooks/useDashboard';

export default function Usuarios() {
  const { success, error } = useNotification();
  const { isOpen, open, close } = useModal();
  const [selectedUser, setSelectedUser] = useState(null);

  const { value: usuarios, status } = useAsync(
    () => fetch('/api/usuarios').then(r => r.json())
  );

  const handleDelete = (user) => {
    setSelectedUser(user);
    open();
  };

  const confirmDelete = async () => {
    const res = await fetch(`/api/usuarios/${selectedUser.id}`, {
      method: 'DELETE'
    });
    
    if (res.ok) {
      success('Usuário deletado!');
      close();
      window.location.reload();
    } else {
      error('Erro ao deletar');
    }
  };

  if (status === 'pending') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Head><title>Usuários</title></Head>

      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Usuários</h1>
          <a href="/novo-usuario" className="btn-primary">
            + Novo Usuário
          </a>
        </div>

        <div className="card p-6">
          <DataTable
            columns={[
              { 
                key: 'nome', 
                label: 'Nome',
                sortable: true
              },
              { 
                key: 'email', 
                label: 'Email',
                sortable: true
              },
              { 
                key: 'telefone', 
                label: 'Telefone'
              },
              {
                key: 'status',
                label: 'Status',
                render: (status) => (
                  <span className={`badge badge-${status === 'ativo' ? 'success' : 'gray'}`}>
                    {status === 'ativo' ? '✓ Ativo' : '⊘ Inativo'}
                  </span>
                )
              }
            ]}
            data={usuarios || []}
            selectable
            actions={[
              {
                label: 'Editar',
                onClick: (user) => {
                  window.location.href = `/usuarios/${user.id}/editar`;
                }
              },
              {
                label: 'Deletar',
                onClick: handleDelete
              }
            ]}
          />
        </div>

        {/* Modal de Confirmação */}
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
              onClick: confirmDelete,
              variant: 'danger'
            }
          ]}
        >
          Tem certeza que deseja deletar <strong>{selectedUser?.nome}</strong>?
          Esta ação não pode ser desfeita.
        </Modal>
      </div>
    </>
  );
}
```

---

## 4️⃣ Login/Autenticação

```jsx
// pages/login.jsx
import React from 'react';
import Head from 'next/head';
import { FormGroup } from '@/components/Common/FormComponents';
import { useForm, useNotification } from '@/hooks/useDashboard';
import { Spinner } from '@/components/Common/UIComponents';

export default function Login() {
  const { success, error } = useNotification();
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    { email: '', password: '' },
    async (dados) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });

      if (res.ok) {
        const { token } = await res.json();
        localStorage.setItem('token', token);
        success('Bem-vindo de volta!');
        setTimeout(() => window.location.href = '/dashboard', 1500);
      } else {
        error('Credenciais inválidas');
      }
    }
  );

  return (
    <>
      <Head><title>Login</title></Head>

      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-cyan-50 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h1 className="text-3xl font-bold text-center mb-2">Limpeza Pro</h1>
            <p className="text-center text-gray-600 mb-8">Bem-vindo de volta!</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <FormGroup
                label="Email"
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

            <div className="mt-6 space-y-3 text-center text-sm">
              <div>
                <a href="#" className="text-purple-600 hover:underline">
                  Esqueceu a senha?
                </a>
              </div>
              <div className="text-gray-600">
                Não tem conta?{' '}
                <a href="/register" className="text-purple-600 font-bold hover:underline">
                  Criar conta
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
```

---

## 5️⃣ Página com Tabs

```jsx
// pages/perfil.jsx
import React, { useState } from 'react';
import Head from 'next/head';
import { FormSection, FormGroup, StatRow } from '@/components/Common/FormComponents';
import { useForm, useNotification } from '@/hooks/useDashboard';

export default function Perfil() {
  const { success } = useNotification();
  const [activeTab, setActiveTab] = useState('dados');
  
  const { values, handleChange, handleSubmit } = useForm(
    {
      nome: 'João Silva',
      email: 'joao@example.com',
      telefone: '(11) 99999-9999'
    },
    async (dados) => {
      success('Perfil atualizado!');
    }
  );

  return (
    <>
      <Head><title>Meu Perfil</title></Head>

      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <h1 className="text-4xl font-bold mb-8">Meu Perfil</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b-2 border-gray-200">
          {[
            { id: 'dados', label: 'Dados Pessoais' },
            { id: 'endereco', label: 'Endereço' },
            { id: 'historico', label: 'Histórico' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-semibold border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'dados' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormSection title="Informações Básicas">
              <FormGroup label="Nome Completo">
                <input
                  name="nome"
                  value={values.nome}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 rounded-lg"
                />
              </FormGroup>

              <FormGroup label="Email">
                <input
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 rounded-lg"
                />
              </FormGroup>

              <FormGroup label="Telefone">
                <input
                  name="telefone"
                  value={values.telefone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 rounded-lg"
                />
              </FormGroup>
            </FormSection>

            <button type="submit" className="btn-primary">
              Salvar Alterações
            </button>
          </form>
        )}

        {activeTab === 'endereco' && (
          <div className="card p-6">
            <p className="text-gray-600">Endereço em desenvolvimento...</p>
          </div>
        )}

        {activeTab === 'historico' && (
          <div className="space-y-4">
            <StatRow
              label="Total Gasto"
              value="R$ 5.250,00"
              trend={12}
              trendLabel="vs mês passado"
            />
            <StatRow
              label="Agendamentos"
              value="24"
              trend={5}
              trendLabel="vs mês passado"
            />
          </div>
        )}
      </div>
    </>
  );
}
```

---

## 6️⃣ Serviços com Grid Responsivo

```jsx
// pages/servicos.jsx
import React from 'react';
import Head from 'next/head';
import { CardGrid } from '@/components/Common/FormComponents';
import { RatingStars } from '@/components/Common/UIComponents';

const servicos = [
  {
    id: 1,
    icon: '🏠',
    nome: 'Limpeza Residencial',
    descricao: 'Limpeza completa da sua casa',
    preco: 'A partir de R$ 150',
    rating: 4.8,
    reviews: 245
  },
  {
    id: 2,
    icon: '🏢',
    nome: 'Limpeza Comercial',
    descricao: 'Limpeza de escritórios e empresas',
    preco: 'A partir de R$ 250',
    rating: 4.9,
    reviews: 180
  },
  {
    id: 3,
    icon: '🪟',
    nome: 'Limpeza de Vidros',
    descricao: 'Limpeza especializada de vidros',
    preco: 'A partir de R$ 100',
    rating: 4.7,
    reviews: 120
  },
  {
    id: 4,
    icon: '🛋️',
    nome: 'Limpeza de Móveis',
    descricao: 'Limpeza profunda de sofás e cadeiras',
    preco: 'A partir de R$ 180',
    rating: 4.6,
    reviews: 95
  }
];

export default function Servicos() {
  return (
    <>
      <Head><title>Nossos Serviços</title></Head>

      <div className="container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold mb-4">Nossos Serviços</h1>
        <p className="text-xl text-gray-600 mb-12">
          Escolha o serviço que melhor se adapta às suas necessidades
        </p>

        <CardGrid>
          {servicos.map(servico => (
            <div key={servico.id} className="card hover:shadow-lg transition">
              <div className="text-6xl mb-4">{servico.icon}</div>
              
              <h3 className="text-2xl font-bold mb-2">{servico.nome}</h3>
              <p className="text-gray-600 mb-4">{servico.descricao}</p>
              
              <div className="flex items-center gap-2 mb-4">
                <RatingStars rating={servico.rating} maxRating={5} />
                <span className="text-sm text-gray-500">
                  ({servico.reviews} avaliações)
                </span>
              </div>

              <p className="text-xl font-bold text-purple-600 mb-6">
                {servico.preco}
              </p>

              <button className="btn-primary w-full">
                Agendar Agora
              </button>
            </div>
          ))}
        </CardGrid>
      </div>
    </>
  );
}
```

---

## 💡 Dicas Rápidas

### Usar Notifications
```javascript
const { success, error, warning } = useNotification();

success('Tudo certo!');
error('Algo deu errado');
warning('Cuidado com isso');
```

### Espaçamento (use classes Tailwind)
```jsx
<div className="p-4 md:p-6 lg:p-8">
  Conteúdo
</div>
```

### Centralizar Container
```jsx
<div className="container mx-auto">
  Conteúdo amplo
</div>
```

### Loading em Botão
```jsx
<button disabled={isLoading} className="btn-primary flex gap-2">
  {isLoading ? <Spinner size="sm" /> : null}
  {isLoading ? 'Salvando...' : 'Salvar'}
</button>
```

---

**Todos os ejemplos acima estão prontos para usar! 🎉**
Copy & paste no seu projeto e adapte os dados.

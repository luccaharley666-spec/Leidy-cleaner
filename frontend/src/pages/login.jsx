'use client';

import { useState, useContext } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import { ThemeContext } from '../context/ThemeContext'

export default function Login() {
  const router = useRouter()
  const { theme } = useContext(ThemeContext)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const getBackgroundClasses = () => {
    switch(theme) {
      case 'light':
        return 'bg-gradient-to-br from-green-50 to-emerald-50'
      case 'dark':
        return 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950'
      case 'high-contrast':
        return 'bg-black'
      case 'pastel':
        return 'bg-gradient-to-br from-purple-50 to-pink-50'
      case 'cyberpunk':
        return 'bg-gradient-to-br from-black via-gray-900 to-black'
      case 'forest':
        return 'bg-gradient-to-br from-green-900 to-green-800'
      default:
        return 'bg-white dark:bg-gray-950'
    }
  }

  const getCardClasses = () => {
    switch(theme) {
      case 'light':
        return 'bg-white border border-green-200 shadow-xl'
      case 'dark':
        return 'bg-gray-900 border border-gray-700 shadow-2xl'
      case 'high-contrast':
        return 'bg-white border-4 border-white'
      case 'pastel':
        return 'bg-white border border-purple-200 shadow-xl'
      case 'cyberpunk':
        return 'bg-gray-900 border-2 border-cyan-500 shadow-lg shadow-cyan-500/50'
      case 'forest':
        return 'bg-green-900/50 border border-green-700 shadow-xl'
      default:
        return 'bg-white dark:bg-gray-900'
    }
  }

  const getInputClasses = () => {
    switch(theme) {
      case 'light':
        return 'bg-gray-50 border-2 border-green-200 focus:border-green-500 text-gray-900'
      case 'dark':
        return 'bg-gray-800 border-2 border-gray-700 focus:border-green-500 text-white'
      case 'high-contrast':
        return 'bg-white border-4 border-black text-black focus:ring-4 focus:ring-yellow-300'
      case 'pastel':
        return 'bg-pink-50 border-2 border-purple-200 focus:border-purple-500 text-gray-900'
      case 'cyberpunk':
        return 'bg-gray-800 border-2 border-cyan-500 focus:border-pink-500 text-cyan-400'
      case 'forest':
        return 'bg-green-800/50 border-2 border-green-600 focus:border-green-400 text-green-100'
      default:
        return 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white'
    }
  }

  const getButtonClasses = () => {
    switch(theme) {
      case 'light':
        return 'bg-green-600 hover:bg-green-700 text-white'
      case 'dark':
        return 'bg-green-600 hover:bg-green-700 text-white'
      case 'high-contrast':
        return 'bg-white text-black hover:bg-yellow-300 border-4 border-white'
      case 'pastel':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
      case 'cyberpunk':
        return 'bg-cyan-600 hover:bg-cyan-500 text-black border-2 border-cyan-400 shadow-lg shadow-cyan-500/50'
      case 'forest':
        return 'bg-green-600 hover:bg-green-700 text-white border border-green-500'
      default:
        return 'bg-green-600 hover:bg-green-700 text-white'
    }
  }

  const getTextColorClasses = () => {
    switch(theme) {
      case 'light':
        return 'text-gray-900'
      case 'dark':
        return 'text-white'
      case 'high-contrast':
        return 'text-black'
      case 'pastel':
        return 'text-gray-800'
      case 'cyberpunk':
        return 'text-cyan-400'
      case 'forest':
        return 'text-green-50'
      default:
        return 'text-gray-900 dark:text-white'
    }
  }

  const getSubTextColorClasses = () => {
    switch(theme) {
      case 'light':
        return 'text-gray-600'
      case 'dark':
        return 'text-gray-400'
      case 'high-contrast':
        return 'text-black'
      case 'pastel':
        return 'text-purple-600'
      case 'cyberpunk':
        return 'text-gray-400'
      case 'forest':
        return 'text-green-200'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Preencha email e senha')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao fazer login')
        setLoading(false)
        return
      }

      // Salvar tokens
      localStorage.setItem('auth_token', data.tokens?.accessToken || data.data?.token)
      localStorage.setItem('user_id', data.user?.id)
      localStorage.setItem('user_role', data.user?.role)
      localStorage.setItem('user_name', data.user?.name)

      // Redirecionar por role
      if (data.user?.role === 'admin') {
        router.push('/admin/dashboard')
      } else if (data.user?.role === 'staff') {
        router.push('/staff/schedule')
      } else {
        router.push('/minha-conta')
      }
    } catch (err) {
      setError('Erro de conexão com servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Login - Leidy Cleaner</title>
        <meta name="description" content="Faça login na sua conta Leidy Cleaner" />
      </Head>

      <div className={`min-h-screen flex flex-col ${getBackgroundClasses()}`}>
        <Header />

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className={`w-full max-w-md ${getCardClasses()} rounded-2xl px-8 py-10`}>
            <h1 className={`text-3xl font-black text-center mb-1 ${getTextColorClasses()}`}>
              🏠 Bem-vindo
            </h1>
            <p className={`text-center ${getSubTextColorClasses()} mb-8`}>
              Faça login para agendar serviços
            </p>

            {/* Error Message */}
            {error && (
              <div className={`p-4 rounded-lg mb-4 text-sm font-semibold ${
                theme === 'high-contrast' ? 'bg-white text-black border-4 border-black' :
                theme === 'pastel' ? 'bg-red-100 text-red-700 border border-red-200' :
                'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  theme === 'high-contrast' ? 'text-black' :
                  theme === 'pastel' ? 'text-purple-700' :
                  'text-gray-700 dark:text-gray-300'
                }`}>
                  📧 Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className={`w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2 ${getInputClasses()}`}
                  required
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  theme === 'high-contrast' ? 'text-black' :
                  theme === 'pastel' ? 'text-purple-700' :
                  'text-gray-700 dark:text-gray-300'
                }`}>
                  🔒 Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2 pr-12 ${getInputClasses()}`}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 text-xl transition-opacity ${
                      theme === 'high-contrast' ? 'text-black' :
                      theme === 'pastel' ? 'text-purple-700' :
                      'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-bold text-lg transition-all duration-300 ${getButtonClasses()} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? '⏳ Entrando...' : '✅ Entrar'}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className={`mt-8 p-4 rounded-lg text-sm ${
              theme === 'high-contrast' ? 'bg-white border-4 border-black text-black' :
              theme === 'pastel' ? 'bg-purple-100 border border-purple-200 text-purple-700' :
              'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}>
              <p className="font-semibold mb-2">📝 Contas de Teste:</p>
              <p>👤 Cliente: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">cliente@leidy.com</code></p>
              <p>👷 Profissional: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">maria@leidy.com</code></p>
              <p>👨‍💼 Admin: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">fransmalifra@gmail.com</code></p>
              <p className="mt-2">🔑 Senha: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">admin123</code> (ou staff123, client123)</p>
            </div>

            {/* Footer Links */}
            <div className={`mt-8 text-center text-sm ${
              theme === 'high-contrast' ? 'text-black' :
              theme === 'pastel' ? 'text-purple-700' :
              'text-gray-600 dark:text-gray-400'
            }`}>
              <p>
                Não tem conta?{' '}
                <Link href="/register" className={`font-bold transition-colors ${
                  theme === 'high-contrast' ? 'text-black hover:text-yellow-600' :
                  theme === 'pastel' ? 'text-purple-600 hover:text-purple-700' :
                  'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300'
                }`}>
                  Criar conta
                </Link>
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}

import { useState } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Header, Footer } from '../components/Layout'

export default function Login() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Preencha email e senha')
      return
    }

    setLoading(true)
    try {
      const { data } = await axios.post('/api/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      toast.success('Login realizado com sucesso!')
      router.push('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao fazer login')
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

      <Header />

      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-primary-900 dark:to-primary-800 pt-20 pb-12">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white dark:bg-primary-800 rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-black text-center mb-2 text-gray-900 dark:text-white">
              Bem-vindo
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
              Faça login para agendar serviços
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-primary-700 dark:bg-primary-900 dark:text-white focus:[REDACTED_TOKEN] focus:ring-2 focus:ring-secondary-500/20"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-primary-700 dark:bg-primary-900 dark:text-white focus:[REDACTED_TOKEN] focus:ring-2 focus:ring-secondary-500/20"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-primary-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-primary-800 text-gray-600 dark:text-gray-400">
                  Ou
                </span>
              </div>
            </div>

            <p className="text-center text-gray-600 dark:text-gray-400">
              Não tem conta?{' '}
              <Link href="/register" className="text-secondary-600 dark:text-secondary-400 hover:underline font-bold">
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

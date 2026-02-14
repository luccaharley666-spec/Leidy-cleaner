import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { useRouter as nextUseRouter } from 'next/router'

// Safe router helper: when tests don't provide Next Router, return a noop fallback
function safeUseRouter() {
  try {
    return nextUseRouter()
  } catch (e) {
    return { push: () => Promise.resolve(), prefetch: () => Promise.resolve() }
  }
}

export default function SiteSearch({ className = '' }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const router = safeUseRouter()

  const onSubmit = (e) => {
    e && e.preventDefault()
    if (!q || q.trim().length === 0) {
      setOpen(false)
      return
    }
    router.push(`/search?q=${encodeURIComponent(q.trim())}`)
    setOpen(false)
  }

  return (
    <>
      {/* Desktop inline search - Novo Design Moderno */}
      <form onSubmit={onSubmit} className={`relative hidden md:flex items-center ${className}`}>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <img src="/api/external-image/7509de66-b366-439d-a86a-13ea31ebe121.jpeg" alt="Leidy Logo" className="search-logo" />
        </div>
        <input
          aria-label="Buscar no site"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar serviços..."
          className="pl-12 pr-12 py-3 rounded-2xl border-2 border-violet-200 bg-gradient-to-r from-white to-violet-50 text-sm w-80 font-medium focus:ring-0 focus:border-violet-500 focus:outline-none transition-all hover:border-violet-300 dark:bg-slate-800 dark:border-slate-600 search-input"
        />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl">
          <Search className="w-5 h-5" />
        </button>
      </form>

      {/* Mobile button + modal */}
      <div className="md:hidden">
        <button onClick={() => setOpen(true)} aria-label="Abrir busca" className="p-2 rounded-xl hover:bg-violet-100 dark:hover:bg-slate-700 transition-colors">
          <Search className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        </button>

        {open && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start pt-24 px-4">
            <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl">
              <form onSubmit={onSubmit} className="flex items-center gap-3 mb-4">
                <img src="/api/external-image/7509de66-b366-439d-a86a-13ea31ebe121.jpeg" alt="Leidy Logo" className="w-8 h-8 rounded-full search-logo" />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar serviços, dúvidas..."
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-violet-200 bg-gradient-to-r from-white to-violet-50 text-sm focus:ring-0 focus:border-violet-500 focus:outline-none transition-all dark:bg-slate-800 dark:border-slate-600 search-input"
                />
                <button type="button" onClick={() => { setQ(''); setOpen(false) }} className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition">✕</button>
              </form>
              <div className="mt-3 text-xs text-violet-600 font-medium">🔍 Busque por: faxina, preço, residencial...</div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

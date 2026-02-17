import React, { useState } from 'react'

/**
 * Advanced FAQ with Search
 */
export default function AdvancedFAQ() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedId, setExpandedId] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const faqs = [
    {
      id: 1,
      category: 'general',
      question: 'Como funciona o agendamento?',
      answer: 'O agendamento é simples: escolha o serviço, data e horário. Você receberá confirmação instantânea por email e SMS. Um dia antes, reconfirmaremos o agendamento.'
    },
    {
      id: 2,
      category: 'general',
      question: 'Qual é o prazo de resposta?',
      answer: 'Respondemos em até 2 horas úteis. Para urgências, use o suporte via WhatsApp disponível 24/7.'
    },
    {
      id: 3,
      category: 'pricing',
      question: 'Como são calculados os preços?',
      answer: 'Baseado em: tipo de serviço, área em m², nível de sujeira, e acessórios solicitados. Você recebe orçamento sem compromisso.'
    },
    {
      id: 4,
      category: 'pricing',
      question: 'Há taxa de cancelamento?',
      answer: 'Cancelamento com 48h de antecedência é grátis. Dentro de 48h, cobra-se 25% do valor.'
    },
    {
      id: 5,
      category: 'services',
      question: 'Quais produtos vocês usam?',
      answer: 'Usamos exclusivamente produtos biodegradáveis e eco-friendly. Avisamos antecipadamente se você tiver alergias.'
    },
    {
      id: 6,
      category: 'services',
      question: 'Vocês fazem limpeza profunda?',
      answer: 'Sim! Nossa limpeza profunda inclui: sofás, estofados, carpetes, ar-condicionado, janelas e cozinha completa.'
    },
    {
      id: 7,
      category: 'safety',
      question: 'Como garantem a segurança?',
      answer: 'Todos os profissionais têm background check, seguro de responsabilidade civil e são rastreáveis via app.'
    },
    {
      id: 8,
      category: 'safety',
      question: 'E se não ficar satisfeito?',
      answer: 'Oferecemos garantia de satisfação 100%. Se não ficar satisfeito, refazemos gratuitamente.'
    },
    {
      id: 9,
      category: 'payment',
      question: 'Quais são as formas de pagamento?',
      answer: 'Cartão de crédito, PIX, boleto, vale refeição e carnê mensal. Parcelamos em até 3x sem juros.'
    },
    {
      id: 10,
      category: 'payment',
      question: 'Preciso pagar adiantado?',
      answer: 'Não. Você paga após o serviço ser concluído.'
    }
  ]

  const categories = [
    { id: 'all', label: '📋 Todas' },
    { id: 'general', label: '❓ Geral' },
    { id: 'pricing', label: '💰 Preços' },
    { id: 'services', label: '✨ Serviços' },
    { id: 'safety', label: '🔒 Segurança' },
    { id: 'payment', label: '💳 Pagamento' }
  ]

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="w-full py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ❓ Dúvidas Frequentes
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Encontre respostas rápidas para suas perguntas
          </p>

          {/* Search Bar */}
          <div className="relative mb-8 max-w-2xl mx-auto">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <img src="https://leidycleaner.com.br/logo-leidy.png" alt="Leidy Logo" className="w-6 h-6 rounded-full" />
            </div>
            <input
              type="text"
              placeholder="Busque sua dúvida ou tópico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-full border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-lg"
            />
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
              title="Limpar busca"
            >
              ✖
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <button
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between p-6 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <h3 className="text-left text-lg font-semibold text-gray-900 dark:text-white">
                    {faq.question}
                  </h3>
                  <div className={ `text-2xl ${expandedId === faq.id ? 'rotate-180' : '' }`}>
                    ▼
                  </div>
                </button>

                {expandedId === faq.id && (
                  <div className="p-6 bg-gradient-to-r from-purple-50 to-cyan-50 dark:from-purple-900/10 dark:to-cyan-900/10 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Nenhuma pergunta encontrada. Tente outro termo de busca.
              </p>
            </div>
          )}
        </div>

        {/* Still have questions? */}
        <div className="mt-12 p-8 bg-gradient-to-r from-purple-100 to-cyan-100 dark:from-purple-900/20 dark:to-cyan-900/20 rounded-2xl border border-purple-300 dark:border-purple-600/50 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ainda tem dúvidas?
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Entre em contato com nosso suporte disponível 24/7
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-lg font-bold hover:shadow-lg transition-all">
              💬 Live Chat
            </button>
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:shadow-lg transition-all">
              📱 WhatsApp
            </button>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:shadow-lg transition-all">
              ✉️ Email
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'

/**
 * Benefits & Features Grid - Benefícios principais
 */
export default function BenefitsGrid() {
  const benefits = [
    {
      icon: '⭐',
      title: 'Profissionais Verificados',
      desc: 'Todos os profissionais são verificados e passam por background check',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: '🏆',
      title: '4.9 em 500+ Avaliações',
      desc: 'Média de satisfação comprovada de nossos clientes',
      color: 'from-purple-400 to-pink-500'
    },
    {
      icon: '💚',
      title: 'Eco-Friendly',
      desc: 'Utilizamos apenas produtos biodegradáveis e sustentáveis',
      color: 'from-green-400 to-emerald-500'
    },
    {
      icon: '🔒',
      title: 'Seguros e Bonificados',
      desc: 'Todos os profissionais têm seguro e indenização',
      color: 'from-blue-400 to-cyan-500'
    },
    {
      icon: '💰',
      title: 'Preços Transparentes',
      desc: 'Sem taxas ocultas, preço fixo confirmado na reserva',
      color: 'from-emerald-400 to-teal-500'
    },
    {
      icon: '📱',
      title: 'Rastreamento em Tempo Real',
      desc: 'Acompanhe o profissional até sua porta',
      color: 'from-indigo-400 to-purple-500'
    }
  ]

  return (
    <div className="w-full py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ✨ Por Que Escolher Leidy Cleaner?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Serviço premium com as melhores garantias do mercado
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="group relative p-8 rounded-2xl background-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
            >
              {/* Gradient bg on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity}`}></div>

              {/* Icon */}
              <div className="text-5xl mb-4 group-hover:scale-110 [REDACTED_TOKEN]">
                {benefit.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {benefit.desc}
              </p>

              {/* Bottom accent line */}
              <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${benefit.color} w-0 group-hover:w-full rounded-full transition-all duration-500`}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { Leaf, Shield, Clock, BarChart3, Zap, Heart } from 'lucide-react'

export default function FeaturesGridGreen() {
  const features = [
    {
      icon: Leaf,
      title: 'Produtos Eco-Friendly',
      description: 'Apenas produtos biodegradáveis e seguros para sua família e o meio ambiente.',
      color: 'from-primary-500 to-accent-500'
    },
    {
      icon: Shield,
      title: 'Profissionais Verificados',
      description: 'Equipe treinada, background check completo e seguro de responsabilidade.',
      color: 'from-accent-500 to-primary-500'
    },
    {
      icon: Clock,
      title: 'Agendamento Flexível',
      description: 'Disponível 24/7 para se adequar à sua rotina e necessidades especiais.',
      color: 'from-primary-400 to-lime-400'
    },
    {
      icon: BarChart3,
      title: 'Qualidade Garantida',
      description: 'Inspeção pós-limpeza e garantia 100% de satisfação ou refund total.',
      color: 'from-lime-400 to-accent-400'
    },
    {
      icon: Zap,
      title: 'Tecnologia Smart',
      description: 'Rastreamento em tempo real, avalições automáticas e histórico de serviços.',
      color: 'from-accent-400 to-primary-400'
    },
    {
      icon: Heart,
      title: 'Atendimento Premium',
      description: 'Suporte dedicado 24/7 em português via chat, email ou telefone.',
      color: 'from-primary-500 to-lime-500'
    }
  ]

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white via-primary-50 to-white relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 right-20 w-72 h-72 bg-primary-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-10 left-20 w-72 h-72 bg-accent-100 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-600">
              Por Que Somos os Melhores
            </span>
          </h2>
          <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Somos mais que limpeza. Somos compromisso com excelência, sustentabilidade e sua satisfação.
          </p>
        </div>

        {/* Grid de features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-primary-100 hover:border-primary-300 overflow-hidden"
                style={{
                  animationDelay: `${index * 0.1}s` }}
              >
                {/* Background gradient no hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                {/* Ícone com gradiente */}
                <div className={`relative inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl mb-6 group-hover:scale-110 duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Conteúdo */}
                <div className="relative">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Decoração no hover */}
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br from-primary-200 to-accent-200 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              </div>
            )
          })}
        </div>

        {/* CTA rodapé */}
        <div className="text-center mt-16 md:mt-20">
          <p className="text-lg text-neutral-600 mb-8">
            Pronto para experimentar nosso serviço premium?
          </p>
          <div className="inline-flex gap-4">
            <button className="px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
              Agendar Agora
            </button>
            <button className="px-8 py-4 border-2 border-primary-500 text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-all duration-300">
              Mais Informações
            </button>
          </div>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        div.group {
          animation: slideInUp 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  )
}

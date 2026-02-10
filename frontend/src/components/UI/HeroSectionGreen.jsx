import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react'

export default function HeroSectionGreen() {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-100 pt-20 pb-32 md:pt-28 md:pb-40">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Blob verde superior */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        
        {/* Blob teal inferior */}
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob [REDACTED_TOKEN]" />
        
        {/* Linha decorativa */}
        <div className="absolute top-1/3 right-10 w-1 h-40 bg-gradient-to-b from-primary-500 to-transparent opacity-30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Conteúdo esquerdo */}
          <div className="space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-200 rounded-full text-primary-700 font-medium text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Transformar Espaços em Ambientes Impecáveis</span>
            </div>

            {/* Título principal */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500">
                  Limpeza Premium
                </span>
                <br />
                <span className="text-neutral-900">que Transforma</span>
              </h1>
              <p className="text-lg md:text-xl text-neutral-600 leading-relaxed font-light">
                Profissionais certificados, produtos eco-friendly e compromisso com a perfeição. 
                Seu espaço merece um cuidado especial.
              </p>
            </div>

            {/* CTAs principais */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/agendar">
                <a className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group">
                  Agendar Agora
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 [REDACTED_TOKEN]" />
                </a>
              </Link>
              <Link href="#servicos">
                <a className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-primary-500 text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-all duration-300 shadow-md hover:shadow-lg group">
                  Ver Serviços
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 [REDACTED_TOKEN]" />
                </a>
              </Link>
            </div>

            {/* Benefícios rápidos */}
            <div className="space-y-3 pt-6 border-t border-primary-200">
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">Por que nos escolher?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Profissionais Verificados',
                  'Garantia 100%',
                  'Produtos Ecológicos',
                  'Disponibilidade 24h'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-neutral-700">
                    <CheckCircle2 className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Imagem direita com efeito flutuante */}
          <div className="relative h-96 md:h-full min-h-96 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {/* Card decorativo */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-accent-50 rounded-3xl shadow-2xl overflow-hidden">
              {/* Imagem ou placeholder */}
              <div className="relative w-full h-full bg-gradient-to-br from-primary-200 via-primary-100 to-accent-100 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-16 h-16 text-primary-500 mx-auto mb-4 animate-pulse-green" />
                  <p className="text-primary-700 font-semibold">Limpeza que Brilha</p>
                </div>
              </div>
            </div>

            {/* Badges flutuantes */}
            <div className="absolute -left-4 -bottom-4 bg-white rounded-2xl shadow-xl p-4 animate-float" style={{ animationDelay: '1s' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold">
                  4.9
                </div>
                <div className="text-sm">
                  <p className="font-bold text-neutral-900">★★★★★</p>
                  <p className="text-neutral-600 text-xs">500+ clientes</p>
                </div>
              </div>
            </div>

            {/* Badge de promoção */}
            <div 
              className="absolute top-6 -right-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-2 rounded-full font-semibold shadow-lg animate-float text-sm"
              style={{ animationDelay: '2s' }}
            >
              ✨ 20% OFF Primeira Limpeza
            </div>
          </div>
        </div>

        {/* Stats scroll reveal */}
        <div className="grid grid-cols-3 gap-6 mt-20 pt-12 border-t border-primary-200">
          {[
            { number: '2500+', label: 'Limpezas Realizadas' },
            { number: '500+', label: 'Clientes Felizes' },
            { number: '98%', label: 'Taxa de Satisfação' }
          ].map((stat, index) => (
            <div 
              key={index} 
              className="text-center animate-fade-in"
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <p className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-600">
                {stat.number}
              </p>
              <p className="text-neutral-600 font-medium text-sm md:text-base mt-2">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CSS para animações custom */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .[REDACTED_TOKEN] {
          animation-delay: 2s;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slideUp 0.8s ease-out forwards;
        }
      `}</style>
    </section>
  )
}

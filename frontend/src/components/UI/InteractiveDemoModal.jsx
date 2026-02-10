/**
 * Interactive Demo Modal Component
 * Showcase para funcionalidades principais com swiper
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function [REDACTED_TOKEN]({ isOpen, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      icon: '📅',
      title: 'Agendamento Simples',
      desc: 'Reserve em minutos com interface intuitiva e confirmação instantânea',
      features: ['4 passos simples', 'Confirmação por email', 'Lembretes automáticos']
    },
    {
      icon: '💳',
      title: 'Pagamentos Seguros',
      desc: 'Múltiplos métodos incluindo PIX, cartão e transferência',
      features: ['PIX Instantâneo', 'Stripe Seguro', 'Parcelamento disponível']
    },
    {
      icon: '⭐',
      title: 'Avaliações Verificadas',
      desc: 'Veja opiniões reais de clientes que já usaram nossos serviços',
      features: ['500+ Avaliações', 'Rating 4.9/5', 'Fotos antes/depois']
    },
    {
      icon: '🎁',
      title: 'Programa de Fidelidade',
      desc: 'Ganhe pontos em cada serviço e troque por descontos exclusivos',
      features: ['1 ponto = R$1', 'Cupons especiais', 'Acesso VIP']
    }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 px-4"
          >
            <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-8 flex items-center justify-between">
                <h2 className="text-3xl font-bold">Veja Como Funciona</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="text-2xl hover:text-gray-200 transition"
                >
                  ✕
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-8">
                <AnimatePresence>
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                  >
                    <div className="text-7xl mb-6">{slides[currentSlide].icon}</div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      {slides[currentSlide].title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                      {slides[currentSlide].desc}
                    </p>

                    {/* Features */}
                    <div className="space-y-2 mb-8">
                      {slides[currentSlide].features.map((feature, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300"
                        >
                          <span className="text-blue-600 font-bold">✓</span>
                          {feature}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between gap-4 mb-8">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={prevSlide}
                    className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-slate-600 transition"
                  >
                    ←
                  </motion.button>

                  {/* Dots */}
                  <div className="flex gap-2">
                    {slides.map((_, i) => (
                      <motion.div
                        key={i}
                        className={`h-2 rounded-full transition ${
                          i === currentSlide ? 'bg-blue-600 w-8' : 'bg-gray-300 dark:bg-slate-600 w-2'
                        }`}
                        onClick={() => setCurrentSlide(i)}
                      />
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={nextSlide}
                    className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-slate-600 transition"
                  >
                    →
                  </motion.button>
                </div>

                {/* CTA */}
                <Link href="/agendar">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-4 rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>📅</span>
                    Agendar Agora
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

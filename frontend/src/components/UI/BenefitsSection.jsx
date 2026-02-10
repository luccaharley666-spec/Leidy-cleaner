/**
 * Benefits Section with Animated Icons
 * Showcases os principais benefícios da plataforma
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'

export default function BenefitsSection() {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const benefits = [
    {
      id: 1,
      icon: '⚡',
      title: 'Agendamento Rápido',
      description: 'Reserve seu serviço em menos de 2 minutos com nossa plataforma intuitiva',
      color: 'from-yellow-400 to-orange-500',
      stats: '2 min'
    },
    {
      id: 2,
      icon: '🔒',
      title: 'Segurança Garantida',
      description: 'Todos os prestadores são verificados, com avaliações e histórico transparente',
      color: 'from-green-400 to-emerald-500',
      stats: '100%'
    },
    {
      id: 3,
      icon: '💰',
      title: 'Melhor Preço',
      description: 'Sem intermediários, O menor valor entre limpadores profissionais',
      color: 'from-blue-400 to-indigo-500',
      stats: '-35%'
    },
    {
      id: 4,
      icon: '📱',
      title: 'Acompanhamento Real',
      description: 'Rastreia o profissional em tempo real e receba atualizações do serviço',
      color: 'from-pink-400 to-rose-500',
      stats: 'Ao vivo'
    },
    {
      id: 5,
      icon: '⭐',
      title: 'Avaliações Honestas',
      description: 'Veja avaliações verificadas de clientes reais que contrataram o serviço',
      color: 'from-purple-400 to-violet-500',
      stats: '4.9★'
    },
    {
      id: 6,
      icon: '🤝',
      title: 'Suporte 24/7',
      description: 'Equipe disponível a qualquer hora para resolver seus problemas',
      color: 'from-cyan-400 to-blue-500',
      stats: 'Sempre'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  return (
    <section className="py-20 sm:py-32 bg-gradient-to-br from-white via-blue-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob [REDACTED_TOKEN]"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2 rounded-full font-semibold mb-6">
            ✨ Por que nos escolher
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Benefícios que fazem a diferença
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Somos mais que uma plataforma: somos um compromisso com qualidade, segurança e confiança
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.id}
              variants={itemVariants}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group relative"
            >
              {/* Card with Gradient Border Effect */}
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative h-full bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-200 dark:border-slate-700 overflow-hidden transition-all duration-300"
              >
                {/* Animated Gradient Border on Hover */}
                {hoveredIndex === index && (
                  <motion.div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${benefit.color} opacity-5`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}

                {/* Icon Container */}
                <motion.div
                  animate={hoveredIndex === index ? { scale: 1.2, rotate: 10 } : { scale: 1, rotate: 0 }}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-6 bg-gradient-to-br ${benefit.color} shadow-lg`}
                >
                  {benefit.icon}
                </motion.div>

                {/* Stats Badge */}
                <motion.div
                  animate={hoveredIndex === index ? { scale: 1.1 } : { scale: 1 }}
                  className={`absolute top-8 right-8 w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm text-white bg-gradient-to-br ${benefit.color}`}
                >
                  {benefit.stats}
                </motion.div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  {benefit.description}
                </p>

                {/* Learn More Link */}
                <motion.div
                  animate={hoveredIndex === index ? { x: 8 } : { x: 0 }}
                  className={`flex items-center gap-2 font-semibold bg-gradient-to-r ${benefit.color} text-transparent bg-clip-text`}
                >
                  <span>Saiba mais</span>
                  <span>→</span>
                </motion.div>

                {/* Floating Particles Effect */}
                {hoveredIndex === index && (
                  <>
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className={`absolute w-2 h-2 rounded-full bg-gradient-to-br ${benefit.color}`}
                        initial={{
                          x: Math.random() * 100,
                          y: Math.random() * 100 + 50,
                          opacity: 1
                        }}
                        animate={{
                          x: Math.random() * 200,
                          y: -100,
                          opacity: 0
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity
                        }}
                      />
                    ))}
                  </>
                )}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Pronto para experimentar o melhor serviço de limpeza?
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)' }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500 text-white font-bold py-5 px-12 rounded-xl hover:shadow-xl transition"
          >
            <span className="flex items-center gap-3">
              <span>🚀</span>
              <span>Comece Sua Jornada Agora</span>
              <span>→</span>
            </span>
          </motion.button>
        </motion.div>
      </div>

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
      `}</style>
    </section>
  )
}

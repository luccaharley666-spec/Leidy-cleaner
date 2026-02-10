/**
 * Metrics Dashboard Component
 * Apresenta métricas impressionantes com contadores animados
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const AnimatedCounter = ({ target, duration = 2 }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const increment = target / (duration * 60) // 60 frames per second
    let animationFrameId

    const updateCount = () => {
      start += increment
      if (start < target) {
        setCount(Math.floor(start))
        animationFrameId = [REDACTED_TOKEN](updateCount)
      } else {
        setCount(target)
      }
    }

    animationFrameId = [REDACTED_TOKEN](updateCount)
    return () => [REDACTED_TOKEN](animationFrameId)
  }, [target, duration])

  return count
}

export default function MetricsDashboard() {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const metrics = [
    {
      id: 1,
      icon: '😊',
      label: 'Clientes Satisfeitos',
      value: 2500,
      target: 2500,
      suffix: '+',
      color: 'from-blue-500 to-blue-600',
      description: 'Clientes que confiam em nossos serviços',
      trend: '↑ 45% este ano'
    },
    {
      id: 2,
      icon: '⭐',
      label: 'Avaliação Média',
      value: 4.9,
      target: 4.9,
      suffix: '★',
      color: 'from-yellow-500 to-yellow-600',
      description: 'Baseado em 500+ avaliações verificadas',
      trend: 'Consistente'
    },
    {
      id: 3,
      icon: '👥',
      label: 'Profissionais Verificados',
      value: 50,
      target: 50,
      suffix: '+',
      color: 'from-green-500 to-green-600',
      description: 'Profissionais treinados e certificados',
      trend: '↑ 10 novos este mês'
    },
    {
      id: 4,
      icon: '🏆',
      label: 'Serviços Realizados',
      value: 10000,
      target: 10000,
      suffix: '+',
      color: 'from-purple-500 to-purple-600',
      description: 'Horas de limpeza profissional',
      trend: '↑ 500 este mês'
    },
    {
      id: 5,
      icon: '⏱️',
      label: 'Tempo Médio de Resposta',
      value: 2,
      target: 2,
      suffix: 'h',
      color: 'from-pink-500 to-pink-600',
      description: 'Resposta rápida para seus agendamentos',
      trend: '24h de disponibilidade'
    },
    {
      id: 6,
      icon: '🌍',
      label: 'Áreas Atendidas',
      value: 25,
      target: 25,
      suffix: '+',
      color: 'from-cyan-500 to-cyan-600',
      description: 'Bairros em Porto Alegre e região',
      trend: '↑ Expandindo diariamente'
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
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 }
    }
  }

  return (
    <section className="py-20 sm:py-32 bg-gradient-to-b from-white via-blue-50 to-white dark:from-slate-900 dark:via-blue-900 dark:to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-200 dark:bg-cyan-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2 rounded-full font-semibold mb-6">
            📊 Nossos Números
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Crescimento e Impacto
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Dados que comprovam nossa qualidade e confiabilidade no mercado
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              variants={itemVariants}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group"
            >
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                className={`relative h-full bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-200 dark:border-slate-700 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300`}
              >
                {/* Gradient Background on Hover */}
                {hoveredIndex === index && (
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                  />
                )}

                {/* Top Icon and Gradient Badge */}
                <div className="relative z-10 flex items-center justify-between mb-6">
                  <motion.div
                    animate={hoveredIndex === index ? { scale: 1.2, rotate: 10 } : { scale: 1, rotate: 0 }}
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl bg-gradient-to-br ${metric.color} shadow-lg`}
                  >
                    {metric.icon}
                  </motion.div>
                  <motion.div
                    animate={hoveredIndex === index ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
                    className={`text-sm font-bold px-3 py-1 rounded-full text-white bg-gradient-to-r ${metric.color}`}
                  >
                    {metric.trend}
                  </motion.div>
                </div>

                {/* Metric Value */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="mb-4"
                >
                  <div className={`text-5xl font-bold bg-gradient-to-r ${metric.color} text-transparent bg-clip-text`}>
                    {metric.value === 2.9 || metric.value === 2 ? (
                      <span>{metric.value.toFixed(1)}</span>
                    ) : (
                      <AnimatedCounter target={metric.target} />
                    )}
                    <span className={`bg-gradient-to-r ${metric.color} text-transparent bg-clip-text`}>
                      {metric.suffix}
                    </span>
                  </div>
                </motion.div>

                {/* Label */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {metric.label}
                </h3>

                {/* Description */}
                <motion.p
                  animate={hoveredIndex === index ? { opacity: 1, height: 'auto' } : { opacity: 0.6, height: 'auto' }}
                  className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed"
                >
                  {metric.description}
                </motion.p>

                {/* Floating Particles */}
                {hoveredIndex === index && (
                  <>
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        className={`absolute w-2 h-2 rounded-full bg-gradient-to-br ${metric.color}`}
                        initial={{
                          x: Math.random() * 100,
                          y: Math.random() * 100 + 50,
                          opacity: 1
                        }}
                        animate={{
                          x: Math.random() * 300,
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

        {/* Bottom Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden"
        >
          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-5xl font-bold mb-2">99%</div>
              <div className="text-white/90 font-semibold">Taxa de Satisfação</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-5xl font-bold mb-2">24/7</div>
              <div className="text-white/90 font-semibold">Suporte Disponível</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-5xl font-bold mb-2">0</div>
              <div className="text-white/90 font-semibold">Reclamações Sem Resolução</div>
            </motion.div>
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-blue-600 font-bold py-4 px-12 rounded-xl hover:bg-gray-100 transition hover:shadow-xl"
            >
              <span className="flex items-center justify-center gap-3">
                <span>🚀</span>
                <span>Faça Parte Dessa História de Sucesso</span>
                <span>→</span>
              </span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const CounterNumber = ({ target, unit = '', duration = 2 }) => { const [count, setCount] = useState(0)
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true) }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    const increment = target / (duration * 60)
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, 1000 / 60)

    return () => clearInterval(timer)
  }, [isVisible, target, duration])

  return (
    <div ref={ref} className="text-center">
      <motion.div
        className="text-5xl sm:text-6xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text"
        initial={{ scale: 0 }}
        animate={isVisible ? { scale: 1 } : {}}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        {count}
        <span className="text-2xl text-blue-600">{unit}</span>
      </motion.div>
    </div>
  )
}

export const StatsSection = () => {
  const stats = [
    {
      number: 500,
      label: 'Clientes Satisfeitos',
      icon: '👥',
      description: 'Famílias e empresas em Porto Alegre'
    },
    {
      number: 10,
      label: 'Anos de Experiência',
      icon: '📅',
      unit: '+',
      description: 'Confiança desde o início'
    },
    {
      number: 4.9,
      label: 'Rating Médio',
      icon: '⭐',
      unit: '/5',
      description: '500+ avaliações verificadas'
    },
    {
      number: 100,
      label: 'Satisfação Garantida',
      icon: '✅',
      unit: '%',
      description: 'Ou devolvemos seu dinheiro'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  }

  return (
    <section className="py-20 sm:py-32 bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-slate-900 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Números que Falam
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Veja por que somos a escolha número 1 em limpeza profissional em Porto Alegre
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-slate-700 text-center relative overflow-hidden"
            >
              
              {/* Background Animation */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10"
                animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                transition={{ duration: 5, repeat: Infinity }}
              />

              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <motion.div
                  className="text-5xl mb-4"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  {stat.icon}
                </motion.div>

                {/* Number with Counter */}
                <div className="mb-4">
                  <CounterNumber target={stat.number} unit={stat.unit || ''} />
                </div>

                {/* Label */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.label}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {stat.description}
                </p>
              </div>

              {/* Decorative border animation */}
              <motion.div
                className="absolute inset-0 rounded-2xl border border-blue-600 opacity-0 pointer-events-none"
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Trust Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-700 dark:text-gray-300">
            <span className="font-bold text-blue-600">Certificado de Qualidade</span> • 
            <span className="font-bold ml-2">Eco-Friendly Approved</span> • 
            <span className="font-bold ml-2">100% Recomendável</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default StatsSection

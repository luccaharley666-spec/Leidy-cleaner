import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from './Button'

export const ServiceCard = ({
  title,
  description,
  icon: Icon,
  price,
  basePrice,
  badge,
  link = '/agendar'
}) => { const [displayPrice, setDisplayPrice] = useState(basePrice)
  const [isHovered, setIsHovered] = useState(false)

  // Animar número do preço ao renderizar
  useEffect(() => {
    if (!isHovered) {
      const start = displayPrice
      const end = basePrice
      const duration = 500
      let startTime = null

      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime
        const progress = (currentTime - startTime) / duration
        if (progress < 1) {
          setDisplayPrice(Math.floor(start + (end - start) * progress))
         (animate) } else {
          setDisplayPrice(end)
        }
      }
     (animate)
    }
  }, [basePrice])

  const cardVariants = {
    rest: { y: 0, scale: 1 },
    hover: { y: -12, scale: 1.02 }
  }

  const iconVariants = {
    rest: { rotate: 0, scale: 1 },
    hover: { rotate: 8, scale: 1.1 }
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="h-full"
    >
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col border border-gray-100 dark:border-slate-700">
        
        {/* Gradient Background on Hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ zIndex: -1 }}
        />

        {/* Badge */}
        {badge && (
          <motion.div
            className="absolute top-4 right-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <span className="inline-block bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              {badge}
            </span>
          </motion.div>
        )}

        {/* Icon */}
        <motion.div
          variants={iconVariants}
          className="text-6xl mb-4"
        >
          {Icon ? <Icon size={64} className="text-blue-600" /> : '⚡'}
        </motion.div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow">
          {description}
        </p>

        {/* Price */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              R$ {displayPrice}
            </span>
            <span className="text-gray-500 text-sm">/hora</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            + deslocamento e materiais conforme necessário
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
          <Link href={link} className="flex-1">
            <Button variant="primary" size="md" fullWidth>
              Agendar
            </Button>
          </Link>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-3 rounded-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 font-semibold transition-colors"
          >
            Detalhes
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default ServiceCard

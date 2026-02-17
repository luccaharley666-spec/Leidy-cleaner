/**
 * CTA Newsletter Component
 * Seção interativa para captura de emails e newsletter
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function CTANewsletter() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simular envio
    setTimeout(() => {
      setIsSubmitted(true)
      setIsLoading(false)
      setEmail('')
      
      // Resetar após 3 segundos
      setTimeout(() => setIsSubmitted(false), 3000)
    }, 1500)
  }

  const features = [
    { icon: '🎁', text: '10% desconto na primeira limpeza' },
    { icon: '📧', text: 'Dicas exclusivas sobre limpeza' },
    { icon: '⚡', text: 'Ofertas e promoções especiais' },
    { icon: '📢', text: 'Atualizações de novos serviços' }
  ]

  return (
    <section className="py-20 sm:py-32 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 dark:from-blue-900 dark:via-cyan-900 dark:to-blue-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div 
        className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        animate={{ y: [0, 30, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div 
        className="absolute top-1/2 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl"
        animate={{ x: [0, 20, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl font-bold mb-6 leading-tight"
            >
              Receba as Melhores<br />
              <span className="text-white/90">Ofertas e Dicas Exclusivas</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-xl text-white/80 mb-8 leading-relaxed"
            >
              Inscreva-se na nossa newsletter e receba 10% de desconto na sua primeira limpeza, além de dicas profissionais sobre limpeza, organização e muito mais.
            </motion.p>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-3xl">{feature.icon}</span>
                  <span className="text-lg font-semibold text-white/90">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="mt-8 flex items-center gap-2 text-white/80 text-sm"
            >
              <span>🔒</span>
              <span>Seus dados estão 100% seguros. Cancelar inscrição a qualquer momento.</span>
            </motion.div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <motion.div
              animate={isSubmitted ? { scale: [1, 1.02, 1] } : {}}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
            >
              {/* Animated Background Gradient */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 opacity-0"
                animate={isSubmitted ? { opacity: [0, 0.5, 0] } : {}}
              />

              <div className="relative z-10">
                {!isSubmitted ? (
                  <>
                    <motion.h3
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4"
                    >
                      Inscreva-se Agora
                    </motion.h3>

                    <motion.p
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                      className="text-gray-600 dark:text-gray-400 mb-8"
                    >
                      Junte-se a mais de 1000 pessoas que recebem nossas melhores dicas
                    </motion.p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Email Input */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                      >
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seu@email.com"
                          required
                          className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white  focus:outline-none focus:border-blue-500 dark:focus:border-cyan-500 transition"
                        />
                      </motion.div>

                      {/* Subscribe Button */}
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoading}
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition disabled:opacity-70"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              ⚙️
                            </motion.span>
                            Inscrevendo...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <span>✨</span>
                            <span>Receber Desconto de 10%</span>
                            <span>→</span>
                          </span>
                        )}
                      </motion.button>

                      {/* Terms */}
                      <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 }}
                        className="text-xs text-gray-500 dark:text-gray-400 text-center"
                      >
                        Ao inscrever-se, você concorda com nossa{' '}
                        <Link href="/privacy" className="text-blue-600 hover:underline cursor-pointer">
                          Política de Privacidade
                        </Link>
                      </motion.p>
                    </form>

                    {/* Social Proof */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.7 }}
                      className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-700"
                    >
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
                        Confie em milhares de clientes satisfeitos
                      </p>
                      <div className="flex flex-wrap justify-center gap-3">
                        {[
                          { icon: '⭐', text: '4.9★' },
                          { icon: '👥', text: '2500+ clientes' },
                          { icon: '✅', text: '99% satisfeito' }
                        ].map((item, i) => (
                          <motion.div
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 px-4 py-2 rounded-lg"
                          >
                            <span>{item.icon}</span>
                            <span className="font-semibold text-gray-900 dark:text-white text-sm">
                              {item.text}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5 }}
                      className="text-6xl mb-4"
                    >
                      ✅
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Inscrição confirmada!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Verifique seu email para receber o código de desconto
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Você receberá suas dicas em breve 💌
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

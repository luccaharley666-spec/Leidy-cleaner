import React, { useContext, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import { ThemeContext } from '../context/ThemeContext'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
}

export default function Home() {
  const { theme } = useContext(ThemeContext)
  const [hoveredService, setHoveredService] = useState(null)

  return (
    <>
      <Head>
        <title>Leidy Cleaner - Limpeza Profissional Premium | Qualidade Garantida</title>
        <meta name="description" content="Serviço de limpeza profissional em São Paulo. Equipe qualificada, 100% satisfeito ou dinheiro de volta!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Header />

      <main className="bg-white dark:bg-slate-950">
        
        {/* ==================== HERO SECTION ====================  */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-green-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
          
          {/* Background Pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/10 to-emerald-400/5 rounded-full blur-3xl"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/10 to-green-400/5 rounded-full blur-3xl"
            />
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              
              {/* Left Content */}
              <motion.div variants={itemVariants} className="text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-block mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-700"
                >
                  <span className="text-sm font-semibold text-green-700 dark:text-green-300">✨ Serviço Premium com Garantia</span>
                </motion.div>

                <motion.h1 
                  variants={itemVariants}
                  className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight text-gray-900 dark:text-white"
                >
                  Sua Casa
                  <br />
                  <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-green-400 bg-clip-text text-transparent">
                    Impecável
                  </span>
                </motion.h1>

                <motion.p 
                  variants={itemVariants}
                  className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-xl"
                >
                  Limpeza profissional de qualidade superior. Equipe experiente, preços justos e garantia de satisfação.
                </motion.p>

                <motion.div 
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10"
                >
                  <Link href="/login" className="group">
                    <button className="w-full sm:w-auto px-8 py-4 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                      <span>Agendar Agora</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                  </Link>
                  <Link href="/register" className="group">
                    <button className="w-full sm:w-auto px-8 py-4 rounded-lg border-2 border-green-600 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2">
                      <span>Criar Conta</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                  </Link>
                </motion.div>

                <motion.div 
                  variants={itemVariants}
                  className="flex gap-6 justify-center lg:justify-start text-sm font-semibold text-gray-700 dark:text-gray-300 flex-wrap"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⭐</span>
                    <span>4.9/5 (500+ reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✓</span>
                    <span>100% Garantido</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔒</span>
                    <span>Seguro & Confiável</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Visual */}
              <motion.div 
                variants={itemVariants}
                className="relative hidden lg:block h-[500px]"
              >
                <div className="relative w-full h-full">
                  <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-green-400/20 to-emerald-400/10 rounded-3xl blur-2xl"
                  />
                  <motion.div
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                    className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-tl from-blue-400/20 to-green-400/10 rounded-3xl blur-2xl"
                  />
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="text-7xl opacity-30"
                    >
                      ✨
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ==================== STATS SECTION ====================  */}
        <section className="py-20 px-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800">
          <div className="max-w-6xl mx-auto">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {[
                { number: '500+', label: 'Clientes Satisfeitos' },
                { number: '1000+', label: 'Horas de Trabalho' },
                { number: '100%', label: 'Taxa de Satisfação' },
                { number: '24/7', label: 'Suporte Disponível' }
              ].map((stat, idx) => (
                <motion.div 
                  key={idx}
                  variants={itemVariants}
                  className="text-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="mb-4"
                  >
                    <h3 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {stat.number}
                    </h3>
                  </motion.div>
                  <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ==================== SERVICES SECTION ====================  */}
        <section className="py-20 px-4 bg-white dark:bg-slate-950">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
                Nossos Serviços
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Oferecemos uma variedade completa de soluções de limpeza adaptadas às suas necessidades
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[
                {
                  icon: '🏠',
                  title: 'Limpeza Residencial',
                  desc: 'Limpeza completa e detalhada da sua casa',
                  features: ['Todos os cômodos', 'Pisos e azulejos', 'Limpeza profunda'],
                  color: 'from-green-500 to-emerald-500',
                  price: 'A partir de R$ 150'
                },
                {
                  icon: '🏢',
                  title: 'Limpeza Comercial',
                  desc: 'Manutenção profissional para seu negócio',
                  features: ['Escritórios', 'Lojas', 'Atendimento flexível'],
                  color: 'from-emerald-500 to-green-600',
                  price: 'A partir de R$ 200'
                },
                {
                  icon: '✨',
                  title: 'Limpeza Profunda',
                  desc: 'Higienização intensiva de áreas específicas',
                  features: ['Desinfecção', 'Remoção de odores', 'Resultado garantido'],
                  color: 'from-green-600 to-teal-600',
                  price: 'A partir de R$ 250'
                },
                {
                  icon: '🛋️',
                  title: 'Limpeza de Estofados',
                  desc: 'Limpeza especializada em móveis e tapetes',
                  features: ['Higienização profunda', 'Proteção de tecidos', 'Secagem rápida'],
                  color: 'from-teal-500 to-green-500',
                  price: 'A partir de R$ 180'
                },
                {
                  icon: '🪟',
                  title: 'Limpeza de Vidros',
                  desc: 'Cristais impecáveis para seu imóvel',
                  features: ['Vidros internos/externos', 'Molduras limpas', 'Sem manchas'],
                  color: 'from-green-400 to-emerald-500',
                  price: 'A partir de R$ 120'
                },
                {
                  icon: '🏗️',
                  title: 'Limpeza Pós-Obra',
                  desc: 'Limpeza pesada após reformas e construções',
                  features: ['Remoção de pó', 'Limpeza profunda', 'Acabamento perfeito'],
                  color: 'from-emerald-600 to-teal-600',
                  price: 'A partir de R$ 300'
                }
              ].map((service, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  onMouseEnter={() => setHoveredService(idx)}
                  onMouseLeave={() => setHoveredService(null)}
                  className="group relative"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  
                  <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-slate-800 group-hover:border-green-300 dark:group-hover:border-green-700 transition-all duration-300 h-full flex flex-col">
                    
                    <motion.div
                      animate={hoveredService === idx ? { scale: 1.2, rotate: 10 } : { scale: 1, rotate: 0 }}
                      className="text-5xl mb-4"
                    >
                      {service.icon}
                    </motion.div>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {service.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow">
                      {service.desc}
                    </p>

                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <span className="w-1.5 h-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="pt-4 border-t border-gray-200 dark:border-slate-800">
                      <p className={`font-bold text-lg bg-gradient-to-r ${service.color} bg-clip-text text-transparent mb-4`}>
                        {service.price}
                      </p>
                      <button className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold transform hover:scale-105 transition-all duration-300">
                        Saiba Mais
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ==================== PROCESS SECTION ====================  */}
        <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-green-50 dark:from-slate-900 dark:to-slate-800">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
                Como Funciona
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Processo simples e transparente para contratar nossos serviços
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-4 gap-8 relative"
            >
              {/* Connection Lines */}
              <div className="hidden md:block absolute top-20 left-12 right-12 h-1 bg-gradient-to-r from-green-300 via-emerald-400 to-green-300 dark:from-green-700 dark:via-emerald-600 dark:to-green-700" />

              {[
                { number: 1, icon: '📝', title: 'Cadastre-se', desc: 'Rápido e seguro' },
                { number: 2, icon: '✨', title: 'Escolha', desc: 'Seu serviço perfeito' },
                { number: 3, icon: '📅', title: 'Agende', desc: 'Data e hora' },
                { number: 4, icon: '🎉', title: 'Aproveite', desc: 'Deixe conosco' }
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="relative"
                >
                  <div className="flex flex-col items-center text-center">
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4 relative z-10 shadow-lg"
                    >
                      <span className="text-3xl font-black text-white">
                        {step.number}
                      </span>
                    </motion.div>
                    
                    <div className="text-4xl mb-3">{step.icon}</div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {step.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ==================== TESTIMONIALS SECTION ====================  */}
        <section className="py-20 px-4 bg-white dark:bg-slate-950">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
                Depoimentos
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                O que nossos clientes têm a dizer
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {[
                {
                  name: 'Maria Silva',
                  role: 'Dona de Casa',
                  comment: 'Excelente serviço! Minha casa ficou impecável. A equipe é profissional e educada.',
                  rating: 5
                },
                {
                  name: 'João Santos',
                  role: 'Empresário',
                  comment: 'Fantástico! Nosso escritório nunca ficou tão limpo. Recomendo para todos!',
                  rating: 5
                },
                {
                  name: 'Ana Costa',
                  role: 'Gerente de Loja',
                  comment: 'Profissionais pontuais, discretos e com qualidade incomparável. Muito satisfeita!',
                  rating: 5
                }
              ].map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-8 border border-green-200 dark:border-slate-700"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-xl">⭐</span>
                    ))}
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-6 italic leading-relaxed">
                    "{testimonial.comment}"
                  </p>
                  
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {testimonial.role}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ==================== CTA FINAL ====================  */}
        <section className="py-20 px-4 bg-gradient-to-r from-green-600 via-emerald-600 to-green-500 dark:from-green-700 dark:via-emerald-700 dark:to-green-600">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
              Pronto para uma Limpeza Profissional?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Agende seu serviço agora e ganhe 10% de desconto na primeira limpeza!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <button className="px-10 py-4 rounded-lg bg-white hover:bg-gray-100 text-green-600 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                  Agendar Agora
                </button>
              </Link>
              <Link href="/register">
                <button className="px-10 py-4 rounded-lg border-2 border-white text-white hover:bg-white/10 font-bold text-lg transition-all duration-300">
                  Criação de Conta
                </button>
              </Link>
            </div>
          </motion.div>
        </section>

      </main>

      <Footer />
    </>
  )
}

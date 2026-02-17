'use client';

import React, { useContext, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import Breadcrumb from '../components/UI/Breadcrumb'
import { ThemeContext } from '../context/ThemeContext'

export default function Home() {
  const { theme } = useContext(ThemeContext);

  // Temas personalizados por tipo - COM VERDE COMO COR TEMA
  const themeConfig = {
    light: {
      bg: 'bg-gradient-to-b from-white via-green-50 to-white',
      textPrimary: 'text-gray-950',
      textSecondary: 'text-gray-600',
      accentText: 'text-green-600',
      accentBg: 'bg-green-50',
      card: 'bg-white border border-green-100 hover:border-green-300 shadow-md hover:shadow-xl',
      button: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-green-500/40',
      buttonSecondary: 'border-2 border-green-600 text-green-700 hover:bg-green-50 hover:shadow-lg'
    },
    dark: {
      bg: 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900',
      textPrimary: 'text-white',
      textSecondary: 'text-gray-300',
      accentText: 'text-green-400',
      accentBg: 'bg-slate-800',
      card: 'bg-slate-800 border border-green-900 hover:border-green-700 shadow-lg hover:shadow-green-500/20',
      button: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-green-500/50',
      buttonSecondary: 'border-2 border-green-500 text-green-400 hover:bg-green-900/30 hover:shadow-lg'
    },
    forest: {
      bg: 'bg-gradient-to-b from-green-950 via-green-900 to-green-950',
      textPrimary: 'text-green-50',
      textSecondary: 'text-green-200',
      accentText: 'text-green-300',
      accentBg: 'bg-green-900/50',
      card: 'bg-green-900/40 border border-green-700 hover:border-green-500 shadow-lg hover:shadow-green-500/30',
      button: 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white shadow-lg hover:shadow-green-500/50',
      buttonSecondary: 'border-2 border-green-400 text-green-300 hover:bg-green-800/40 hover:shadow-lg'
    }
  };

  const colors = themeConfig[theme] || themeConfig.light;

  return (
    <>
      <Head>
        <title>Leidy Cleaner - Serviço de Limpeza Premium com Ótimo Preço</title>
        <meta name="description" content="Limpeza profissional por hora. Serviços de qualidade, preços justos e agendamento fácil. Confie na Leidy Cleaner!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="limpeza profissional, serviço de limpeza, faxina, limpeza residencial, limpeza comercial" />
      </Head>

      <div className={`min-h-screen ${colors.bg} transition-colors duration-300`}>
        <Header />
        
        <main className="pt-0 pb-20 px-0">
          <div className="w-full">
            
            {/* 🎯 HERO SECTION - COM MELHOR RESPONSIVIDADE */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-20 sm:mb-28 text-center pt-4 sm:pt-8"
            >
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className={`text-4xl sm:text-5xl lg:text-7xl font-black mb-4 sm:mb-6 leading-tight ${colors.textPrimary}`}
              >
                Sua Casa <br className="hidden sm:block" />
                <span className={`bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent`}>
                  Impecável
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className={`text-base sm:text-lg lg:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed ${colors.textSecondary}`}
              >
                💰 <span className="font-semibold">Pague apenas por hora</span> • 
                ⚡ <span className="font-semibold">Agendamento rápido</span> • 
                🔒 <span className="font-semibold">100% seguro</span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex gap-3 flex-wrap justify-center"
              >
                <Link href="/login">
                  <button className={`px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-all transform hover:scale-105 active:scale-95 ${colors.button}`}>
                    📅 Agendar Agora
                  </button>
                </Link>
                <Link href="/register">
                  <button className={`px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-all transform hover:scale-105 active:scale-95 ${colors.buttonSecondary}`}>
                    👤 Criar Conta
                  </button>
                </Link>
              </motion.div>
            </motion.section>

            {/* 📊 SERVIÇOS - COM MELHOR HIERARQUIA E RESPONSIVIDADE */}
            <motion.section
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-20 sm:mb-28"
            >
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black text-center mb-4 sm:mb-8 ${colors.textPrimary}`}>
                ✨ Serviços Disponíveis
              </h2>
              <p className={`text-center mb-12 sm:mb-16 max-w-2xl mx-auto text-base sm:text-lg ${colors.textSecondary}`}>
                Escolha entre diversos tipos de limpeza profissional adaptados às suas necessidades
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {[
                  {
                    icon: '🧹',
                    title: 'Limpeza Padrão',
                    desc: 'Limpeza regular de sua residência',
                    features: ['Varredura e limpeza', 'Organização', 'Acabamento básico'],
                    color: 'from-green-500 to-emerald-500'
                  },
                  {
                    icon: '🏗️',
                    title: 'Limpeza Pós-Obra',
                    desc: 'Limpeza pesada após reformas',
                    features: ['Remoção de pó', 'Limpeza profunda', 'Acabamento premium'],
                    color: 'from-emerald-500 to-green-600'
                  },
                  {
                    icon: '🛋️',
                    title: 'Limpeza Profunda',
                    desc: 'Limpeza completa e detalhada',
                    features: ['Azulejos & grouts', 'Estofados', 'Tudo incluso'],
                    color: 'from-green-600 to-teal-600'
                  }
                ].map((service, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    className={`p-6 sm:p-8 rounded-2xl ${colors.card} group cursor-pointer transform hover:-translate-y-2 transition-all`}
                  >
                    <div className={`text-5xl sm:text-6xl mb-4 transform group-hover:scale-110 transition-transform`}>
                      {service.icon}
                    </div>
                    <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${colors.textPrimary}`}>
                      {service.title}
                    </h3>
                    <p className={`mb-6 text-sm sm:text-base ${colors.textSecondary}`}>
                      {service.desc}
                    </p>
                    <div className="space-y-2 mb-6">
                      {service.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-green-500 font-bold">✓</span>
                          <span className={`text-sm ${colors.textSecondary}`}>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className={`h-1 w-full bg-gradient-to-r ${service.color} rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* 🎯 COMO FUNCIONA - COM PROGRESS INDICATOR */}
            <motion.section
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-20 sm:mb-28"
            >
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black text-center mb-4 sm:mb-8 ${colors.textPrimary}`}>
                🚀 Como Funciona
              </h2>
              <p className={`text-center mb-12 sm:mb-16 max-w-2xl mx-auto text-base sm:text-lg ${colors.textSecondary}`}>
                4 passos simples para você agendar seu serviço
              </p>

              <div className="relative">
                {/* Progress Line */}
                <div className="hidden sm:block absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-green-300 via-green-500 to-emerald-500"></div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-4">
                  {[
                    { num: '1', emoji: '📝', title: 'Cadastre-se', desc: 'Rápido e seguro', time: '2 min' },
                    { num: '2', emoji: '✨', title: 'Escolha Serviço', desc: 'Múltiplas opções', time: '1 min' },
                    { num: '3', emoji: '📅', title: 'Agende Data', desc: 'Sua conveniência', time: '1 min' },
                    { num: '4', emoji: '🎉', title: 'Aproveite!', desc: 'Deixe conosco', time: 'Dia marcado' }
                  ].map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative"
                    >
                      <div className={`text-center p-6 sm:p-8 rounded-xl ${colors.card} relative z-10`}>
                        {/* Step Badge */}
                        <div className="mb-3 flex justify-center">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {step.num}
                          </div>
                        </div>
                        <div className="text-4xl mb-3 sm:text-5xl">{step.emoji}</div>
                        <h3 className={`font-bold text-lg sm:text-xl mb-2 ${colors.textPrimary}`}>
                          {step.title}
                        </h3>
                        <p className={`text-sm sm:text-base mb-3 ${colors.textSecondary}`}>
                          {step.desc}
                        </p>
                        <badge className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${colors.accentBg} ${colors.accentText}`}>
                          ~{step.time}
                        </badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* ✨ DESTAQUES - COM MELHOR VISUAL */}
            <motion.section
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-20 sm:mb-28"
            >
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black text-center mb-4 sm:mb-8 ${colors.textPrimary}`}>
                💎 Por Que Escolher A Leidy Cleaner?
              </h2>
              <p className={`text-center mb-12 sm:mb-16 max-w-2xl mx-auto text-base sm:text-lg ${colors.textSecondary}`}>
                Somos a escolha #1 em qualidade, profissionalismo e satisfação
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {[
                  { emoji: '⭐', title: 'Profissionais Treinados', desc: 'Equipe especializada e confiável', color: 'from-yellow-400 to-orange-400' },
                  { emoji: '🌿', title: 'Produtos Ecológicos', desc: 'Segurança para sua família', color: 'from-green-400 to-emerald-400' },
                  { emoji: '💰', title: 'Preços Justos', desc: 'Pague apenas pelo que usar', color: 'from-blue-400 to-cyan-400' },
                  { emoji: '⏰', title: 'Flexível', desc: 'Agende quando quiser', color: 'from-purple-400 to-pink-400' },
                  { emoji: '📱', title: 'App Intuitivo', desc: 'Fácil de usar e seguro', color: 'from-indigo-400 to-purple-400' },
                  { emoji: '✅', title: 'Garantia 100%', desc: 'Sua satisfação garantida', color: 'from-red-400 to-pink-400' }
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className={`p-6 sm:p-8 rounded-xl ${colors.card} group hover:shadow-2xl transition-all`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl sm:text-5xl group-hover:animate-bounce">{feature.emoji}</div>
                      <div className="flex-1">
                        <h3 className={`font-bold text-lg sm:text-xl mb-2 ${colors.textPrimary}`}>
                          {feature.title}
                        </h3>
                        <p className={`text-sm sm:text-base ${colors.textSecondary}`}>
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                    <div className={`mt-4 h-1 w-0 group-hover:w-full bg-gradient-to-r ${feature.color} rounded-full transition-all duration-500`}></div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* 🚀 CTA FINAL - COM GRADIENTE VERDE */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`text-center rounded-2xl p-8 sm:p-12 lg:p-16 shadow-2xl ${colors.card} bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/30 border-2 border-green-200 dark:border-green-700/50`}
            >
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black mb-4 ${colors.textPrimary}`}>
                🎯 Pronto para Começar?
              </h2>
              <p className={`text-base sm:text-lg lg:text-xl mb-8 max-w-2xl mx-auto leading-relaxed ${colors.textSecondary}`}>
                Coloque sua casa em boas mãos com a Leidy Cleaner. Agende agora e receba atendimento premium com a melhor qualidade!
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/login">
                  <button className={`px-8 sm:px-10 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-all transform hover:scale-105 active:scale-95 ${colors.button}`}>
                    🚀 Começar Agora
                  </button>
                </Link>
                <Link href="/register">
                  <button className={`px-8 sm:px-10 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-all transform hover:scale-105 active:scale-95 ${colors.buttonSecondary}`}>
                    📝 Se Cadastrar
                  </button>
                </Link>
              </div>
            </motion.section>

          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}

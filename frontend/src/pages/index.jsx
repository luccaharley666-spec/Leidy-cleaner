import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import HourCalculator from '../components/Pricing/HourCalculator'
import TestimonialsSection from '../components/Sections/TestimonialsSection'
import GallerySection from '../components/Sections/GallerySection'
import BlogSection from '../components/Sections/BlogSection'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { trackCTAClick, [REDACTED_TOKEN], trackSectionView, setupScrollTracking, [REDACTED_TOKEN] } from '../utils/analytics'

export default function Home() {
  const [selectedHours, setSelectedHours] = useState(40);
  const [priceEstimate, setPriceEstimate] = useState(null);
  const router = useRouter();

  useEffect(() => {
    AOS.init({
      duration: 800,
      offset: 100,
      once: true,
      easing: 'ease-out-cubic'
    })

    // Setup analytics tracking
    setupScrollTracking();
    [REDACTED_TOKEN]('index');

    // Track initial section views
    trackSectionView('hero');
  }, [])

  const [REDACTED_TOKEN] = (result) => {
    setPriceEstimate(result);
    [REDACTED_TOKEN](result.hours, result.totalPrice, result.characteristics);
  };

  const handleCtaClick = (ctaName, location) => {
    trackCTAClick(ctaName, location);
  };

  return (
    <>
      <Head>
        <title>Leidy Cleaner - Limpeza Profissional em Porto Alegre | Serviços Premium</title>
        <meta name="description" content="Limpeza profissional residencial e comercial em Porto Alegre. Serviços premium com profissionais verificados, produtos eco-friendly e garantia de satisfação. Agende online!" />
        <meta name="keywords" content="limpeza profissional Porto Alegre, diarista, faxina, limpeza residencial, limpeza comercial, limpeza pós obra, produtos ecofriendly" />
        <meta name="author" content="Leidy Cleaner" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="pt-BR" />
        <meta name="revisit-after" content="7 days" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://leidycleaner.com/" />
        <meta property="og:title" content="Leidy Cleaner - Limpeza Profissional em Porto Alegre" />
        <meta property="og:description" content="Limpeza profissional residencial e comercial em Porto Alegre. Serviços premium com profissionais verificados." />
        <meta property="og:image" content="https://leidycleaner.com/og-image.jpg" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://leidycleaner.com/" />
        <meta property="twitter:title" content="Leidy Cleaner - Limpeza Profissional em Porto Alegre" />
        <meta property="twitter:description" content="Limpeza profissional residencial e comercial em Porto Alegre. Serviços premium com profissionais verificados." />
        <meta property="twitter:image" content="https://leidycleaner.com/og-image.jpg" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Leidy Cleaner",
            "description": "Serviços profissionais de limpeza residencial e comercial em Porto Alegre",
            "url": "https://leidycleaner.com",
            "telephone": "+55-51-98030-3740",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Porto Alegre",
              "addressRegion": "RS",
              "addressCountry": "BR"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "-30.0346",
              "longitude": "-51.2177"
            },
            "openingHours": "Mo-Su 08:00-18:00",
            "priceRange": "$$",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "500"
            },
            "serviceType": ["Limpeza Residencial", "Limpeza Comercial", "Limpeza Profunda"]
          })}
        </script>
      </Head>

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 via-white to-green-50 dark:bg-slate-900">
        <Header />
        <main className="flex-grow">
          {/* ========== HERO COM CALCULADORA ========== */}
          <section className="relative overflow-hidden px-4 py-16 sm:py-20 lg:py-28">
            {/* Background decorativo */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-200 to-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-emerald-200 to-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob [REDACTED_TOKEN]"></div>
            </div>

            <div className="container mx-auto max-w-7xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Texto + CTA */}
                <div data-aos="fade-right" className="space-y-6">
                  <div className="space-y-4">
                    <div className="inline-block bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-semibold">
                      ✨ Novo: Sistema de Horas Flexível
                    </div>
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                      Limpeza Profissional,{' '}
                      <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Seus Termos</span>
                    </h1>
                    <p className="text-xl text-gray-700 leading-relaxed max-w-xl">
                      Compre horas de serviço quando quiser. Use em combinações que fazem sentido para você. Sem contratos, sem surpresas.
                    </p>
                  </div>

                  {/* Stats Rápidos */}
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">2h+</div>
                      <div className="text-sm text-gray-600">Mínimo</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">40%</div>
                      <div className="text-sm text-gray-600">Desc. com horas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">365d</div>
                      <div className="text-sm text-gray-600">Validade</div>
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Link href="/HourCheckout" onClick={() => handleCtaClick('Comprar Horas', 'hero')} className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:shadow-xl transform hover:scale-105 transition duration-300 text-center">
                      💰 Comprar Horas Agora
                    </Link>
                    <button onClick={() => handleCtaClick('Ver Disponibilidade', 'hero')} className="px-8 py-4 border-2 border-green-600 text-green-600 font-bold rounded-lg hover:bg-green-50 transition duration-300">
                      📅 Ver Disponibilidade
                    </button>
                  </div>
                </div>

                {/* Calculadora */}
                <div data-aos="fade-left" className="lg:ml-4">
                  <HourCalculator onCalculate={[REDACTED_TOKEN]} />
                </div>
              </div>
            </div>
          </section>

          {/* ========== COMO FUNCIONA ========== */}
          <section className="py-20 bg-white px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                  Como Funciona? 🔄
                </h2>
                <p className="text-xl text-gray-600">4 passos simples para começar</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { num: '1', title: 'Escolha Horas', desc: 'Selecione quantas horas você precisa (40h, 60h, 80h...)' },
                  { num: '2', title: 'Veja o Preço', desc: 'Calculadora mostra o valor total com todas as taxas' },
                  { num: '3', title: 'Pague', desc: 'PIX ou Cartão. Seguro e rápido.' },
                  { num: '4', title: 'Use Quando Quiser', desc: 'Suas horas ficam disponíveis por 365 dias' }
                ].map((step, i) => (
                  <div key={i} data-aos="zoom-in" data-aos-delay={i * 100} className="relative">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 h-full border-2 border-green-200">
                      <div className="absolute -top-6 left-6 w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {step.num}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2">{step.title}</h3>
                      <p className="text-gray-700">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ========== PACOTES DESTACADOS ========== */}
          <section className="py-20 bg-gradient-to-b from-green-50 to-white px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                  Pacotes Recomendados 🎁
                </h2>
                <p className="text-xl text-gray-600">Quanto maior o pacote, melhor o preço por hora</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {[
                  { hours: 40, price: 2987, pricePerHour: 40, popular: false, label: 'Iniciante' },
                  { hours: 60, price: 2248, pricePerHour: 20, popular: true, label: 'Recomendado' },
                  { hours: 120, price: 4256, pricePerHour: 20, popular: false, label: 'Profissional' }
                ].map((pkg, i) => (
                  <div key={i} data-aos="flip-left" data-aos-delay={i * 100} className={`relative rounded-lg overflow-hidden transition transform hover:scale-105 ${pkg.popular ? 'ring-2 ring-green-500 shadow-2xl' : 'shadow-lg'}`}>
                    {pkg.popular && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                        ⭐ Mais Popular
                      </div>
                    )}
                    <div className={`p-8 ${pkg.popular ? 'bg-gradient-to-br from-green-600 to-emerald-600 text-white' : 'bg-white'}`}>
                      <h3 className="text-2xl font-bold mb-2">{pkg.hours}h</h3>
                      <p className={`text-sm mb-4 ${pkg.popular ? 'text-green-100' : 'text-gray-600'}`}>{pkg.label}</p>
                      <div className="text-4xl font-bold mb-1">R$ {pkg.price.toLocaleString('pt-BR')}</div>
                      <p className={`text-xs mb-6 ${pkg.popular ? 'text-green-100' : 'text-gray-500'}`}>{pkg.pricePerHour}h/hora</p>
                      <button className={`w-full py-3 rounded-lg font-bold transition ${pkg.popular ? 'bg-white text-green-600 hover:bg-green-50' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                        Comprar Agora →
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <Link href="/HourCheckout" onClick={() => handleCtaClick('Ver Todos os Pacotes', 'pacotes')} className="inline-block px-8 py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition">
                  Ver Todos os Pacotes
                </Link>
              </div>
            </div>
          </section>

          {/* ========== DIFERENCIAIS ========== */}
          <section className="py-20 bg-white px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                  Por que nos escolher? 💚
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { icon: '⏰', title: 'Flexibilidade Total', desc: 'Use 2h, 4h, 8h - quanto quiser, quando quiser' },
                  { icon: '💰', title: 'Sem Surpresas', desc: 'Preço fixo, todas as taxas inclusas. Viu na tela, paga aquilo.' },
                  { icon: '✅', title: 'Profissionais Verificados', desc: 'Todos passam por background check e treinamento' },
                  { icon: '🌱', title: 'Produtos Eco-Friendly', desc: 'Limpeza eficaz sem prejudicar o meio ambiente' },
                  { icon: '⭐', title: 'Satisfação Garantida', desc: 'Se não ficar 100% satisfeito, a gente volta!' },
                  { icon: '🚀', title: 'Agendamento Rápido', desc: 'Reserve seu horário em menos de 1 minuto'  }
                ].map((item, i) => (
                  <div key={i} data-aos="fade-up" data-aos-delay={i * 50} className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border-l-4 border-green-600">
                    <div className="text-4xl mb-4">{item.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-700">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ========== CTA FINAL ========== */}
          <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-600 px-4">
            <div className="container mx-auto max-w-4xl text-center text-white">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Pronto para uma casa limpa e organizada?
              </h2>
              <p className="text-xl mb-8 text-green-50">
                Comece agora mesmo selecionando suas horas de serviço
              </p>
              <Link href="/HourCheckout" onClick={() => handleCtaClick('Comprar Horas de Serviço', 'cta_final')} className="inline-block px-10 py-4 bg-white text-green-600 font-bold rounded-lg hover:shadow-2xl transform hover:scale-105 transition duration-300">
                💚 Comprar Horas de Serviço
              </Link>
            </div>
          </section>

          {/* ========== FAQ ========== */}
          <section className="py-20 px-4 bg-white">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
                Dúvidas Frequentes ❓
              </h2>

              <div className="space-y-4">
                {[
                  { q: 'Minhas horas expiram?', a: 'Não! Elas válidas por 365 dias a partir da compra. Você usa quando achar melhor.' },
                  { q: 'Como funciona o desconto com horas?', a: 'Se pagar com horas pré-pagas, você não paga a taxa de serviço (40% de desconto)!' },
                  { q: 'Posso transferir horas?', a: 'Atualmente não, cada pacote é vinculado à sua conta. Mas você pode usar no fim de semana, feriado, etc.' },
                  { q: 'E se não gostar do serviço?', a: 'Tenemos garantia! Se não ficar 100% satisfeito, refazemos sem cobrar, ou reembolsamos até 30 dias.' },
                  { q: 'Qual é a duração mínima?', a: 'O mínimo é 2 horas. Perfeito para apartamentos pequenos ou manutenção rápida.' }
                ].map((faq, i) => (
                  <details key={i} className="group bg-green-50 border border-green-200 rounded-lg p-6 hover:shadow-md transition cursor-pointer">
                    <summary className="flex justify-between items-center font-bold text-gray-900 text-lg">
                      {faq.q}
                      <span className="transition group-open:rotate-180">▼</span>
                    </summary>
                    <p className="mt-4 text-gray-700">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* ========== TESTIMONIAIS ========== */}
          <TestimonialsSection />

          {/* ========== GALERIA ========== */}
          <GallerySection />

          {/* ========== BLOG ========== */}
          <BlogSection />

        </main>

        <Footer />
      </div>
    </>
  )
}

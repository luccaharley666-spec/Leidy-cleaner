import Link from 'next/link';
import Head from 'next/head';
import { CouponSystem } from '../components/UI/CouponSystem';

/**
 * Página de Serviços - Gallery com cartões premium
 */
export default function Servicos() {
  const services = [
    {
      id: 1,
      icon: '🏠',
      name: 'Limpeza Residencial',
      description: 'Limpeza completa para apartamentos e casas',
      features: ['Limpeza geral', 'Desinfecção', 'Organização'],
      price: 'A partir de R$ 150',
      image: '🏠',
      color: 'from-blue-600 to-cyan-500'
    },
    {
      id: 2,
      icon: '🏢',
      name: 'Limpeza Comercial',
      description: 'Serviços profissionais para empresas e escritórios',
      features: ['Limpeza diária', 'Higiene profunda', 'Monitoramento'],
      price: 'Sob orçamento',
      image: '🏢',
      color: 'from-purple-600 to-pink-500'
    },
    {
      id: 3,
      icon: '✨',
      name: 'Limpeza Profunda',
      description: 'Limpeza intensiva com técnicas avançadas',
      features: ['Vapor profissional', 'Desinfetante premium', 'Aromatização'],
      price: 'A partir de R$ 250',
      image: '✨',
      color: 'from-orange-600 to-red-500'
    },
    {
      id: 4,
      icon: '🪟',
      name: 'Limpeza de Vidros',
      description: 'Vidros espelhados e brilhantes em seu imóvel',
      features: ['Interior/Exterior', 'Sem manchas', 'Seguro'],
      price: 'A partir de R$ 100',
      image: '🪟',
      color: 'from-green-600 to-emerald-500'
    },
    {
      id: 5,
      icon: '🧽',
      name: 'Limpeza de Tapetes',
      description: 'Higienização profissional com máquina a vapor',
      features: ['Remoção de ácaros', 'Secagem rápida', 'Aroma fresco'],
      price: 'A partir de R$ 80',
      image: '🧽',
      color: 'from-indigo-600 to-blue-500'
    },
    {
      id: 6,
      icon: '🌳',
      name: 'Limpeza de Áreas Externas',
      description: 'Limpeza de jardins, garagens e espaços abertos',
      features: ['Pressão alta', 'Desobstrução', 'Desinfecção'],
      price: 'A partir de R$ 120',
      image: '🌳',
      color: 'from-teal-600 to-cyan-500'
    }
  ];

  return (
    <>
      <Head>
        <title>Nossos Serviços - Leidy Cleaner | Limpeza Premium</title>
        <meta name="description" content="Conheça todos os serviços de limpeza profissional da Leidy Cleaner. Limpeza residencial, comercial, profunda e mais." />
        <meta name="keywords" content="limpeza profissional, serviços de limpeza, Porto Alegre" />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-950">
        {/* Header Section */}
        <section className="pt-20 sm:pt-28 pb-12 sm:pb-16 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-600 bg-clip-text text-transparent">
              Nossos Serviços
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Soluções completas de limpeza profissional adaptadas às suas necessidades, com qualidade premium e preços acessíveis.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-12">
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                6+
              </p>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Serviços
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                2000+
              </p>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Clientes
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                ⭐ 4.9
              </p>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Avaliação
              </p>
            </div>
          </div>
        </section>

        {/* Coupon Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🎫 Ofertas Especiais
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Aproveite nossos cupons de desconto exclusivos
            </p>
          </div>
          <CouponSystem />
        </section>

        {/* Services Grid */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                {/* Gradient Background */}
                <div className={`h-32 bg-gradient-to-br ${service.color} relative overflow-hidden`}>
                  <div className="absolute top-1/2 right-0 transform translate-y-1/2 text-8xl opacity-30">
                    {service.image}
                  </div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                </div>

                {/* Content */}
                <div className="p-6 relative z-10">
                  {/* Icon */}
                  <div className="w-16 h-16 -mt-12 mb-4 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-4xl shadow-lg border-4 border-gray-50 dark:border-slate-700">
                    {service.icon}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Price */}
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">
                    {service.price}
                  </p>

                  {/* CTA Button */}
                  <Link href="/agendar">
                    <div className="block w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-center hover:shadow-lg hover:scale-105 transition-all">
                      Agendar Serviço
                    </div>
                  </Link>
                </div>

                {/* Hover Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-600/30 transition-colors pointer-events-none"></div>
              </div>
            ))}
          </div>
        </section>

        {/* Additional Services */}
        <section className="border-t border-gray-200 dark:border-slate-700 py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Serviços Especiais
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Não encontrou o que procura? Temos soluções customizadas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: '🎉', title: 'Limpeza para Eventos', desc: 'Preparação e pós-evento com equipe especializada' },
                { icon: '🏥', title: 'Limpeza Hospitalar', desc: 'Desinfecção com protocolos de saúde rigorosos' },
                { icon: '🚗', title: 'Limpeza Automotiva', desc: 'Interior e exterior de veículos com cuidado' },
                { icon: '🛏️', title: 'Higienização de Móveis', desc: 'Sofás, colchões e estofados profissionalmente' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-blue-200 dark:border-slate-600 hover:shadow-lg transition-all"
                >
                  <p className="text-4xl mb-3">{item.icon}</p>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/agendar">
                <div className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold hover:shadow-lg hover:scale-105 transition-all">
                  <span>💬</span>
                  Solicitar Orçamento Custom
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              Por que Escolher a Leidy Cleaner?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: '✓', title: 'Profissionais Treinados', desc: 'Equipe certificada e experiente' },
                { icon: '🌱', title: 'Produtos Eco-Friendly', desc: 'Sustentáveis e seguros' },
                { icon: '⚡', title: 'Rápido & Eficiente', desc: 'Resultados garantidos' },
                { icon: '💰', title: 'Preços Justos', desc: 'Melhor custo-benefício' }
              ].map((item, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-5xl mb-3">{item.icon}</p>
                  <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                  <p className="text-blue-100">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Pronto para Uma Limpeza Premium?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
            Agende seu serviço agora e receba 10% de desconto na primeira limpeza
          </p>
          <Link href="/agendar">
            <div className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold hover:shadow-lg hover:scale-105 transition-all">
              <span>📅</span>
              Agendar Agora
            </div>
          </Link>
        </section>
      </main>
    </>
  );
}

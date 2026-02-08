/* React default import removed (automatic JSX runtime) */
import Head from 'next/head';
import { MainLayout } from '@/components/Layout';

export default function ServicesPage() {
  const services = [
    {
      id: 1,
      icon: '🏠',
      title: 'Limpeza Residencial',
      description: 'Limpeza completa e detalhada de sua casa',
      fullDescription: 'Nosso serviço de limpeza residencial inclui limpeza geral de todos os cômodos, móveis, pisos e superfícies. Utilizamos produtos seguros para toda a família.',
      price: 'R$ 150 - R$ 500',
      features: [
        'Limpeza de todos os cômodos',
        'Limpeza de pisos e tapetes',
        'Limpeza de janelas',
        'Organização de ambientes',
        'Produtos ecológicos'
      ],
      rating: 4.9,
      reviews: 287,
    },
    {
      id: 2,
      icon: '🏢',
      title: 'Limpeza Comercial',
      description: 'Manutenção profissional de escritórios e empresas',
      fullDescription: 'Serviço especializado para empresas, com limpeza pontual e eficiente que não interfere na sua rotina de trabalho.',
      price: 'R$ 250 - R$ 1500',
      features: [
        'Limpeza diária/semanal',
        'Organização de ambientes',
        'Higienização de banheiros',
        'Limpeza de vidros',
        'Gestão de resíduos'
      ],
      rating: 4.8,
      reviews: 156,
    },
    {
      id: 3,
      icon: '🪟',
      title: 'Limpeza de Vidros',
      description: 'Especialização em vidros e fachadas',
      fullDescription: 'Equipe especializada em limpeza de vidros e fachadas com segurança e qualidade. Utilizamos técnicas modernas e seguras.',
      price: 'R$ 100 - R$ 800',
      features: [
        'Limpeza de vidros internos',
        'Limpeza de fachadas',
        'Limpeza de vitrines',
        'Espelhos cristal',
        'Equipamento de segurança'
      ],
      rating: 5.0,
      reviews: 98,
    },
    {
      id: 4,
      icon: '🧼',
      title: 'Limpeza Profunda',
      description: 'Higienização completa com tratamento especial',
      fullDescription: 'Serviço de limpeza profunda que inclui higienização, desinfecção e limpeza de áreas de difícil acesso.',
      price: 'R$ 400 - R$ 1200',
      features: [
        'Limpeza profunda',
        'Desinfecção completa',
        'Limpeza de áreas altas',
        'Tratamento antibacteriano',
        'Certificado de higiene'
      ],
      rating: 4.9,
      reviews: 124,
    },
    {
      id: 5,
      icon: '⭕',
      title: 'Limpeza de Carpetes',
      description: 'Limpeza especializada de carpetes e estofados',
      fullDescription: 'Utilizamos tecnologia de ponta para limpeza profunda de carpetes e móveis estofados.',
      price: 'R$ 200 - R$ 600',
      features: [
        'Limpeza de carpetes',
        'Limpeza de sofa',
        'Limpeza de cadeiras',
        'Remoção de manchas',
        'Tratamento antimicrob'
      ],
      rating: 4.8,
      reviews: 89,
    },
    {
      id: 6,
      icon: '✨',
      title: 'Limpeza Após Mudança',
      description: 'Preparação de ambientes após mudança ou reforma',
      fullDescription: 'Limpeza completa para deixar seu novo ambiente perfeito e pronto para morar.',
      price: 'R$ 300 - R$ 1000',
      features: [
        'Limpeza completa',
        'Remoção de pó de obra',
        'Vidros e espelhos',
        'Organização de ambientes',
        'Inspeção final'
      ],
      rating: 5.0,
      reviews: 76,
    },
  ];

  return (
    <>
      <Head>
        <title>Nossos Serviços - LimpezaPro</title>
        <meta name="description" content="Conheça todos os serviços de limpeza profissional que oferecemos" />
      </Head>

      <MainLayout>
        {/* HERO */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-16 lg:py-24">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
                Nossos <span className="text-cyan-500">Serviços</span>
              </h1>
              <p className="text-xl text-slate-600">
                Temos a solução perfeita para todas as suas necessidades de limpeza
              </p>
            </div>
          </div>
        </section>

        {/* SERVICES GRID */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map(service => (
                <div
                  key={service.id}
                  className="bg-white border-2 border-slate-100 rounded-xl overflow-hidden hover:border-cyan-500 hover:shadow-xl transition-all group"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-8 flex items-center justify-between">
                    <div className="text-6xl">{service.icon}</div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-cyan-500">{service.rating}</span>
                        <span className="text-cyan-500">★</span>
                      </div>
                      <p className="text-xs text-slate-600">{service.reviews} reviews</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-2xl font-bold text-slate-900">{service.title}</h3>
                    <p className="text-slate-600">{service.description}</p>

                    {/* Price */}
                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-sm text-slate-600 mb-2">A partir de</p>
                      <p className="text-2xl font-bold text-cyan-500">{service.price}</p>
                    </div>

                    {/* Features (Collapsed for now) */}
                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-2">Inclui:</p>
                      <ul className="space-y-1">
                        {service.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="text-sm text-slate-600 flex items-center gap-2">
                            <span className="text-cyan-500">✓</span>{feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA */}
                    <button className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-blue-900 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all group-hover:scale-[1.02]">
                      Agendar Serviço
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20 lg:py-32 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Como funciona?</h2>
              <p className="text-xl text-slate-600">4 passos simples para agendar seu serviço</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  step: 1,
                  title: 'Escolha o Serviço',
                  description: 'Selecione o serviço que você precisa',
                  icon: '🎯'
                },
                {
                  step: 2,
                  title: 'Escolha a Data',
                  description: 'Selecione a data e hora ideal para você',
                  icon: '📅'
                },
                {
                  step: 3,
                  title: 'Confirmação',
                  description: 'Receba a confirmação e detalhes',
                  icon: '✅'
                },
                {
                  step: 4,
                  title: 'Aproveite!',
                  description: 'Nosso time realiza o serviço com excelência',
                  icon: '⭐'
                },
              ].map(item => (
                <div key={item.step} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-900 to-cyan-500 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING INFO */}
        <section className="py-20 lg:py-32 bg-white">
          <div className="container max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Informações de Preço</h2>
            </div>

            <div className="space-y-6">
              {[
                { title: 'Visita Inicial', description: 'Diagnóstico gratuito de suas necessidades' },
                { title: 'Sem Cobranças Ocultas', description: 'Transparência total em todos os serviços' },
                { title: 'Descontos por Volume', description: 'Achados especiais para serviços recorrentes' },
                { title: 'Garantia de Satisfação', description: 'Se não ficar satisfeito, refazemos sem custos' },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-6 bg-slate-50 rounded-lg border border-slate-200 hover:border-cyan-500 transition">
                  <div className="text-2xl">✓</div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-slate-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 lg:py-32 bg-gradient-to-r from-blue-900 to-cyan-500 text-white">
          <div className="container text-center">
            <h2 className="text-4xl font-bold mb-4">Agende Seu Serviço Agora</h2>
            <p className="text-xl text-blue-100 mb-8">Primeira consulta é totalmente gratuita</p>
            <button className="px-8 py-4 bg-white text-blue-900 font-bold rounded-lg hover:shadow-2xl transition-all hover:scale-105">
              📅 Agendar Agora
            </button>
          </div>
        </section>
      </MainLayout>
    </>
  );
}

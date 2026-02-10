/* React default import removed (automatic JSX runtime) */
import Head from 'next/head';
import Link from 'next/link';
import { MainLayout } from '@/components/Layout';

export default function HomePage() {
  const features = [
    {
      icon: '⚡',
      title: 'Rápido & Eficiente',
      description: 'Agendamento em tempo real e execução pontual',
    },
    {
      icon: '👥',
      title: 'Profissionais Certificados',
      description: 'Equipe treinada e com experiência comprovada',
    },
    {
      icon: '💰',
      title: 'Preços Justos',
      description: 'Sem cobranças ocultas, total transparência',
    },
    {
      icon: '🛡️',
      title: 'Garantia',
      description: 'Satisfação garantida ou seu dinheiro de volta',
    },
    {
      icon: '🌍',
      title: 'Eco-Friendly',
      description: 'Produtos seguros para você e para o meio ambiente',
    },
    {
      icon: '🔒',
      title: 'Seguro & Confiável',
      description: 'Todos os colaboradores são verificados',
    },
  ];

  const services = [
    {
      title: 'Limpeza Residencial',
      description: 'Limpeza completa de sua casa com padrão de excelência',
      price: 'A partir de R$ 150',
      icon: '🏠',
    },
    {
      title: 'Limpeza Comercial',
      description: 'Manutenção profissional de escritórios e empresas',
      price: 'A partir de R$ 250',
      icon: '🏢',
    },
    {
      title: 'Limpeza de Vidros',
      description: 'Especialização em limpeza de vidros e fachadas',
      price: 'A partir de R$ 100',
      icon: '🪟',
    },
    {
      title: 'Limpeza Profunda',
      description: 'Higienização completa com tratamento especial',
      price: 'A partir de R$ 400',
      icon: '✨',
    },
  ];

  const testimonials = [
    {
      name: 'Maria Silva',
      role: 'Gerente, Tech Company',
      text: 'Excelente serviço! Meu escritório ficou impecável. Recomendo!',
      avatar: '👩‍💼',
    },
    {
      name: 'João Santos',
      role: 'Proprietário, Comércio',
      text: 'Profissionais pontuais e educados. Voltaria a contratar com certeza.',
      avatar: '👨‍💼',
    },
    {
      name: 'Ana Costa',
      role: 'Mãe, Profissional',
      text: 'Poupou meu tempo e deixou tudo limpo. Muito satisfeita!',
      avatar: '👩',
    },
  ];

  return (
    <>
      <Head>
        <title>LimpezaPro - Serviços de Limpeza Profissional</title>
        <meta name="description" content="Serviços profissionais de limpeza para residências e empresas" />
      </Head>

      <MainLayout>
        {/* HERO SECTION */}
        <section className="bg-gradient-to-b from-blue-50 via-white to-white pt-12 pb-20 lg:pt-20 lg:pb-32">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="flex flex-col justify-center space-y-8">
                <div className="space-y-4">
                  <span className="inline-block px-4 py-2 rounded-full bg-cyan-100 text-cyan-700 text-sm font-semibold">
                    ✨ Novo em 2026
                  </span>
                  <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                    Limpeza Profissional <span className="text-cyan-500">Moderna</span>
                  </h1>
                  <p className="text-xl text-slate-600 leading-relaxed">
                    Deixe a limpeza com especialistas. Rápido, seguro e com qualidade garantida para sua casa e negócio.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/agendar"
                    className="px-8 py-4 bg-gradient-to-r from-blue-900 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-xl transition-all hover:scale-105 text-center"
                  >
                    🗓️ Agendar Agora
                  </Link>
                  <Link
                    href="/sobre"
                    className="px-8 py-4 border-2 border-slate-900 text-slate-900 font-semibold rounded-lg hover:bg-slate-900 hover:text-white transition-all text-center"
                  >
                    Saiba Mais
                  </Link>
                </div>

                <div className="flex gap-8 pt-4">
                  <div>
                    <p className="text-3xl font-bold text-cyan-500">1000+</p>
                    <p className="text-slate-600">Clientes Satisfeitos</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-cyan-500">4.9★</p>
                    <p className="text-slate-600">Avaliação Média</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-cyan-500">50+</p>
                    <p className="text-slate-600">Profissionais</p>
                  </div>
                </div>
              </div>

              {/* Right Image/Illustration */}
              <div className="relative hidden lg:block">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-8 left-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob [REDACTED_TOKEN]"></div>
                <div className="relative w-full h-96 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl shadow-2xl flex items-center justify-center text-8xl">
                  ✨
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-20 lg:py-32 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Por que nos escolher?</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                6 razões para confiar na LimpezaPro como seu parceiro de limpeza
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="p-8 bg-white border-2 border-slate-100 rounded-xl hover:border-cyan-500 hover:shadow-lg transition-all hover:translate-y-[-4px]"
                >
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section className="py-20 lg:py-32 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Nossos Serviços</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Soluções de limpeza personalizadas para todas as suas necessidades
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, idx) => (
                <div
                  key={idx}
                  className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all border border-slate-100 group cursor-pointer"
                >
                  <div className="text-6xl mb-4 group-hover:scale-110 [REDACTED_TOKEN]">{service.icon}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{service.title}</h3>
                  <p className="text-slate-600 text-sm mb-4">{service.description}</p>
                  <p className="text-cyan-500 font-semibold text-sm">{service.price}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/servicos"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-900 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-xl transition-all"
              >
                Ver Todos os Serviços →
              </Link>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="py-20 lg:py-32 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">O que nossos clientes dizem</h2>
              <p className="text-xl text-slate-600">Aqui estão algumas avaliações reais de clientes satisfeitos</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, idx) => (
                <div
                  key={idx}
                  className="bg-white p-8 rounded-xl border-2 border-slate-100 hover:border-cyan-500 transition-all"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-5xl">{testimonial.avatar}</div>
                    <div>
                      <p className="font-bold text-slate-900">{testimonial.name}</p>
                      <p className="text-sm text-slate-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-slate-600 italic">{testimonial.text}</p>
                  <div className="mt-4 text-cyan-500 text-xl">★★★★★</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-20 lg:py-32 bg-gradient-to-r from-blue-900 via-blue-800 to-cyan-500 text-white">
          <div className="container text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Pronto para começar?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Agende seu serviço em segundos. Sem compromisso. Sem cobranças ocultas.
            </p>
            <Link
              href="/agendar"
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-blue-900 font-bold rounded-lg hover:shadow-2xl transition-all hover:scale-105"
            >
              Agendar Agora 🚀
            </Link>
          </div>
        </section>
      </MainLayout>
    </>
  );
}

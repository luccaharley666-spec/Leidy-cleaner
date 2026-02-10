import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import LeidyHeader from '../components/Layout/LeidyHeader';
import LeidyFooter from '../components/Layout/LeidyFooter';

export default function Sobre() {
  return (
    <>
      <Head>
        <title>Sobre Nós - Leidy Cleaner</title>
        <meta name="description" content="Conheça a história, missão e valores da Leidy Cleaner" />
      </Head>

      <LeidyHeader />

      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-green-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-green-900 mb-4">
            Sobre a Leidy Cleaner
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Mais de uma década dedicada à excelência em serviços de limpeza
          </p>
        </div>
      </section>

      {/* Main About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-green-900 mb-6">
                Nossa História
              </h2>
              
              <p className="text-gray-700 mb-4 leading-relaxed">
                A Leidy Cleaner nasceu com o propósito de oferecer serviços de limpeza de alta qualidade, com profissionais treinados e comprometidos com a satisfação total dos clientes.
              </p>
              
              <p className="text-gray-700 mb-4 leading-relaxed">
                Começamos com um sonho simples: deixar ambientes limpos, saudáveis e aconchegantes. Ao longo dos anos, construímos uma reputação sólida baseada na confiança, profissionalismo e resultados excepcionais.
              </p>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                Hoje, atendemos centenas de clientes satisfeitos, desde residências até grandes empresas, sempre mantendo os mesmos valores de qualidade e compromisso que nos definem.
              </p>
              
              <Link href="/contato" className="inline-block px-6 py-3 bg-green-700 text-white font-semibold rounded-full hover:bg-green-900 transition">
                Conhecer Nossos Serviços
              </Link>
            </div>
            
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/[REDACTED_TOKEN]?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Equipe Leidy Cleaner"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-green-900 mb-4 relative pb-4">
            Nossa Filosofia
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-green-500"></span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {/* Mission */}
            <div className="bg-white rounded-lg p-8 shadow-lg text-center">
              <i className="fas fa-bullseye text-5xl text-green-700 mb-4 block"></i>
              <h3 className="text-2xl font-bold text-green-900 mb-4">Missão</h3>
              <p className="text-gray-700">
                Proporcionar ambientes limpos, saudáveis e aconchegantes através de serviços profissionais, éticos e sustentáveis, gerando satisfação para nossos clientes.
              </p>
            </div>
            
            {/* Vision */}
            <div className="bg-white rounded-lg p-8 shadow-lg text-center">
              <i className="fas fa-eye text-5xl text-green-700 mb-4 block"></i>
              <h3 className="text-2xl font-bold text-green-900 mb-4">Visão</h3>
              <p className="text-gray-700">
                Ser a empresa de limpeza mais confiável e referenciada do mercado, reconhecida pela excelência, inovação e respeito ao meio ambiente.
              </p>
            </div>
            
            {/* Values */}
            <div className="bg-white rounded-lg p-8 shadow-lg text-center">
              <i className="fas fa-heart text-5xl text-green-700 mb-4 block"></i>
              <h3 className="text-2xl font-bold text-green-900 mb-4">Valores</h3>
              <p className="text-gray-700">
                Qualidade, Confiança, Profissionalismo, Compromisso Ambiental e Satisfação do Cliente
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Trust Us */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-green-900 mb-4 relative pb-4">
            Por que confiar em nós?
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-green-500"></span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            {[
              {
                icon: 'fa-leaf',
                title: 'Produtos Ecológicos',
                description: 'Utilizamos apenas produtos biodegradáveis que não agridem o ambiente e são seguros para crianças e animais de estimação.'
              },
              {
                icon: 'fa-user-shield',
                title: 'Profissionais Treinados',
                description: 'Nossa equipe passa por treinamento contínuo para garantir os melhores resultados em cada serviço.'
              },
              {
                icon: 'fa-thumbs-up',
                title: 'Garantia de Satisfação',
                description: 'Oferecemos garantia total de satisfação com nossos serviços. Se não ficar satisfeito, corrigiremos sem custo adicional.'
              },
              {
                icon: 'fa-clock',
                title: 'Pontualidade',
                description: 'Você pode contar conosco para chegar no horário combinado e cumprir cronograma acordado.'
              },
              {
                icon: 'fa-shield-alt',
                title: 'Confiança',
                description: 'Todos os nossos profissionais são verificados e confiáveis. Você pode deixar seus ambientes com segurança.'
              },
              {
                icon: 'fa-handshake',
                title: 'Transparência',
                description: 'Orçamentos claros sem taxas escondidas. Você sabe exatamente o que está pagando pelo serviço.'
              }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0">
                  <i className={`fas ${item.icon} text-3xl text-green-500 mt-1`}></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-green-900 mb-2">{item.title}</h3>
                  <p className="text-gray-700">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-green-700 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">10+</div>
              <p className="text-xl opacity-90">Anos de Experiência</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">1000+</div>
              <p className="text-xl opacity-90">Clientes Satisfeitos</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50+</div>
              <p className="text-xl opacity-90">Profissionais</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">99%</div>
              <p className="text-xl opacity-90">Taxa de Satisfação</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-100 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-green-900 mb-4">
            Faça parte da nossa família de clientes satisfeitos
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Solicite seu orçamento gratuito e descubra a diferença que a Leidy Cleaner pode fazer
          </p>
          <Link href="/contato" className="inline-block px-8 py-3 bg-green-700 text-white font-bold rounded-full hover:bg-green-900 transition">
            Solicitar Orçamento
          </Link>
        </div>
      </section>

      <LeidyFooter />
    </>
  );
}

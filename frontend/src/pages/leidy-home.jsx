import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import LeidyHeader from '../components/Layout/LeidyHeader';
import LeidyFooter from '../components/Layout/LeidyFooter';

export default function LeidyHome() {
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    // Here you could send the email to your backend
    setEmailSubmitted(true);
    setEmail('');
    setTimeout(() => setEmailSubmitted(false), 3000);
  };

  return (
    <>
      <Head>
        <title>Leidy Cleaner - Serviços de Limpeza Profissional</title>
        <meta name="description" content="Limpeza profissional para seu lar ou empresa. Produtos ecológicos, profissionais treinados e garantia de satisfação." />
      </Head>

      <LeidyHeader />

      <div className="h-4"></div>

      {/* Hero Section - Novo Design Moderno */}
      <section 
        className="hero pt-40 pb-24 text-white text-center bg-cover bg-center relative overflow-hidden"
        style={{
          backgroundImage: "linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(99, 102, 241, 0.85), rgba(59, 130, 246, 0.9)), url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Animated background elements */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 left-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="inline-block mb-6 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
            <span className="text-sm font-semibold">✨ Serviço Premium de Limpeza Nacional</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight drop-shadow-lg">
            Seu lar impecável, <br/><span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">sem preocupações</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-10 opacity-95 max-w-2xl mx-auto leading-relaxed">
            Limpeza profissional com produtos ecológicos e técnicas modernas em todo Brasil. Resultados garantidos ou seu dinheiro de volta!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/agendar" className="px-8 py-4 bg-gradient-to-r from-yellow-300 to-orange-300 text-gray-900 font-bold rounded-2xl hover:from-yellow-400 hover:to-orange-400 transition transform hover:scale-105 shadow-2xl inline-flex items-center justify-center gap-2 btn-primary">
              🚀 Agendar Agora
            </Link>
            <Link href="/servicos" className="px-8 py-4 bg-white/20 backdrop-blur-md border-2 border-white text-white font-bold rounded-2xl hover:bg-white/30 transition transform hover:scale-105 shadow-lg btn-ghost">
              📋 Ver Serviços
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 pt-12 border-t border-white/20">
            <div>
              <div className="text-4xl font-black mb-2">15K+</div>
              <div className="text-sm opacity-90">Clientes Satisfeitos</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2">27</div>
              <div className="text-sm opacity-90">Estados Cobertos</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2">★★★★★</div>
              <div className="text-sm opacity-90">4.9 Avaliação</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - Novo Design */}
      <section className="py-24 bg-gradient-to-b from-white via-violet-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Nossos Serviços
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Soluções completas de limpeza para residências, empresas e áreas especiais. Qualidade premium em todo Brasil!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                emoji: '🏠',
                title: 'Limpeza Residencial',
                description: 'Casas e apartamentos impecáveis. Salas, quartos, cozinha e banheiros.',
                color: 'from-violet-500 to-purple-500'
              },
              {
                emoji: '🏢',
                title: 'Limpeza Comercial',
                description: 'Escritórios, lojas e espaços comerciais brilhando para seus clientes.',
                color: 'from-indigo-500 to-blue-500'
              },
              {
                emoji: '🛋️',
                title: 'Limpeza de Estofados',
                description: 'Sofás, cadeiras e colchões como novos. Sem manchas, perfumado.',
                color: 'from-pink-500 to-rose-500'
              },
              {
                emoji: '🪟',
                title: 'Limpeza de Vidros',
                description: 'Janelas, portas e fachadas brilhando ao sol. Perfeito!',
                color: 'from-orange-500 to-yellow-500'
              }
            ].map((service, idx) => (
              <div key={idx} className={`group bg-gradient-to-br ${service.color} p-0.5 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2`}>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center h-full relative overflow-hidden card">
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity rounded-2xl"></div>
                  <div className="text-5xl mb-4 block transform group-hover:scale-110 transition-transform">{service.emoji}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-indigo-600 group-hover:bg-clip-text transition-all">{service.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                  <button className="mt-4 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Saiba mais →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-green-900 mb-4 relative pb-4">
            Sobre a Leidy Cleaner
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-green-500"></span>
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-12">
            <div>
              <h3 className="text-3xl font-bold text-green-900 mb-4">
                Mais de 10 anos deixando ambientes impecáveis
              </h3>
              <p className="text-gray-700 mb-4">
                A Leidy Cleaner nasceu com o propósito de oferecer serviços de limpeza de alta qualidade, com profissionais treinados e comprometidos com a satisfação total dos clientes.
              </p>
              <p className="text-gray-700 mb-6">
                Utilizamos produtos ecológicos que não agridem o meio ambiente e são seguros para crianças e animais de estimação. Nossa missão é proporcionar um ambiente limpo, saudável e aconchegante para você e sua família.
              </p>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 text-center rounded-lg shadow">
                  <i className="fas fa-leaf text-3xl text-green-500 mb-2 block"></i>
                  <h4 className="font-semibold text-green-900">Produtos Ecológicos</h4>
                </div>
                <div className="bg-white p-4 text-center rounded-lg shadow">
                  <i className="fas fa-user-shield text-3xl text-green-500 mb-2 block"></i>
                  <h4 className="font-semibold text-green-900">Profissionais Treinados</h4>
                </div>
                <div className="bg-white p-4 text-center rounded-lg shadow">
                  <i className="fas fa-thumbs-up text-3xl text-green-500 mb-2 block"></i>
                  <h4 className="font-semibold text-green-900">Garantia de Satisfação</h4>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Equipe Leidy Cleaner"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-green-900 mb-4 relative pb-4">
            Entre em Contato
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-green-500"></span>
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
            {/* Contact Info */}
            <div>
              <h3 className="text-2xl font-bold text-green-900 mb-4">Fale Conosco</h3>
              <p className="text-gray-700 mb-8">
                Estamos prontos para atender suas necessidades de limpeza. Entre em contato para solicitar um orçamento ou tirar suas dúvidas.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-green-900">Cobertura</h4>
                    <p className="text-gray-700">Atuamos em todo o Brasil - 27 Estados</p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <i className="fas fa-phone"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-green-900">Telefone</h4>
                    <p className="text-gray-700">+55 (11) 98765-4321 - Cobertura Nacional</p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-green-900">E-mail</h4>
                    <p className="text-gray-700">contato@leidycleaner.com.br</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <input 
                    type="text" 
                    placeholder="Seu nome" 
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <input 
                    type="email" 
                    placeholder="Seu e-mail" 
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <input 
                    type="tel" 
                    placeholder="Seu telefone" 
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <textarea 
                    placeholder="Sua mensagem" 
                    rows="6"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 resize-none"
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="w-full px-6 py-3 bg-green-700 text-white font-semibold rounded-full hover:bg-green-900 transition"
                >
                  Enviar Mensagem
                </button>
                {emailSubmitted && (
                  <p className="text-green-600 text-center">
                    Obrigado! Entraremos em contato em breve.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      <LeidyFooter />
    </>
  );
}

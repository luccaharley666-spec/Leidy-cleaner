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

      {/* Hero Section */}
      <section 
        className="hero pt-32 pb-20 text-white text-center bg-cover bg-center relative"
        style={{
          backgroundImage: "linear-gradient(rgba(46, 125, 50, 0.85), rgba(27, 94, 32, 0.9)), url('https://images.unsplash.com/[REDACTED_TOKEN]?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-5 leading-tight">
            Limpeza profissional para seu lar ou empresa
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Com a Leidy Cleaner, sua casa ou negócio ficam impecáveis. Utilizamos produtos ecológicos e técnicas modernas para garantir um ambiente limpo e saudável.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contato" className="px-8 py-3 bg-green-700 text-white font-semibold rounded-full hover:bg-green-900 transition transform hover:-translate-y-1 shadow-lg">
              Solicitar Orçamento
            </Link>
            <Link href="/servicos" className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-green-900 transition">
              Ver Serviços
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-green-900 mb-4 relative pb-4">
            Nossos Serviços
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-green-500"></span>
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Oferecemos uma completa gama de serviços de limpeza para atender todas as suas necessidades
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: 'fa-home',
                title: 'Limpeza Residencial',
                description: 'Serviço completo de limpeza para sua casa, incluindo salas, quartos, cozinha e banheiros.'
              },
              {
                icon: 'fa-building',
                title: 'Limpeza Comercial',
                description: 'Limpeza profissional para escritórios, lojas e outros estabelecimentos comerciais.'
              },
              {
                icon: 'fa-couch',
                title: 'Limpeza de Estofados',
                description: 'Limpeza profunda de sofás, cadeiras, colchões e outros estofados.'
              },
              {
                icon: 'fa-window-restore',
                title: 'Limpeza de Vidros',
                description: 'Deixe suas janelas, portas de vidro e fachadas brilhando como novas.'
              }
            ].map((service, idx) => (
              <div key={idx} className="bg-gray-100 rounded-lg p-6 text-center hover:shadow-lg transition transform hover:-translate-y-2">
                <i className={`fas ${service.icon} text-5xl text-green-700 mb-4 block`}></i>
                <h3 className="text-xl font-bold text-green-900 mb-3">{service.title}</h3>
                <p className="text-gray-700 text-sm">{service.description}</p>
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
                src="https://images.unsplash.com/[REDACTED_TOKEN]?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
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
                    <h4 className="font-bold text-green-900">Endereço</h4>
                    <p className="text-gray-700">Rua Limpeza, 123 - Centro, São Paulo - SP</p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <i className="fas fa-phone"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-green-900">Telefone</h4>
                    <p className="text-gray-700">(11) 99999-9999</p>
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

import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { ReviewSystem } from '../components/UI/ReviewSystem';

export default function ReviewsPage() {
  const stats = [
    { label: 'Avaliações Totais', value: '500+', icon: '⭐' },
    { label: 'Nota Média', value: '4.9/5', icon: '📊' },
    { label: 'Clientes Satisfeitos', value: '98%', icon: '😊' },
    { label: 'Recomendam', value: '95%', icon: '👍' }
  ];

  const highlights = [
    {
      text: '"Serviço impecável! Minha casa nunca ficou tão limpa. Profissionais pontuais e muito cuidadosos."',
      author: 'Maria Silva',
      service: 'Limpeza Residencial',
      rating: 5
    },
    {
      text: '"Empresa confiável e transparente. Os preços são justos e o resultado sempre supera as expectativas."',
      author: 'João Santos',
      service: 'Limpeza Comercial',
      rating: 5
    },
    {
      text: '"Contratei para limpeza pós-mudança e foi perfeito. Equipe organizada e produtos de qualidade."',
      author: 'Ana Costa',
      service: 'Limpeza Pós-Mudança',
      rating: 5
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            💬 O que Nossos Clientes Dizem
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Mais de 500 clientes satisfeitos confiam na Leidy Cleaner para manter seus espaços impecáveis
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            ✨ Depoimentos em Destaque
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((highlight, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
                <div className="flex mb-4">
                  {[...Array(highlight.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">⭐</span>
                  ))}
                </div>
                <blockquote className="text-gray-700 dark:text-gray-300 mb-4 italic">
                  "{highlight.text}"
                </blockquote>
                <div className="border-t border-gray-200 dark:border-slate-600 pt-4">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {highlight.author}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {highlight.service}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="flex-grow max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            📝 Todas as Avaliações
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Leia todas as avaliações e experiências dos nossos clientes
          </p>
        </div>
        <ReviewSystem />
      </main>

      <Footer />
    </div>
  );
}

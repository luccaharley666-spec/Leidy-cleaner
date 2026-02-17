import React from 'react'
import Link from 'next/link'
import { trackBlogRead, trackFormSubmit, trackCTAClick } from '../../utils/analytics'

export default function BlogSection() {
  const blogPosts = [
    {
      id: 1,
      title: '10 Dicas para Manter sua Casa Limpa entre os Serviços',
      excerpt: 'Aprenda técnicas simples para manter sua casa impecável sem gastar muito tempo. Pequenos hábitos que fazem grande diferença.',
      category: 'Dicas',
      readTime: '5 min',
      date: '15 de Março',
      icon: '💡'
    },
    {
      id: 2,
      title: 'Produtos Eco-Friendly: Por que usamos?',
      excerpt: 'Conheça os benefícios dos produtos sustentáveis para sua saúde e para o planeta. Limpeza eficaz sem prejudicar o meio ambiente.',
      category: 'Sustentabilidade',
      readTime: '7 min',
      date: '10 de Março',
      icon: '🌱'
    },
    {
      id: 3,
      title: 'Guia Completo: Como Limpar Diferentes Tipos de Piso',
      excerpt: 'Cada tipo de piso precisa de um tratamento especial. Descubra como cuidar de porcelanato, madeira, mosaico e muito mais.',
      category: 'Tutorial',
      readTime: '10 min',
      date: '5 de Março',
      icon: '🧹'
    },
    {
      id: 4,
      title: 'Por Que Contratar uma Limpeza Profissional?',
      excerpt: 'Mais do que economizar tempo, entenda os benefícios para sua saúde e bem-estar. Uma casa limpa influencia sua produtividade.',
      category: 'Saúde',
      readTime: '6 min',
      date: '28 de Fevereiro',
      icon: '❤️'
    },
    {
      id: 5,
      title: 'Sistema de Horas: Flexibilidade que você Merecia',
      excerpt: 'Conheça o revolucionário sistema de compra de horas. Pague uma vez e use quando quiser, sem contratos ou surpresas.',
      category: 'Novidades',
      readTime: '4 min',
      date: '20 de Fevereiro',
      icon: '⏰'
    },
    {
      id: 6,
      title: 'Limpeza Pós-Obra: O Que Você Precisa Saber',
      excerpt: 'A limpeza após uma reforma é fundamental. Saiba quais são as etapas, o que esperar e como garantir um resultado perfeito.',
      category: 'Profissional',
      readTime: '8 min',
      date: '15 de Fevereiro',
      icon: '🏗️'
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-white to-green-50 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Blog & Dicas 📝
          </h2>
          <p className="text-xl text-gray-600">
            Conteúdo útil sobre limpeza, organização e bem-estar
          </p>
        </div>

        {/* Featured Post */}
        <div
          data-aos="fade-up"
          className="mb-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg overflow-hidden shadow-xl text-white"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center p-8 md:p-12">
            <div>
              <div className="inline-block bg-white/20 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                📌 Destaque
              </div>
              <h3 className="text-3xl font-bold mb-4">
                10 Dicas para Manter sua Casa Limpa entre os Serviços
              </h3>
              <p className="text-green-100 mb-6">
                Aprenda técnicas simples que fazem grande diferença. Pequenos hábitos que mantêm sua casa impecável sem esforço excessivo.
              </p>
              <div className="flex gap-4 text-sm">
                <span>💡 Dicas</span>
                <span>📅 15 de Março</span>
                <span>⏱️ 5 min</span>
              </div>
              <button className="mt-6 px-6 py-2 bg-white text-green-600 font-bold rounded-lg hover:bg-green-50 transition">
                Ler Artigo →
              </button>
            </div>
            <div className="hidden md:block text-6xl text-center opacity-40">💡</div>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.slice(1).map((post, i) => (
            <div
              key={post.id}
              data-aos="fade-up"
              data-aos-delay={i * 100}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden group cursor-pointer"
            >
              {/* Header com icone e categoria */}
              <div className="h-32 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center group-hover:from-green-200 group-hover:to-emerald-200 transition">
                <span className="text-6xl">{post.icon}</span>
              </div>

              {/* Conteúdo */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-500">{post.readTime}</span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition">
                  {post.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500">{post.date}</span>
                  <a href="#" className="text-green-600 font-semibold text-sm hover:text-green-700">
                    Ler →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Newsletter */}
        <div className="mt-16 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Receba nossos artigos no seu email 💌
          </h3>
          <p className="text-gray-600 mb-6">
            Dicas semanais para manter sua casa limpa e bem cuidada
          </p>
          <form 
            onSubmit={ (e) => {
              e.preventDefault();
              const email = e.target[0].value;
              trackFormSubmit('decoded', { email });
            }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="seu@email.com"
              className="flex-1 px-4 py-3 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg transition"
            >
              Inscrever
            </button>
          </form>
        </div>

        {/* Ver Todos */}
        <div className="mt-8 text-center">
          <a 
            href="/blog" 
            onClick={() => trackCTAClick('Ver todos os artigos', 'blog')}
            className="inline-block px-8 py-3 text-green-600 font-bold hover:text-green-700 text-lg"
          >
            Ver todos os artigos →
          </a>
        </div>
      </div>
    </section>
  )
}

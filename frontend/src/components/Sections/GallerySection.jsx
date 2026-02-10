import React, { useState } from 'react'
import { trackGalleryFilter, trackCTAClick } from '../../utils/analytics'

export default function GallerySection() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const gallery = [
    {
      id: 1,
      category: 'residential',
      title: 'Limpeza Residencial',
      description: 'Antes & Depois',
      icon: '🏠',
      image: 'https://images.unsplash.com/[REDACTED_TOKEN]?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60'
    },
    {
      id: 2,
      category: 'commercial',
      title: 'Limpeza Comercial',
      description: 'Escritórios impecáveis',
      icon: '🏢',
      image: 'https://images.unsplash.com/[REDACTED_TOKEN]?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60'
    },
    {
      id: 3,
      category: 'poswork',
      title: 'Limpeza Pós-Obra',
      description: 'Espaço transformado',
      icon: '🏗️',
      image: 'https://images.unsplash.com/[REDACTED_TOKEN]?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60'
    },
    {
      id: 4,
      category: 'residential',
      title: 'Quartos Organizados',
      description: 'Organização perfeita',
      icon: '🛏️',
      image: 'https://images.unsplash.com/[REDACTED_TOKEN]?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60'
    },
    {
      id: 5,
      category: 'commercial',
      title: 'Limpeza de Vidros',
      description: 'Brilho cristalino',
      icon: '🪟',
      image: 'https://images.unsplash.com/[REDACTED_TOKEN]?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60'
    },
    {
      id: 6,
      category: 'poswork',
      title: 'Limpeza Profunda',
      description: 'Cada detalhe importa',
      icon: '✨',
      image: 'https://images.unsplash.com/[REDACTED_TOKEN]?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60'
    },
    {
      id: 7,
      category: 'residential',
      title: 'Cozinhas Limpas',
      description: 'Pronta para cozinhar',
      icon: '🍳',
      image: 'https://images.unsplash.com/[REDACTED_TOKEN]?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60'
    },
    {
      id: 8,
      category: 'commercial',
      title: 'Ambientes Corporativos',
      description: 'Profissionalismo em cada canto',
      icon: '💼',
      image: 'https://images.unsplash.com/[REDACTED_TOKEN]?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60'
    }
  ]

  const categories = [
    { value: 'all', label: '🎯 Todos' },
    { value: 'residential', label: '🏠 Residencial' },
    { value: 'commercial', label: '🏢 Comercial' },
    { value: 'poswork', label: '🏗️ Pós-Obra' }
  ]

  const filtered = selectedCategory === 'all'
    ? gallery
    : gallery.filter(item => item.category === selectedCategory)

  return (
    <section className="py-20 bg-white px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Galeria de Trabalhos 📸
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Confira alguns dos nossos melhores trabalhos
          </p>

          {/* Filtros */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setSelectedCategory(cat.value);
                  trackGalleryFilter(cat.label);
                }}
                className={`px-6 py-2 rounded-full font-semibold transition ${
                  selectedCategory === cat.value
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Galeria Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((item, i) => (
            <div
              key={item.id}
              data-aos="zoom-in"
              data-aos-delay={i * 50}
              className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition cursor-pointer h-64"
            >
              {/* Imagem */}
              <div
                className="w-full h-full bg-cover bg-center transition transform group-hover:scale-110"
                style={{
                  backgroundImage: `url(${item.image})`
                }}
              >
                {/* Overlay escuro no hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-green-900 via-green-900/50 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-6">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-green-100">{item.description}</p>
                </div>
              </div>

              {/* Badge no canto */}
              <div className="absolute top-3 right-3 text-3xl bg-white/90 backdrop-blur-sm w-12 h-12 flex items-center justify-center rounded-full shadow-lg">
                {item.icon}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-8 border border-green-200">
          <p className="text-gray-700 mb-4">
            Gostou do que pode fazer por sua casa?
          </p>
          <a
            href="/HourCheckout"
            onClick={() => trackCTAClick('Agende Agora', 'gallery')}
            className="inline-block px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:shadow-xl transition"
          >
            Agende Agora →
          </a>
        </div>
      </div>
    </section>
  )
}

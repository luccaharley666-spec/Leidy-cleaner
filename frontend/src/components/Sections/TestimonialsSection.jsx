import React from 'react'
import {  } from '../../utils/analytics'

export default function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      name: 'Mariana Silva',
      role: 'Executiva',
      text: 'Adorei o sistema de horas! Paguei uma vez e usei ao longo de 3 meses. Flexibilidade perfeita para minha rotina de trabalho.',
      rating: 5,
      image: '👩‍💼'
    },
    {
      id: 2,
      name: 'João Santos',
      role: 'Empresário',
      text: 'Contratei para limpar o escritório. A qualidade é excelente e o preço transparente. Recomendo!',
      rating: 5,
      image: '👨‍💼'
    },
    {
      id: 3,
      name: 'Ana Costa',
      role: 'Mãe de família',
      text: 'Excelente serviço! As meninas são educadas, cuidadosas com meus móveis e plantas. Voltam com regularidade.',
      rating: 5,
      image: '👩‍🦰'
    },
    {
      id: 4,
      name: 'Roberto Alves',
      role: 'Comerciante',
      text: 'Para limpeza pós-obra foi perfeito! Saíram os escombros e tudo ficou brilhando. Muito profissional.',
      rating: 5,
      image: '👨‍🦱'
    },
    {
      id: 5,
      name: 'Carla Mendes',
      role: 'Produtora de eventos',
      text: 'Ideia genial de pagar por horas! Chamei várias vezes para eventos diferentes. Excelente relação custo-benefício.',
      rating: 5,
      image: '👩‍🦲'
    },
    {
      id: 6,
      name: 'Felipe Gomes',
      role: 'Médico',
      text: 'Qualidade premium! Limpam meu consultório com atenção aos detalhes. Meus pacientes sempre comentam o quanto está limpo.',
      rating: 5,
      image: '👨‍⚕️'
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-white to-green-50 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            O que nossos clientes dizem 💬
          </h2>
          <p className="text-xl text-gray-600">
            Mais de 500 clientes satisfeitos em Porto Alegre
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <div
              key={testimonial.id}
              data-aos="fade-up"
              data-aos-delay={i * 100}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border-l-4 border-green-500 cursor-pointer"
              onClick={ () =>(testimonial.name) }
            >
              {/* Stars */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="text-4xl">{testimonial.image}</div>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social Proof Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center bg-green-50 rounded-lg p-8 border border-green-200">
          <div>
            <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
            <p className="text-gray-700">Clientes satisfeitos</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-600 mb-2">4.9/5</div>
            <p className="text-gray-700">Avaliação média</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-600 mb-2">5000+</div>
            <p className="text-gray-700">Horas de limpeza</p>
          </div>
        </div>
      </div>
    </section>
  )
}

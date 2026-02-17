import React from 'react';
import Link from 'next/link';

export default function LeidyFooter() {
  return (
    <footer className="site-footer bg-green-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: About */}
          <div>
            <div className="text-2xl font-bold mb-3">
              Leidy<span className="text-green-400">Cleaner</span>
            </div>
            <p className="text-gray-300 mb-4 text-sm">
              Serviços de limpeza profissional com qualidade, confiança e compromisso com o meio ambiente.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex items-center justify-center hover:bg-green-500 transition transform hover:-translate-y-1">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex items-center justify-center hover:bg-green-500 transition transform hover:-translate-y-1">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex items-center justify-center hover:bg-green-500 transition transform hover:-translate-y-1">
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-400">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-gray-300 hover:text-green-400 transition nav-link">Início</Link></li>
              <li><Link href="/servicos" className="text-gray-300 hover:text-green-400 transition nav-link">Serviços</Link></li>
              <li><Link href="/sobre" className="text-gray-300 hover:text-green-400 transition nav-link">Sobre Nós</Link></li>
              <li><Link href="/contato" className="text-gray-300 hover:text-green-400 transition nav-link">Contato</Link></li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-400">Serviços</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-300 hover:text-green-400 transition">Limpeza Residencial</a></li>
              <li><a href="#" className="text-gray-300 hover:text-green-400 transition">Limpeza Comercial</a></li>
              <li><a href="#" className="text-gray-300 hover:text-green-400 transition">Limpeza de Estofados</a></li>
              <li><a href="#" className="text-gray-300 hover:text-green-400 transition">Limpeza de Vidros</a></li>
            </ul>
          </div>

          {/* Column 4: Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-400">Horário de Atendimento</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Segunda a Sexta: 8h às 18h</li>
              <li>Sábado: 8h às 12h</li>
              <li>Domingo: Fechado</li>
              <li>Atendimento 24h para emergências</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center py-6 border-t border-gray-700 text-sm text-gray-400">
          <p>&copy; 2024 Leidy Cleaner. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

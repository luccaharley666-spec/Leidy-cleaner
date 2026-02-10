import React, { useState } from 'react';
import Link from 'next/link';
import { apiCall } from '../../config/api';

/**
 * Footer Component - Premium com newsletter e redes sociais
 */
export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState(null);
  const currentYear = new Date().getFullYear();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Por favor, insira um email');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiCall('/api/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim(),
          name: null
        })
      });

      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    } catch (err) {
      setError(err.message || 'Erro ao inscrever. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const footerLinks = [
    {
      title: 'Produto',
      links: [
        { label: 'Serviços', href: '/servicos' },
        { label: 'Agendar', href: '/agendar' },
        { label: 'Preços', href: '/#pricing' },
        { label: 'Blog', href: '#' }
      ]
    },
    {
      title: 'Empresa',
      links: [
        { label: 'Sobre', href: '#' },
        { label: 'Contato', href: '#' },
        { label: 'Carreiras', href: '#' },
        { label: 'Parcerias', href: '#' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacidade', href: '#' },
        { label: 'Termos', href: '#' },
        { label: 'Cookies', href: '#' },
        { label: 'LGPD', href: '#' }
      ]
    }
  ];

  const socialLinks = [
    { icon: '📱', label: 'WhatsApp', href: 'https://wa.me/5551980303740', color: 'hover:text-green-500' },
    { icon: '📘', label: 'Facebook', href: '#', color: 'hover:text-blue-600' },
    { icon: '📸', label: 'Instagram', href: '#', color: 'hover:text-pink-500' },
    { icon: '🎥', label: 'TikTok', href: '#', color: 'hover:text-black dark:hover:text-white' }
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-950 border-t border-gray-200 dark:border-slate-700 mt-20">
      {/* Top Section - CTA */}
      <div className="border-b border-gray-200 dark:border-slate-700 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-600 to-cyan-500 rounded-2xl px-6 sm:px-12 py-10 sm:py-14 text-white text-center shadow-lg">
            <h3 className="text-2xl sm:text-3xl font-bold mb-3">Pronto para Agendar?</h3>
            <p className="text-blue-100 mb-6 text-lg">Solicite um orçamento sem compromisso hoje mesmo</p>
            <Link href="/agendar">
              <div className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:shadow-lg hover:scale-105 transition-all">
                <span>📅</span>
                Agendar Agora
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-1 lg:col-span-2">
            <Link href="/">
              <div className="flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity">
                <div className="relative w-14 h-14 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  🧹
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h4 className="text-xl font-black bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
                    Leidy Cleaner
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Limpeza Premium</p>
                </div>
              </div>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Especialista em limpeza profissional com técnicas modernas e produtos eco-friendly.
            </p>
            {/* Social Links */}
                <div className="flex gap-3 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-800 flex items-center justify-center text-xl hover:bg-gradient-to-br hover:from-purple-600 hover:to-cyan-500 hover:text-white transition-all ${social.color}`}
                  title={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p className="flex items-center gap-2">
                <span>📞</span> +55 51 98030-3740
              </p>
              <p className="flex items-center gap-2">
                <span>📧</span> contato@leidycleaner.com
              </p>
              <p className="flex items-center gap-2">
                <span>📍</span> Porto Alegre, RS - Brasil
              </p>
            </div>
          </div>

          {/* Links Columns */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                {section.title}
                <span className="w-1 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"></span>
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>
                      <span className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all inline-block">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-200 dark:border-slate-700 pt-12 mb-12">
          <div className="max-w-md">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              ✉️ Fique Atualizado
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Receba dicas de limpeza e promoções exclusivas
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 mb-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white [REDACTED_TOKEN] dark:[REDACTED_TOKEN] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all disabled:opacity-50"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-bold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Inscrever'}
              </button>
            </form>
            {subscribed && (
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2 animate-pulse">
                ✅ Inscrição realizada com sucesso!
              </p>
            )}
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                ❌ {error}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-200 dark:border-slate-700 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <p>© {currentYear} Leidy Cleaner. Todos os direitos reservados.</p>
            <div className="flex gap-4 flex-wrap justify-center">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Status Online
              </span>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

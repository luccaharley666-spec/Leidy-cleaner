'use client';

import React, { useState, useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image'
import ThemeSelector from '../UI/ThemeSelector';
import SiteSearch from '../UI/SiteSearch';
import { ThemeContext } from '../../context/ThemeContext';

/**
 * Header Component - Premium com logo visual e temas integrados
 */
export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme } = useContext(ThemeContext);

  const navLinks = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/servicos', label: 'Serviços', icon: '✨' },
    { href: '/register', label: 'Criar Conta', icon: '🔐' },
    { href: '/#como_funciona', label: 'Como Funciona', icon: '🔄', isAnchor: true },
    { href: '/minha-conta', label: 'Minha Conta', icon: '👤' }
  ];

  // Cores do header baseadas no tema
  const getHeaderClasses = () => {
    switch(theme) {
      case 'light':
        return 'bg-white shadow-sm';
      case 'dark':
        return 'bg-gray-950 shadow-xl';
      case 'high-contrast':
        return 'bg-black border-b-4 border-white shadow-lg';
      case 'pastel':
        return 'bg-gradient-to-r from-purple-100 to-pink-100 shadow-lg';
      case 'cyberpunk':
        return 'bg-black border-b-2 border-cyan-500 shadow-lg shadow-cyan-500/50';
      case 'forest':
        return 'bg-gradient-to-r from-green-900 to-green-800 shadow-lg';
      default:
        return 'bg-white dark:bg-gray-950';
    }
  };

  const getTextClasses = (isDark = false) => {
    switch(theme) {
      case 'light':
        return 'text-gray-900';
      case 'dark':
        return 'text-gray-50';
      case 'high-contrast':
        return 'text-white';
      case 'pastel':
        return 'text-gray-800';
      case 'cyberpunk':
        return 'text-cyan-400';
      case 'forest':
        return 'text-green-100';
      default:
        return isDark ? 'text-gray-50' : 'text-gray-900';
    }
  };

  return (
    <header className={`sticky top-0 z-50 ${getHeaderClasses()} transition-colors duration-300`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">
        {/* Logo + Brand with Theme Image */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity group">
              {/* Brand Image - Circular with Border */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-xl overflow-hidden border-2 border-green-500 dark:border-green-400 hover:border-green-400 hover:dark:border-green-300 transition-all hover:shadow-lg hover:shadow-green-500/50 animate-pulse-slow bg-white dark:bg-slate-800">
                <Image 
                  src="/images/logo-leidy.svg" 
                  alt="Leidy Cleaner" 
                  width={64} 
                  height={64} 
                  className="object-cover group-hover:scale-110 duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
              </div>
              {/* Text Brand */}
              <div>
                <h1 className={`text-xl sm:text-2xl font-black drop-shadow-sm ${
                  theme === 'high-contrast' 
                    ? 'text-white' 
                    : theme === 'pastel'
                    ? 'text-gray-800'
                    : 'text-green-700 dark:text-green-400'
                }`}>
                  Leidy Cleaner
                </h1>
                <p className={`text-xs sm:text-sm font-medium ${
                  theme === 'high-contrast'
                    ? 'text-white'
                    : theme === 'pastel'
                    ? 'text-purple-700'
                    : 'text-green-600 dark:text-green-300'
                }`}>
                  Limpeza Profissional
                </p>
              </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-2 group ${
                  theme === 'high-contrast'
                    ? 'text-white border border-white hover:bg-white hover:text-black'
                    : theme === 'pastel'
                    ? 'text-gray-800 hover:bg-purple-200/50'
                    : 'text-green-700 dark:text-green-300 hover:bg-green-100/20 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-200'
                }`}
              >
                  <span className="group-hover:scale-125 transition-transform">{link.icon}</span>
                  {link.label}
              </Link>
            ))}
          </nav>

          {/* Site search (desktop) */}
          <SiteSearch className="ml-4" />

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeSelector />
            <Link 
              href="/HourCheckout" 
              className={`hidden sm:inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all font-bold text-sm shadow-lg duration-300 ${
                theme === 'high-contrast'
                  ? 'bg-white text-black hover:bg-yellow-300'
                  : theme === 'pastel'
                  ? 'bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-300 hover:to-pink-300 hover:shadow-pink-300/50'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 hover:shadow-indigo-500/50'
              }`}
            >
                <span>💰</span>
                Pagar Faxinha
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-3 rounded-xl transition-all ${
                theme === 'high-contrast'
                  ? 'text-white border border-white hover:bg-white hover:text-black'
                  : theme === 'pastel'
                  ? 'text-purple-700 hover:bg-purple-200/50'
                  : 'text-green-700 dark:text-green-300 hover:bg-green-100/20 dark:hover:bg-green-900/30'
              }`}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className={`lg:hidden pb-4 space-y-2 pt-4 animate-in fade-in slide-up ${
            theme === 'high-contrast'
              ? 'border-t-2 border-white'
              : theme === 'pastel'
              ? 'border-t border-purple-300'
              : 'border-t border-green-200 dark:border-green-800'
          }`}>
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`block px-4 py-3 rounded-lg transition-colors font-medium flex items-center gap-2 ${
                  theme === 'high-contrast'
                    ? 'text-white border border-white hover:bg-white hover:text-black'
                    : theme === 'pastel'
                    ? 'text-gray-800 hover:bg-purple-200/30'
                    : 'text-green-700 dark:text-green-300 hover:bg-green-100/20 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-200'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                  <span>{link.icon}</span>
                  {link.label}
              </Link>
            ))}
            <Link 
              href="/HourCheckout" 
              className={`block px-4 py-3 mt-4 rounded-lg font-bold text-center transition-all ${
                theme === 'high-contrast'
                  ? 'bg-white text-black hover:bg-yellow-300'
                  : theme === 'pastel'
                  ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white hover:from-purple-300 hover:to-pink-300'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-500 hover:to-indigo-400 hover:shadow-lg'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
                💳 Pagar Faxinha Agora
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ThemeContext } from '../../context/ThemeContext';

export default function LeidyHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isActive = (path) => router.pathname === path;

  return (
    <header className={`site-header ${theme === 'dark' ? 'bg-gray-900 shadow-2xl' : 'bg-white shadow-md'} fixed w-full top-0 z-50 transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 logo">
            <div className="text-3xl text-green-700">
              <i className="fas fa-spray-can"></i>
            </div>
            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : ''}`}>
              Leidy<span className="text-green-500">Cleaner</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <ul className="flex gap-8 list-none">
              <li>
                <Link href="/" className={`font-semibold transition-colors nav-link ${isActive('/') ? 'text-green-600' : theme === 'dark' ? 'text-gray-300 hover:text-green-400' : 'text-green-900 hover:text-green-500'}`}>
                  Início
                </Link>
              </li>
              <li>
                <Link href="/servicos" className={`font-semibold transition-colors nav-link ${isActive('/servicos') ? 'text-green-600' : theme === 'dark' ? 'text-gray-300 hover:text-green-400' : 'text-green-900 hover:text-green-500'}`}>
                  Serviços
                </Link>
              </li>
              <li>
                <Link href="/sobre" className={`font-semibold transition-colors nav-link ${isActive('/sobre') ? 'text-green-600' : theme === 'dark' ? 'text-gray-300 hover:text-green-400' : 'text-green-900 hover:text-green-500'}`}>
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/contato" className={`font-semibold transition-colors nav-link ${isActive('/contato') ? 'text-green-600' : theme === 'dark' ? 'text-gray-300 hover:text-green-400' : 'text-green-900 hover:text-green-500'}`}>
                  Contato
                </Link>
              </li>
            </ul>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-label="Alternar modo escuro"
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.121-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm5.657-9.193a1 1 0 00-1.414 0l-.707.707A1 1 0 005.05 6.464l.707-.707a1 1 0 001.414-1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"></path>
                </svg>
              )}
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-label="Alternar modo escuro"
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.121-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm5.657-9.193a1 1 0 00-1.414 0l-.707.707A1 1 0 005.05 6.464l.707-.707a1 1 0 001.414-1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"></path>
                </svg>
              )}
            </button>
            
            <button
              onClick={toggleMobileMenu}
              className="mobile-menu-button bg-transparent border-none text-2xl cursor-pointer"
              style={{ color: theme === 'dark' ? '#ffffff' : '#1b5e20' }}
            >
              <i className={`fas fa-${mobileMenuOpen ? 'times' : 'bars'}`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden ${theme === 'dark' ? 'bg-gray-800 shadow-2xl' : 'bg-white shadow-md'} absolute top-full left-0 w-full border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <ul className="list-none p-4 space-y-3">
              <li>
                <Link href="/" className={`block font-semibold py-3 px-4 rounded transition ${theme === 'dark' ? 'text-gray-300 hover:text-green-400 hover:bg-gray-700' : 'text-green-900 hover:bg-gray-100 hover:text-green-600'}`} onClick={closeMobileMenu}>
                  Início
                </Link>
              </li>
              <li>
                <Link href="/servicos" className={`block font-semibold py-3 px-4 rounded transition ${theme === 'dark' ? 'text-gray-300 hover:text-green-400 hover:bg-gray-700' : 'text-green-900 hover:bg-gray-100 hover:text-green-600'}`} onClick={closeMobileMenu}>
                  Serviços
                </Link>
              </li>
              <li>
                <Link href="/sobre" className={`block font-semibold py-3 px-4 rounded transition ${theme === 'dark' ? 'text-gray-300 hover:text-green-400 hover:bg-gray-700' : 'text-green-900 hover:bg-gray-100 hover:text-green-600'}`} onClick={closeMobileMenu}>
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/contato" className={`block font-semibold py-3 px-4 rounded transition ${theme === 'dark' ? 'text-gray-300 hover:text-green-400 hover:bg-gray-700' : 'text-green-900 hover:bg-gray-100 hover:text-green-600'}`} onClick={closeMobileMenu}>
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/admin-dashboard" className="block px-6 py-2 bg-green-700 text-white font-semibold rounded-full text-center hover:bg-green-900 transition mt-2" onClick={closeMobileMenu}>
                  Dashboard Admin
                </Link>
              </li>
              <li>
                <Link href="/contato" className="block px-6 py-2 bg-green-700 text-white font-semibold rounded-full text-center hover:bg-green-900 transition" onClick={closeMobileMenu}>
                  Solicitar Orçamento
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}

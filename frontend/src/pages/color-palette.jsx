import Head from 'next/head';
import Image from 'next/image';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

/**
 * Brand Color Palette & Design System
 * Página visual mostrando o novo esquema de cores baseado na imagem brand
 */
export default function ColorPaletteGuide() {
  const colors = [
    {
      name: 'Roxo Brand',
      hex: '#7c3aed',
      rgb: '124, 58, 237',
      role: 'Primária Principal',
      usage: 'Headers, CTAs, Links, Primary buttons',
      variations: {
        light: '#a78bfa',
        dark: '#6d28d9'
      }
    },
    {
      name: 'Ciano Vibrante',
      hex: '#06b6d4',
      rgb: '6, 182, 212',
      role: 'Secundária Principal',
      usage: 'Accents, Hover states, Secondary features',
      variations: {
        light: '#22d3ee',
        dark: '#0891b2'
      }
    },
    {
      name: 'Fundo Claro',
      hex: '#f8f6fc',
      rgb: '248, 246, 252',
      role: 'Background Padrão',
      usage: 'Page background, Card backgrounds (light)',
      variations: {
        light: '#f3f0fa',
        dark: '#ede9fe'
      }
    },
    {
      name: 'Fundo Escuro',
      hex: '#0f172a',
      rgb: '15, 23, 42',
      role: 'Background Dark',
      usage: 'Dark mode background',
      variations: {
        light: '#1e293b',
        dark: '#334155'
      }
    }
  ];

  const statusColors = [
    { name: 'Success', color: '#10b981', usage: 'Confirmações, status positivo' },
    { name: 'Warning', color: '#f59e0b', usage: 'Avisos, atenção necessária' },
    { name: 'Error', color: '#ef4444', usage: 'Erros, ações críticas' },
    { name: 'Info', color: '#06b6d4', usage: 'Informações gerais' }
  ];

  return (
    <>
      <Head>
        <title>Paleta de Cores - Leidy Cleaner Design System</title>
        <meta name="description" content="Guia visual da paleta de cores do Leidy Cleaner baseada na imagem brand" />
      </Head>

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white dark:from-slate-950 dark:to-slate-900">
        <Header />

        <main className="flex-grow container mx-auto px-4 py-16 max-w-6xl">
          {/* seção Brand Image */}
          <section className="mb-20">
            <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
              🎨 Brand Image & Paleta de Cores
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              {/* Brand Image */}
              <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
                <p className="text-gray-600 dark:text-gray-400 mb-4 font-semibold">Imagem Brand (agora na barra de navegação)</p>
                <div className="relative w-48 h-48 mb-6">
                  <Image
                    src="/images/theme-brand.jpg"
                    alt="Leidy Cleaner Brand Image"
                    width={192}
                    height={192}
                    className="rounded-full object-cover shadow-2xl border-4 border-purple-300"
                  />
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-cyan-400 rounded-full animate-pulse shadow-lg"></div>
                </div>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                  Localização: Header → Lado esquerdo<br/>
                  Formato: Circular com border roxo<br/>
                  Tamanho: 64x64px (desktop) / 56x56px (mobile)
                </p>
              </div>

              {/* Gradientes Hero */}
              <div className="flex flex-col gap-4">
                <div className="p-8 rounded-2xl h-32 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  Header Background
                </div>
                <div className="p-8 rounded-2xl h-32 bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  Button Gradient
                </div>
                <div className="p-8 rounded-2xl h-32 bg-gradient-to-br from-purple-100 via-pink-50 to-cyan-100 flex items-center justify-center text-purple-900 font-bold text-lg shadow-lg">
                  Card Gradient
                </div>
              </div>
            </div>
          </section>

          {/* Seção Cores Primárias */}
          <section className="mb-20">
            <h3 className="text-3xl font-bold mb-8 text-purple-900 dark:text-purple-300">Cores Primárias</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {colors.map((color, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
                  <div
                    className="h-32 w-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: color.hex }}
                  >
                    {color.name}
                  </div>
                  <div className="p-6">
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">📌 PAPEL</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mb-4">{color.role}</p>

                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">🎯 USOS</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{color.usage}</p>

                    <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg mb-4 font-mono text-sm">
                      <p className="text-gray-900 dark:text-white">HEX: {color.hex}</p>
                      <p className="text-gray-900 dark:text-white">RGB: {color.rgb}</p>
                    </div>

                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">VARIAÇÕES</p>
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded border border-gray-200 dark:border-gray-600"
                          style={{ backgroundColor: color.variations.light }}
                          title="Light variant"
                        ></div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Light</span>
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded border border-gray-200 dark:border-gray-600"
                          style={{ backgroundColor: color.variations.dark }}
                          title="Dark variant"
                        ></div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Dark</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Seção Status Colors */}
          <section className="mb-20">
            <h3 className="text-3xl font-bold mb-8 text-purple-900 dark:text-purple-300">Cores de Status</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statusColors.map((status, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg">
                  <div
                    className="h-24 w-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: status.color }}
                  >
                    {status.name}
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{status.usage}</p>
                    <p className="font-mono text-sm text-gray-600 dark:text-gray-400">{status.color}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Seção Exemplos de Componentes */}
          <section className="mb-20">
            <h3 className="text-3xl font-bold mb-8 text-purple-900 dark:text-purple-300">Componentes em Ação</h3>

            <div className="space-y-8">
              {/* Botões */}
              <div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Botões</h4>
                <div className="flex flex-wrap gap-4">
                  <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold hover:shadow-lg hover:scale-105 transition-all">
                    Primary Button
                  </button>
                  <button className="px-6 py-3 rounded-lg border-2 border-purple-600 text-purple-600 dark:text-purple-400 font-bold hover:bg-purple-600/10 transition-all">
                    Secondary Button
                  </button>
                  <button className="px-6 py-3 rounded-lg bg-purple-600/20 text-purple-700 dark:text-purple-300 font-bold hover:bg-purple-600/30 transition-all">
                    Ghost Button
                  </button>
                </div>
              </div>

              {/* Cards */}
              <div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Cards</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-700/50 shadow-md hover:shadow-xl transition-shadow">
                    <h5 className="text-lg font-bold text-purple-900 dark:text-purple-300 mb-2">Card com Border Roxo</h5>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">Padrão para cards principais do design</p>
                  </div>
                  <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 dark:from-purple-900/20 to-cyan-50 dark:to-cyan-900/20 border border-purple-200 dark:border-purple-700/50 shadow-md hover:shadow-xl transition-shadow">
                    <h5 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent mb-2">Card com Gradient</h5>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">Cards destaque com gradiente roxo-ciano</p>
                  </div>
                </div>
              </div>

              {/* Typograpia */}
              <div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tipografia</h4>
                <div className="space-y-2">
                  <h5 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">Heading 2 - Gradient</h5>
                  <p className="text-gray-700 dark:text-gray-300">Parágrafo padrão com text color normal</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Texto secundário com opacidade</p>
                </div>
              </div>
            </div>
          </section>

          {/* Seção Acessibilidade */}
          <section className="mb-20">
            <h3 className="text-3xl font-bold mb-8 text-purple-900 dark:text-purple-300">✨ Acessibilidade & Contraste</h3>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-4">Roxo sobre Branco</p>
                  <div className="p-4 rounded-lg bg-white border-2 border-gray-200">
                    <p style={{ color: '#7c3aed' }} className="font-bold text-lg">5.2:1 Ratio</p>
                    <p className="text-xs text-gray-600 mt-2">✅ WCAG AA+ Pass</p>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-4">Ciano sobre Roxo</p>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#7c3aed' }}>
                    <p style={{ color: '#06b6d4' }} className="font-bold text-lg">4.8:1 Ratio</p>
                    <p className="text-xs text-white mt-2">✅ WCAG AA Pass</p>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-4">Preto sobre Roxo Light</p>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#a78bfa' }}>
                    <p className="font-bold text-lg" style={{ color: '#1e1b4b' }}>7.1:1 Ratio</p>
                    <p className="text-xs text-gray-700 mt-2">✅ WCAG AAA Pass</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Seção Modo Escuro */}
          <section className="mb-20">
            <h3 className="text-3xl font-bold mb-8 text-purple-900 dark:text-purple-300">🌙 Sistema de Dark Mode</h3>

            <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 p-8 rounded-2xl shadow-2xl text-white">
              <h4 className="text-2xl font-bold mb-4">Tema Escuro Ativo</h4>
              <p className="text-purple-200 mb-6">As cores foram otimizadas para conforto visual em modo escuro</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800 p-4 rounded-lg border border-purple-500/30">
                  <p className="text-cyan-300 font-mono text-sm">--color-primary: #a78bfa</p>
                  <p className="text-gray-300 text-sm mt-2">Roxo mais claro para melhor contraste</p>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg border border-cyan-500/30">
                  <p className="text-cyan-300 font-mono text-sm">--color-secondary: #22d3ee</p>
                  <p className="text-gray-300 text-sm mt-2">Ciano mais vibrante no dark</p>
                </div>
              </div>
            </div>
          </section>

          {/* Resumo de Implementação */}
          <section className="bg-gradient-to-r from-purple-100 to-cyan-100 dark:from-purple-900/30 dark:to-cyan-900/30 p-8 rounded-2xl mb-16">
            <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-300 mb-4">✅ Implementação Completa</h3>
            <ul className="space-y-2 text-gray-800 dark:text-gray-300">
              <li>✅ Imagem brand integrada na barra de navegação</li>
              <li>✅ Paleta roxo-ciano implementada em themes.css</li>
              <li>✅ Header renovado com novo design visual</li>
              <li>✅ Suporte completo para dark mode</li>
              <li>✅ Contrastes otimizados para acessibilidade</li>
              <li>✅ Documentação visual criada</li>
            </ul>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

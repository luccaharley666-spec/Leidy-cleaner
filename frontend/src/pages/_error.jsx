/**
 * pages/_error.jsx
 * Global Error Handling Page
 */

import Head from 'next/head';
import Link from 'next/link';

function ErrorPage({ statusCode, title, message }) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <>
      <Head>
        <title>{statusCode ? `${statusCode} - Erro` : 'Erro'}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-950 p-4">
        <div className="text-center max-w-md">
          {/* Error Icon */}
          <div className="text-6xl mb-6 animate-bounce">
            {statusCode === 404 ? '🔍' : statusCode === 500 ? '⚠️' : '❌'}
          </div>

          {/* Status Code */}
          {statusCode && (
            <div className="text-5xl font-black text-gray-900 dark:text-white mb-2">
              {statusCode}
            </div>
          )}

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {title || 'Algo deu errado'}
          </h1>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
            {message || 'Desculpe, encontramos um erro ao processar sua solicitação.'}
          </p>

          {/* Details (Dev Only) */}
          {isDev && process.env.NODE_ENV === 'development' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6 text-left text-sm">
              <p className="text-red-800 dark:text-red-200 font-mono">
                Status: {statusCode}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all hover:shadow-lg">
              ← Voltar ao Home
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-all"
            >
              🔄 Tentar Novamente
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-sm text-gray-600 dark:text-gray-400">
            <p>
              Precisa de ajuda?{' '}
              <Link href="/contato" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">
                Entre em contato
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;

  const errorMap = {
    404: {
      title: 'Página não encontrada',
      message: 'A página que você procura não existe ou foi movida.'
    },
    500: {
      title: 'Erro interno do servidor',
      message: 'Estamos trabalhando para resolver este problema. Tente novamente em alguns minutos.'
    },
    503: {
      title: 'Serviço indisponível',
      message: 'O servidor está em manutenção. Tente novamente em breve.'
    } };

  const errorInfo = errorMap[statusCode] || {
    title: 'Erro desconhecido',
    message: 'Algo inesperado aconteceu. Tente novamente.'
  };

  return {
    statusCode,
    title: errorInfo.title,
    message: errorInfo.message };
};

export default ErrorPage;

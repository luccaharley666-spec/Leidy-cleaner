import React from 'react';
import { motion } from 'framer-motion';
import * as Sentry from '@sentry/react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0 };
  }

  static(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log erro para Sentry se disponível
    if (Sentry && Sentry.captureException) {
      Sentry.captureException(error, {
        contexts: {
          errorBoundary: {
            componentStack: errorInfo.componentStack,
            retryCount: this.state.retryCount } } });
    }

    // Log erro para console em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
    }
  }

  resetError = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1 }));
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isMaxRetries = this.state.retryCount >= 3;

      return (
        <motion.div
          className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8 border border-red-100"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="text-center mb-6">
              <motion.div
                className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
                animate={{
                  rotate: [0, 10, -10, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut" }}
              >
                <span className="text-3xl">⚠️</span>
              </motion.div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Algo deu errado
              </h1>

              <p className="text-gray-600 leading-relaxed">
                {isMaxRetries
                  ? "Parece que o problema persiste. Tente recarregar a página ou volte mais tarde."
                  : "Encontramos um erro inesperado. Você pode tentar novamente ou voltar para a página inicial."
                }
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <motion.details
                className="mb-6 p-4 bg-gray-50 rounded-lg text-sm border border-gray-200"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.3 }}
              >
                <summary className="cursor-pointer font-semibold text-gray-700 mb-2 flex items-center">
                  <span className="mr-2">🐛</span>
                  Detalhes Técnicos (Desenvolvimento)
                </summary>
                <div className="space-y-2">
                  <div className="text-xs font-mono bg-red-50 p-2 rounded text-red-800">
                    {this.state.error.toString()}
                  </div>
                  {this.state.errorInfo && (
                    <pre className="text-xs bg-gray-100 p-2 rounded whitespace-pre-wrap text-gray-700 max-h-32 overflow-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                  <div className="text-xs text-gray-500">
                    Tentativas de recuperação: {this.state.retryCount}
                  </div>
                </div>
              </motion.details>
            )}

            <div className="space-y-3">
              {!isMaxRetries && (
                <motion.button
                  onClick={this.resetError}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  🔄 Tentar Novamente
                </motion.button>
              )}

              <motion.button
                onClick={this.handleReload}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🔄 Recarregar Página
              </motion.button>

              <motion.button
                onClick={this.handleGoHome}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🏠 Voltar para Início
              </motion.button>
            </div>

            <motion.div
              className="mt-6 pt-4 border-t border-gray-200 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-xs text-gray-500">
                Se o problema persistir, entre em contato com nosso suporte.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Código do erro: {this.state.error?.name || 'UNKNOWN_ERROR'}
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

// Hook para usar Error Boundary em componentes funcionais
export function useErrorHandler() {
  return (error, errorInfo) => {
    if (Sentry && Sentry.captureException) {
      Sentry.captureException(error, {
        contexts: {
          hook: {
            componentStack: errorInfo?.componentStack } } });
    }
  };
}

// Componente wrapper para seções críticas
export function CriticalSection({ children, fallback = null }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}

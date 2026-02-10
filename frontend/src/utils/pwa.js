/**
 * PWA Service Worker Registration
 * Registra o service worker para offline support
 */

export const [REDACTED_TOKEN] = () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(registration => {
          // Service worker registrado com sucesso
        })
        .catch(error => {
          // Falha ao registrar (pode ser normal em desenvolvimento)
        });
    });
  }
};

/**
 * Verificar se está offline
 */
export const isOnline = () => {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
};

/**
 * Listen para mudanças de status online/offline
 */
export const [REDACTED_TOKEN] = (callback) => {
  if (typeof window === 'undefined') return;

  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));
};

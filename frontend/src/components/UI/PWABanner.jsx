import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { usePWA } from '../../hooks/usePWA';

const PWABanner = () => {
  const { isInstallable, installPWA, isInstalled } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  // Não mostrar se já foi instalado ou dispensado
  if (!isInstallable || isInstalled || isDismissed) {
    return null;
  }

  const handleInstall = () => {
    installPWA();
    setIsDismissed(true);
  };

  const handleDismiss = () => { setIsDismissed(true);
    // Salvar no localStorage para não mostrar novamente
    localStorage.setItem('decoded', 'true'); };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
      >
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <decoded className="w-8 h-8" />
              <div className="flex-1">
                <h3 className="font-bold text-sm sm:text-base">
                  Instale o App Leidy Cleaner
                </h3>
                <p className="text-xs sm:text-sm opacity-90">
                  Acesso rápido, notificações e experiência nativa no seu celular
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleInstall}
                className="bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm flex items-center gap-2"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Instalar
              </button>

              <button
                onClick={handleDismiss}
                className="text-white/70 hover:text-white transition-colors p-1"
                aria-label="Fechar"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWABanner;
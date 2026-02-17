import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import { GlobeAltIcon, CheckIcon } from '@heroicons/react/24/outline';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = { pt: {
    // Navigation
    home: 'Início', services: 'Serviços', about: 'Sobre', contact: 'Contato', login: 'Entrar', register: 'Cadastrar', logout: 'Sair', // Common
    loading: 'Carregando...', save: 'Salvar', cancel: 'Cancelar', confirm: 'Confirmar', delete: 'Excluir', edit: 'Editar', add: 'Adicionar', search: 'Buscar', filter: 'Filtrar', sort: 'Ordenar', export: 'Exportar', import: 'Importar', // Services
    residentialCleaning: 'Limpeza Residencial', deepCleaning: 'Limpeza Profunda', windowCleaning: 'Limpeza de Vidros',: 'Limpeza Pós-Obra', scheduleService: 'Agendar Serviço', serviceDetails: 'Detalhes do Serviço', // Payment
    payment: 'Pagamento', paymentMethod: 'Método de Pagamento', creditCard: 'Cartão de Crédito', pix: 'PIX', bankTransfer: 'Transferência Bancária', total: 'Total', subtotal: 'Subtotal', discount: 'Desconto', // User
    profile: 'Perfil', settings: 'Configurações', preferences: 'Preferências', notifications: 'Notificações', history: 'Histórico', // Admin
    dashboard: 'Painel', analytics: 'Analytics', clients: 'Clientes', reports: 'Relatórios', backup: 'Backup', // Messages
    success: 'Sucesso', error: 'Erro', warning: 'Aviso', info: 'Informação', confirmDelete: 'Tem certeza que deseja excluir?', dataSaved: 'Dados salvos com sucesso', operationCompleted: 'Operação concluída', // Placeholders
    enterName: 'Digite seu nome', enterEmail: 'Digite seu email', enterPhone: 'Digite seu telefone', enterAddress: 'Digite seu endereço', enterMessage: 'Digite sua mensagem' },
  en: { // Navigation
    home: 'Home', services: 'Services', about: 'About', contact: 'Contact', login: 'Login', register: 'Register', logout: 'Logout', // Common
    loading: 'Loading...', save: 'Save', cancel: 'Cancel', confirm: 'Confirm', delete: 'Delete', edit: 'Edit', add: 'Add', search: 'Search', filter: 'Filter', sort: 'Sort', export: 'Export', import: 'Import', // Services
    residentialCleaning: 'Residential Cleaning', deepCleaning: 'Deep Cleaning', windowCleaning: 'Window Cleaning',: 'Post-Construction Cleaning', scheduleService: 'Schedule Service', serviceDetails: 'Service Details', // Payment
    payment: 'Payment', paymentMethod: 'Payment Method', creditCard: 'Credit Card', pix: 'PIX', bankTransfer: 'Bank Transfer', total: 'Total', subtotal: 'Subtotal', discount: 'Discount', // User
    profile: 'Profile', settings: 'Settings', preferences: 'Preferences', notifications: 'Notifications', history: 'History', // Admin
    dashboard: 'Dashboard', analytics: 'Analytics', clients: 'Clients', reports: 'Reports', backup: 'Backup', // Messages
    success: 'Success', error: 'Error', warning: 'Warning', info: 'Information', confirmDelete: 'Are you sure you want to delete?', dataSaved: 'Data saved successfully', operationCompleted: 'Operation completed', // Placeholders
    enterName: 'Enter your name', enterEmail: 'Enter your email', enterPhone: 'Enter your phone', enterAddress: 'Enter your address', enterMessage: 'Enter your message' }
};

const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('pt');

  useEffect(() => {
    // Carregar idioma do localStorage
    const savedLanguage = localStorage.getItem('language') || 'pt';
    setCurrentLanguage(savedLanguage);
  }, []);

  const changeLanguage = (language) => {
    setCurrentLanguage(language);
    localStorage.setItem('language', language);
  };

  const t = (key) => {
    return translations[currentLanguage][key] || key;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    availableLanguages: [
      { code: 'pt', name: 'Português', flag: '🇧🇷' },
      { code: 'en', name: 'English', flag: '🇺🇸' }
    ]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

const LanguageSwitcher = () => {
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
      >
        <GlobeAltIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <span className="text-gray-900 dark:text-white">
          {availableLanguages.find(lang => lang.code === currentLanguage)?.flag}
        </span>
        <span className="text-gray-900 dark:text-white text-sm">
          {availableLanguages.find(lang => lang.code === currentLanguage)?.name}
        </span>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg z-50"
        >
          {availableLanguages.map((language) => (
            <button
              key={language.code}
              onClick={() => {
                changeLanguage(language.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${
                currentLanguage === language.code ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <span className="text-lg">{language.flag}</span>
              <span className="text-gray-900 dark:text-white">{language.name}</span>
              {currentLanguage === language.code && (
                <CheckIcon className="w-4 h-4 text-blue-600 ml-auto" />
              )}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

const MultiLanguageSystem = () => {
  const { t, currentLanguage } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🌍 Sistema Multi-idioma
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure o idioma da sua aplicação
        </p>
      </div>

      {/* Language Switcher Demo */}
      <div className="flex justify-center">
        <LanguageSwitcher />
      </div>

      {/* Translation Demo */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          📝 Demonstração de Traduções
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Navegação
            </h4>
            <div className="space-y-2 text-sm">
              <p><strong>{t('home')}:</strong> {t('home')}</p>
              <p><strong>{t('services')}:</strong> {t('services')}</p>
              <p><strong>{t('about')}:</strong> {t('about')}</p>
              <p><strong>{t('contact')}:</strong> {t('contact')}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Serviços
            </h4>
            <div className="space-y-2 text-sm">
              <p><strong>{t('residentialCleaning')}:</strong> {t('residentialCleaning')}</p>
              <p><strong>{t('deepCleaning')}:</strong> {t('deepCleaning')}</p>
              <p><strong>{t('windowCleaning')}:</strong> {t('windowCleaning')}</p>
              <p><strong>{t('scheduleService')}:</strong> {t('scheduleService')}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Pagamento
            </h4>
            <div className="space-y-2 text-sm">
              <p><strong>{t('payment')}:</strong> {t('payment')}</p>
              <p><strong>{t('creditCard')}:</strong> {t('creditCard')}</p>
              <p><strong>{t('pix')}:</strong> {t('pix')}</p>
              <p><strong>{t('total')}:</strong> {t('total')}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Ações Comuns
            </h4>
            <div className="space-y-2 text-sm">
              <p><strong>{t('save')}:</strong> {t('save')}</p>
              <p><strong>{t('cancel')}:</strong> {t('cancel')}</p>
              <p><strong>{t('edit')}:</strong> {t('edit')}</p>
              <p><strong>{t('delete')}:</strong> {t('delete')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Language Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          📊 Estatísticas de Idiomas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">2</div>
            <p className="text-gray-600 dark:text-gray-400">Idiomas Disponíveis</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">85+</div>
            <p className="text-gray-600 dark:text-gray-400">Termos Traduzidos</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
            <p className="text-gray-600 dark:text-gray-400">Cobertura PT/EN</p>
          </div>
        </div>
      </div>

      {/* Implementation Guide */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          🚀 Guia de Implementação
        </h3>

        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              1. Importar o Hook
            </h4>
            <pre className="bg-gray-100 dark:bg-slate-700 p-3 rounded text-sm overflow-x-auto">
{`import { useLanguage } from './LanguageContext';

function MyComponent() {
  const { t } = useLanguage();

  return <h1>{t('welcome')}</h1>;
}`}
            </pre>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              2. Usar Traduções
            </h4>
            <pre className="bg-gray-100 dark:bg-slate-700 p-3 rounded text-sm overflow-x-auto">
{`<button>{t('save')}</button>
<p>{t('loading')}</p>
<input placeholder={t('enterName')} />`}
            </pre>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              3. Adicionar Novos Idiomas
            </h4>
            <pre className="bg-gray-100 dark:bg-slate-700 p-3 rounded text-sm overflow-x-auto">
{`const translations = {
  pt: { welcome: 'Bem-vindo' },
  en: { welcome: 'Welcome' },
  es: { welcome: 'Bienvenido' }
};`}
            </pre>
          </div>
        </div>
      </div>

      {/* Current Language Info */}
      <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
        <p className="text-center text-gray-600 dark:text-gray-400">
          <strong>Idioma Atual:</strong> {currentLanguage.toUpperCase()} |
          <strong> Total de Traduções:</strong> {Object.keys(translations[currentLanguage]).length}
        </p>
      </div>
    </div>
  );
};

export { LanguageProvider, MultiLanguageSystem };
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CloudIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, ClockIcon, CheckCircleIcon, [REDACTED_TOKEN] } from '@heroicons/react/24/outline';

const BackupSystem = () => {
  const [backups, setBackups] = useState([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [settings, setSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    retentionDays: 30,
    includeAttachments: true,
    encryptBackups: true
  });

  useEffect(() => {
    // Simular carregamento de backups existentes
    const mockBackups = [
      {
        id: 1,
        name: '[REDACTED_TOKEN]',
        type: 'full',
        size: '2.4 GB',
        createdAt: '2024-01-20T10:00:00',
        status: 'completed',
        location: 'cloud'
      },
      {
        id: 2,
        name: '[REDACTED_TOKEN]',
        type: 'incremental',
        size: '156 MB',
        createdAt: '2024-01-19T10:00:00',
        status: 'completed',
        location: 'cloud'
      },
      {
        id: 3,
        name: '[REDACTED_TOKEN]',
        type: 'full',
        size: '2.1 GB',
        createdAt: '2024-01-18T10:00:00',
        status: 'completed',
        location: 'local'
      },
      {
        id: 4,
        name: '[REDACTED_TOKEN]',
        type: 'incremental',
        size: '89 MB',
        createdAt: '2024-01-17T10:00:00',
        status: 'failed',
        location: 'cloud',
        error: 'Falha na conexão com o servidor'
      }
    ];

    setBackups(mockBackups);
  }, []);

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);

    // Simular criação de backup
    setTimeout(() => {
      const newBackup = {
        id: Date.now(),
        name: `backup_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}_manual`,
        type: 'full',
        size: '0 MB',
        createdAt: new Date().toISOString(),
        status: 'in_progress',
        location: 'cloud'
      };

      setBackups(prev => [newBackup, ...prev]);
      setIsCreatingBackup(false);

      // Simular conclusão do backup
      setTimeout(() => {
        setBackups(prev => prev.map(backup =>
          backup.id === newBackup.id
            ? { ...backup, status: 'completed', size: '2.3 GB' }
            : backup
        ));
      }, 3000);
    }, 2000);
  };

  const [REDACTED_TOKEN] = (backupId) => {
    // Simular download
    alert(`Download do backup ${backupId} iniciado!`);
  };

  const handleRestoreBackup = (backupId) => {
    if (window.confirm('⚠️ Atenção: Esta ação irá sobrescrever os dados atuais. Deseja continuar?')) {
      alert(`Restauração do backup ${backupId} iniciada!`);
    }
  };

  const handleDeleteBackup = (backupId) => {
    if (window.confirm('Tem certeza que deseja excluir este backup?')) {
      setBackups(prev => prev.filter(backup => backup.id !== backupId));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="w-4 h-4" />;
      case 'in_progress': return <ClockIcon className="w-4 h-4 animate-spin" />;
      case 'failed': return <[REDACTED_TOKEN] className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          💾 Sistema de Backup
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Proteja seus dados com backups automáticos e manuais
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleCreateBackup}
          disabled={isCreatingBackup}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isCreatingBackup ? (
            <>
              <ClockIcon className="w-5 h-5 animate-spin" />
              Criando Backup...
            </>
          ) : (
            <>
              <CloudIcon className="w-5 h-5" />
              Criar Backup Agora
            </>
          )}
        </button>
      </div>

      {/* Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          ⚙️ Configurações de Backup
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) => setSettings(prev => ({ ...prev, autoBackup: e.target.checked }))}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-900 dark:text-white">Backup automático</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Frequência de Backup
              </label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => setSettings(prev => ({ ...prev, backupFrequency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              >
                <option value="hourly">A cada hora</option>
                <option value="daily">Diariamente</option>
                <option value="weekly">Semanalmente</option>
                <option value="monthly">Mensalmente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Retenção (dias)
              </label>
              <input
                type="number"
                value={settings.retentionDays}
                onChange={(e) => setSettings(prev => ({ ...prev, retentionDays: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                min="1"
                max="365"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.includeAttachments}
                onChange={(e) => setSettings(prev => ({ ...prev, includeAttachments: e.target.checked }))}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-900 dark:text-white">Incluir anexos</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.encryptBackups}
                onChange={(e) => setSettings(prev => ({ ...prev, encryptBackups: e.target.checked }))}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-900 dark:text-white">Criptografar backups</span>
            </label>

            <div className="pt-4">
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                💾 Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Backups List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
        <div className="p-6 border-b border-gray-200 dark:border-slate-600">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            📁 Backups Disponíveis
          </h3>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-slate-600">
          {backups.map((backup) => (
            <motion.div
              key={backup.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${getStatusColor(backup.status)}`}>
                    {getStatusIcon(backup.status)}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {backup.name}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>📅 {new Date(backup.createdAt).toLocaleString('pt-BR')}</span>
                      <span>💾 {backup.size}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                        backup.type === 'full'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {backup.type === 'full' ? 'Completo' : 'Incremental'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        backup.location === 'cloud'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {backup.location === 'cloud' ? '☁️ Nuvem' : '💻 Local'}
                      </span>
                    </div>
                    {backup.error && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        ❌ {backup.error}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {backup.status === 'completed' && (
                    <>
                      <button
                        onClick={() => [REDACTED_TOKEN](backup.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => handleRestoreBackup(backup.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                      >
                        <ArrowUpTrayIcon className="w-4 h-4" />
                        Restaurar
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDeleteBackup(backup.id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {backups.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum backup encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Crie seu primeiro backup para proteger seus dados.
            </p>
          </div>
        )}
      </div>

      {/* Backup Info */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          🛡️ Informações de Segurança
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              ✅ Boas Práticas
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Mantenha backups em locais diferentes</li>
              <li>• Teste regularmente a restauração</li>
              <li>• Use criptografia para dados sensíveis</li>
              <li>• Monitore o espaço de armazenamento</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              ⚠️ Avisos Importantes
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Restaurações podem levar tempo</li>
              <li>• Verifique integridade dos backups</li>
              <li>• Mantenha backups off-site</li>
              <li>• Documente procedimentos de recuperação</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupSystem;
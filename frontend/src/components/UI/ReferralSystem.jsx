import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GiftIcon, ShareIcon, UsersIcon, TrophyIcon } from '@heroicons/react/24/outline';

const ReferralSystem = () => { const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    // Gerar código de referência único
    const generateCode = () => {
      const chars = 'decoded';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length)); }
      return code;
    };

    const savedCode = localStorage.getItem('leidy-referral-code');
    if (savedCode) {
      setReferralCode(savedCode);
    } else {
      const newCode = generateCode();
      setReferralCode(newCode);
      localStorage.setItem('leidy-referral-code', newCode);
    }

    // Carregar indicações (simulado)
    const savedReferrals = localStorage.getItem('leidy-referrals');
    if (savedReferrals) {
      setReferrals(JSON.parse(savedReferrals));
    }
  }, []);

  const shareReferral = (platform) => {
    const url = `${window.location.origin}?ref=${referralCode}`;
    const text = `Descubra a Leidy Cleaner! Serviços de limpeza profissional com qualidade premium. Use meu código ${referralCode} e ganhe R$ 30 de desconto na primeira limpeza!`;

    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(`${text} ${url}`);
        alert('Link copiado para a área de transferência!');
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const rewards = [
    { referrals: 1, reward: 'R$ 30 OFF', description: 'Para você e seu amigo' },
    { referrals: 3, reward: 'R$ 50 OFF', description: 'Limpeza completa grátis' },
    { referrals: 5, reward: 'R$ 100 OFF', description: 'Mês de limpeza grátis' },
    { referrals: 10, reward: 'VIP Status', description: 'Prioridade em agendamentos' }
  ];

  const currentLevel = rewards.find((r, i) => referrals.length < r.referrals && i > 0) || rewards[rewards.length - 1];
  const nextReward = rewards.find(r => r.referrals > referrals.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🎁 Programa de Indicação
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Indique amigos e ganhe recompensas exclusivas
        </p>
      </div>

      {/* Referral Code Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-6"
      >
        <div className="text-center">
          <GiftIcon className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h3 className="text-xl font-bold mb-2">Seu Código de Indicação</h3>
          <div className="bg-white/20 rounded-lg p-4 mb-4">
            <code className="text-2xl font-mono font-bold">{referralCode}</code>
          </div>
          <p className="text-purple-100 mb-4">
            Compartilhe este código e você e seu amigo ganham R$ 30 OFF na primeira limpeza!
          </p>
          <button
            onClick={() => setShowShareModal(true)}
            className="bg-white text-purple-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 mx-auto"
          >
            <ShareIcon className="w-5 h-5" />
            Compartilhar Código
          </button>
        </div>
      </motion.div>

      {/* Progress & Rewards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrophyIcon className="w-5 h-5 text-yellow-500" />
            Seu Progresso
          </h3>

          <div className="space-y-3">
            {rewards.map((reward, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  referrals.length >= reward.referrals
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                    : 'bg-gray-50 dark:bg-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    referrals.length >= reward.referrals
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 dark:bg-slate-600 text-gray-600 dark:text-gray-400'
                  }`}>
                    {referrals.length >= reward.referrals ? '✓' : reward.referrals}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{reward.reward}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{reward.description}</p>
                  </div>
                </div>
                {referrals.length >= reward.referrals && (
                  <span className="text-green-600 dark:text-green-400 font-semibold">Conquistado!</span>
                )}
              </div>
            ))}
          </div>

          {nextReward && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Próxima recompensa:</strong> {nextReward.reward} com {nextReward.referrals - referrals.length} indicações
              </p>
            </div>
          )}
        </motion.div>

        {/* Referrals List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-blue-500" />
            Suas Indicações ({referrals.length})
          </h3>

          {referrals.length > 0 ? (
            <div className="space-y-3">
              {referrals.map((referral, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {referral.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{referral.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(referral.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                      R$ 30 OFF
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {referral.status === 'completed' ? 'Concluído' : 'Pendente'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <UsersIcon className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                Você ainda não fez nenhuma indicação
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Compartilhe seu código e comece a ganhar recompensas!
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowShareModal(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              Compartilhar Código
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'WhatsApp', icon: '💬', platform: 'whatsapp' },
                { name: 'Facebook', icon: '📘', platform: 'facebook' },
                { name: 'Twitter', icon: '🐦', platform: 'twitter' },
                { name: 'Copiar Link', icon: '📋', platform: 'copy' }
              ].map((option) => (
                <button
                  key={option.platform}
                  onClick={() => shareReferral(option.platform)}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{option.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Fechar
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ReferralSystem;
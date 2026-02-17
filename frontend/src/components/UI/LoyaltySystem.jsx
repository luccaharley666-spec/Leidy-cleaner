import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { StarIcon, GiftIcon, TrophyIcon } from '@heroicons/react/24/solid';
import { useNotifications } from './NotificationSystem';

const LoyaltyContext = createContext();

export function LoyaltyProvider({ children }) { const [userPoints, setUserPoints] = useState(0);
  const [userLevel, setUserLevel] = useState('Bronze');
  const [completedServices,] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => { // Carregar dados do usuário do localStorage (em produção seria da API)
    const saved = localStorage.getItem('leidy-loyalty');
    if (saved) {
      const data = JSON.parse(saved);
      setUserPoints(data.points || 0);
     (data.services || 0);
      setUserLevel(calculateLevel(data.points || 0)); }
  }, []);

  const calculateLevel = (points) => {
    if (points >= 1000) return 'Diamante';
    if (points >= 500) return 'Ouro';
    if (points >= 200) return 'Prata';
    return 'Bronze';
  };

  const addPoints = (points, reason) => { const newPoints = userPoints + points;
    const newLevel = calculateLevel(newPoints);

    setUserPoints(newPoints);
   (prev => prev + 1);

    // Verificar se subiu de nível
    if (newLevel !== userLevel) {
      setUserLevel(newLevel);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);

      addNotification({
        title: '🎉 Nível Atingido!', message: `Parabéns! Você alcançou o nível ${newLevel }!`,
        icon: '⭐',
        tag: 'level-up' });
    }

    // Salvar no localStorage
    localStorage.setItem('leidy-loyalty', JSON.stringify({
      points: newPoints,
      services: completedServices + 1,
      level: newLevel,
      lastUpdate: new Date() }));

    // Notificar ganho de pontos
    addNotification({
      title: `+${points} pontos!`,
      message: reason,
      icon: '💎',
      tag: 'points' });
  };

  const getLevelProgress = () => {
    const levels = {
      'Bronze': { min: 0, max: 199, next: 'Prata' },
      'Prata': { min: 200, max: 499, next: 'Ouro' },
      'Ouro': { min: 500, max: 999, next: 'Diamante' },
      'Diamante': { min: 1000, max: Infinity, next: null } };

    const current = levels[userLevel];
    const progress = ((userPoints - current.min) / (current.max - current.min)) * 100;

    return {
      current: userLevel,
      next: current.next,
      progress: Math.min(progress, 100),
      pointsToNext: current.max === Infinity ? 0 : current.max - userPoints };
  };

  const getAvailableRewards = () => {
    return [
      {
        id: 'discount-10',
        title: '10% de desconto',
        description: 'Desconto em qualquer serviço',
        cost: 100,
        icon: '💰',
        available: userPoints >= 100 },
      {
        id: 'free-service',
        title: 'Serviço grátis',
        description: 'Uma limpeza completa grátis',
        cost: 500,
        icon: '🧹',
        available: userPoints >= 500 },
      {
        id: 'priority-booking',
        title: 'Agendamento prioritário',
        description: 'Pule a fila de agendamentos',
        cost: 200,
        icon: '⚡',
        available: userPoints >= 200 },
      {
        id: 'birthday-surprise',
        title: 'Surpresa de aniversário',
        description: 'Brinde especial no seu aniversário',
        cost: 300,
        icon: '🎂',
        available: userPoints >= 300 },
    ];
  };

  const redeemReward = (rewardId) => {
    const rewards = getAvailableRewards();
    const reward = rewards.find(r => r.id === rewardId);

    if (reward && userPoints >= reward.cost) {
      setUserPoints(prev => prev - reward.cost);

      addNotification({
        title: '🎁 Recompensa Resgatada!',
        message: `Você resgatou: ${reward.title}`,
        icon: '🎉',
        tag: 'reward' });

      // Em produção, isso seria enviado para a API
    }
  };

  return (
    <LoyaltyContext.Provider value={{
      userPoints,
      userLevel,
      completedServices,
      addPoints,
      getLevelProgress,
      getAvailableRewards,
      redeemReward }}>
      {children}
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
    </LoyaltyContext.Provider>
  );
}

export function useLoyalty() {
  return useContext(LoyaltyContext);
}

export function LoyaltyCard() {
  const { userPoints, userLevel, completedServices, getLevelProgress } = useLoyalty();
  const progress = getLevelProgress();

  const levelColors = {
    'Bronze': 'from-amber-600 to-amber-800',
    'Prata': 'from-gray-400 to-gray-600',
    'Ouro': 'from-yellow-400 to-yellow-600',
    'Diamante': 'from-blue-400 to-blue-600' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r ${levelColors[userLevel]} rounded-xl p-6 text-white shadow-lg`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">Programa de Fidelidade</h3>
          <p className="text-sm opacity-90">Nível {userLevel}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{userPoints}</div>
          <div className="text-sm opacity-90">pontos</div>
        </div>
      </div>

      {progress.next && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Próximo: {progress.next}</span>
            <span>{progress.pointsToNext} pontos</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              className="bg-white h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress.progress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <span>Serviços realizados: {completedServices}</span>
        <div className="flex items-center gap-1">
          <StarIcon className="w-4 h-4" />
          <span>{userLevel}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function RewardsStore() {
  const { getAvailableRewards, redeemReward, userPoints } = useLoyalty();
  const rewards = getAvailableRewards();

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 mb-4">🏆 Recompensas Disponíveis</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rewards.map(reward => (
          <motion.div
            key={reward.id}
            whileHover={{ scale: 1.02 }}
            className={`bg-white rounded-lg p-4 shadow-sm border ${
              reward.available ? 'border-gray-200' : 'border-gray-100 opacity-60'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{reward.icon}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{reward.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600">
                    {reward.cost} pontos
                  </span>
                  <button
                    onClick={() => redeemReward(reward.id)}
                    disabled={!reward.available}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      reward.available
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {reward.available ? 'Resgatar' : 'Pontos insuficientes'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-blue-50 rounded-lg p-4 mt-6">
        <div className="flex items-center gap-2 mb-2">
          <GiftIcon className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-blue-900">Como ganhar pontos?</h4>
        </div>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• +50 pontos por serviço realizado</li>
          <li>• +20 pontos por avaliação positiva</li>
          <li>• +100 pontos por indicação</li>
          <li>• Bônus sazonais e promoções especiais</li>
        </ul>
      </div>
    </div>
  );
}

export function LoyaltyBadge({ showPoints = true }) {
  const { userPoints, userLevel } = useLoyalty();

  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
      <TrophyIcon className="w-4 h-4" />
      <span>{userLevel}</span>
      {showPoints && <span>• {userPoints} pts</span>}
    </div>
  );
}
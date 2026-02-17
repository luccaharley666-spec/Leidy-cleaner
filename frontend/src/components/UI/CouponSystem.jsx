import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TicketIcon, GiftIcon, SparklesIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useNotifications } from './NotificationSystem';

export function CouponSystem() {
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [userCoupons, setUserCoupons] = useState([]);
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Carregar cupons disponíveis (em produção viria da API)
    const coupons = [
      {
        id: 'welcome-20',
        title: 'Bem-vindo! 20% OFF',
        description: 'Desconto especial para novos clientes',
        discount: 20,
        type: 'percentage',
        minValue: 100,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        code: 'BEMVINDO20',
        category: 'welcome',
        active: true },
      {
        id: 'flash-50',
        title: 'Oferta Relâmpago - R$50 OFF',
        description: 'Desconto fixo em serviços acima de R$200',
        discount: 50,
        type: 'fixed',
        minValue: 200,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        code: 'FLASH50',
        category: 'flash',
        active: true },
      {
        id: 'loyalty-15',
        title: 'Cliente VIP - 15% OFF',
        description: 'Desconto para clientes fiéis',
        discount: 15,
        type: 'percentage',
        minValue: 0,
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 dias
        code: 'VIP15',
        category: 'loyalty',
        active: true },
      {
        id: 'seasonal-25',
        title: 'Temporada Especial - 25% OFF',
        description: 'Oferta sazonal imperdível',
        discount: 25,
        type: 'percentage',
        minValue: 150,
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias
        code: 'TEMPORADA25',
        category: 'seasonal',
        active: true },
    ];

    setAvailableCoupons(coupons);

    // Carregar cupons do usuário
    const saved = localStorage.getItem('leidy-user-coupons');
    if (saved) {
      setUserCoupons(JSON.parse(saved));
    }
  }, []);

  const claimCoupon = (couponId) => {
    const coupon = availableCoupons.find(c => c.id === couponId);
    if (!coupon) return;

    const userCoupon = {
      ...coupon,
      claimedAt: new Date(),
      used: false };

    const updatedUserCoupons = [...userCoupons, userCoupon];
    setUserCoupons(updatedUserCoupons);
    localStorage.setItem('leidy-user-coupons', JSON.stringify(updatedUserCoupons));

    addNotification({
      title: '🎫 Cupom Resgatado!',
      message: `Você ganhou: ${coupon.title}`,
      icon: '🎁',
      tag: 'coupon' });
  };

  const applyCoupon = (code, serviceValue) => {
    const coupon = userCoupons.find(c => c.code === code && !c.used);
    if (!coupon) return null;

    // Verificar se o cupom ainda é válido
    if (new Date() > new Date(coupon.validUntil)) {
      return { error: 'Cupom expirado' };
    }

    // Verificar valor mínimo
    if (serviceValue < coupon.minValue) {
      return { error: `Valor mínimo: R$${coupon.minValue}` };
    }

    // Calcular desconto
    let discountValue = 0;
    if (coupon.type === 'percentage') {
      discountValue = (serviceValue * coupon.discount) / 100;
    } else {
      discountValue = Math.min(coupon.discount, serviceValue);
    }

    return {
      coupon,
      discountValue,
      finalValue: serviceValue - discountValue };
  };

  const useCoupon = (code) => {
    const updatedCoupons = userCoupons.map(coupon =>
      coupon.code === code ? { ...coupon, used: true, usedAt: new Date() } : coupon
    );
    setUserCoupons(updatedCoupons);
    localStorage.setItem('leidy-user-coupons', JSON.stringify(updatedCoupons));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <TicketIcon className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">🎫 Cupons e Promoções</h3>
      </div>

      <CouponGrid
        coupons={availableCoupons}
        userCoupons={userCoupons}
        onClaim={claimCoupon}
      />

      <UserCoupons
        coupons={userCoupons}
        onApply={applyCoupon}
        onUse={useCoupon}
      />
    </div>
  );
}

function CouponGrid({ coupons, userCoupons, onClaim }) {
  const claimedCouponIds = userCoupons.map(c => c.id);

  return (
    <div>
      <h4 className="text-lg font-semibold text-gray-900 mb-4">🏷️ Cupons Disponíveis</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coupons.map(coupon => {
          const isClaimed = claimedCouponIds.includes(coupon.id);
          const isExpired = new Date() > new Date(coupon.validUntil);

          return (
            <motion.div
              key={coupon.id}
              whileHover={{ scale: 1.02 }}
              className={`relative bg-gradient-to-r ${
                coupon.category === 'welcome' ? 'from-green-400 to-blue-500' :
                coupon.category === 'flash' ? 'from-red-400 to-pink-500' :
                coupon.category === 'loyalty' ? 'from-purple-400 to-indigo-500' :
                'from-orange-400 to-yellow-500'
              } rounded-xl p-6 text-white shadow-lg overflow-hidden`}
            >
              {coupon.category === 'flash' && (
                <div className="absolute top-2 right-2">
                  <SparklesIcon className="w-6 h-6 animate-pulse" />
                </div>
              )}

              <div className="relative z-10">
                <h4 className="text-lg font-bold mb-2">{coupon.title}</h4>
                <p className="text-sm opacity-90 mb-4">{coupon.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <GiftIcon className="w-4 h-4" />
                    <span>
                      {coupon.type === 'percentage'
                        ? `${coupon.discount}% de desconto`
                        : `R$${coupon.discount} de desconto`
                      }
                    </span>
                  </div>

                  {coupon.minValue > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <span>Valor mínimo: R${coupon.minValue}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <ClockIcon className="w-4 h-4" />
                    <span>
                      Válido até: {new Date(coupon.validUntil).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                    <span className="font-mono text-sm font-bold">{coupon.code}</span>
                  </div>

                  <button
                    onClick={() => onClaim(coupon.id)}
                    disabled={isClaimed || isExpired}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isClaimed
                        ? 'bg-white/30 text-white cursor-not-allowed'
                        : isExpired
                        ? 'bg-red-500/50 text-white cursor-not-allowed'
                        : 'bg-white text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {isClaimed ? 'Resgatado' : isExpired ? 'Expirado' : 'Resgatar'}
                  </button>
                </div>
              </div>

              {/* Pattern overlay */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function UserCoupons({ coupons, onApply, onUse }) {
  const [couponCode, setCouponCode] = useState('');
  const [serviceValue, setServiceValue] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const handleApplyCoupon = () => {
    if (!couponCode || !serviceValue) return;

    const result = onApply(couponCode, parseFloat(serviceValue));

    if (result?.error) {
      alert(result.error);
    } else {
      setAppliedCoupon(result);
    }
  };

  const handleUseCoupon = () => {
    if (appliedCoupon) {
      onUse(appliedCoupon.coupon.code);
      setAppliedCoupon(null);
      setCouponCode('');
      setServiceValue('');
      alert('Cupom aplicado com sucesso!');
    }
  };

  const activeCoupons = coupons.filter(c => !c.used && new Date(c.validUntil) > new Date());

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-gray-900">🎟️ Meus Cupons</h4>

      {/* Aplicar cupom */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h5 className="font-medium text-gray-900 mb-3">Aplicar Cupom</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Código do cupom"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Valor do serviço (R$)"
            value={serviceValue}
            onChange={(e) => setServiceValue(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleApplyCoupon}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Aplicar
          </button>
        </div>

        {appliedCoupon && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h6 className="font-medium text-green-900">{appliedCoupon.coupon.title}</h6>
                <p className="text-sm text-green-700">
                  Desconto: R$ {appliedCoupon.discountValue.toFixed(2)} |
                  Valor final: R$ {appliedCoupon.finalValue.toFixed(2)}
                </p>
              </div>
              <button
                onClick={handleUseCoupon}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Usar Cupom
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Lista de cupons */}
      {activeCoupons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeCoupons.map(coupon => (
            <div key={coupon.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900">{coupon.title}</h5>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {coupon.code}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
              <div className="text-xs text-gray-500">
                Válido até: {new Date(coupon.validUntil).toLocaleDateString('pt-BR')}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <TicketIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Você ainda não tem cupons ativos</p>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SubscriptionPlans.css';

const SubscriptionPlans = ({ userId, token, onSuccess }) => {
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  useEffect(() => {
    fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar planos
      const plansRes = await axios.get('/api/subscriptions/plans', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Buscar subscrição atual
      const subRes = await axios.get('/api/subscriptions/active', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPlans(plansRes.data.plans || []);
      setCurrentSubscription(subRes.data.subscription || null);
    } catch (error) {
      console.error('Erro ao buscar subscrições:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    if (!paymentMethod) {
      setMessage('❌ Selecione um método de pagamento');
      return;
    }

    try {
      await axios.post(
        '/api/subscriptions/create',
        { planId, stripePaymentMethod: paymentMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('✅ Subscrição ativada com sucesso!');
      fetchData();
      onSuccess?.();
    } catch (error) {
      setMessage('❌ Erro ao ativar subscrição');
    }
  };

  const cancelSubscription = async () => {
    if (!window.confirm('Tem certeza que deseja cancelar a subscrição?')) {
      return;
    }

    try {
      await axios.post(
        '/api/subscriptions/cancel',
        { subscriptionId: currentSubscription?.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('✅ Subscrição cancelada');
      fetchData();
    } catch (error) {
      setMessage('❌ Erro ao cancelar');
    }
  };

  if (loading) { return <div className="decoded">Carregando planos...</div>; }

  return (
    <div className="subscription-plans">
      <h2>📅 Planos de Subscrição</h2>

      { message && (
        <div className={`decoded ${message.includes('✅') ? 'success' : 'error' }`}>
          {message}
        </div>
      )}

      { currentSubscription && (
        <div className="decoded">
          <h3>✅ Você tem uma subscrição ativa</h3>
          <p>Plano: <strong>{currentSubscription.plan_name }</strong></p>
          <p>Status: <strong>{currentSubscription.status}</strong></p>
          <p>Desde: {new Date(currentSubscription.started_at).toLocaleDateString('pt-BR')}</p>
          <button
            className="decoded"
            onClick={cancelSubscription}
          >
            Cancelar Subscrição
          </button>
        </div>
      )}

      <div className="plans-grid">
        {plans.map((plan) => (
          <div key={plan.id} className="plan-card">
            <h3>{plan.name}</h3>
            <p className="plan-description">{plan.description}</p>
            
            <div className="plan-features">
              <span className="feature">⏱️ {plan.hours_per_month}h por mês</span>
            </div>

            <div className="plan-pricing">
              <span className="price">R$ {parseFloat(plan.price).toFixed(2)}</span>
              <span className="period">/mês</span>
            </div>

            {!currentSubscription || currentSubscription.plan_id !== plan.id ? (
              <>
                <div className="payment-methods">
                  <label>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={plan.stripe_price_id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      checked={paymentMethod === plan.stripe_price_id}
                    />
                    Cartão de Crédito
                  </label>
                </div>
                <button
                  className="subscribe-btn"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={!paymentMethod}
                >
                  Assinar Agora
                </button>
              </>
            ) : (
              <div className="current-plan-badge">Plano Atual</div>
            )}
          </div>
        ))}
      </div>

      <div className="subscription-info">
        <h4>💡 Informações</h4>
        <ul>
          <li>✅ Cobrança recorrente mensal</li>
          <li>✅ Cancele a qualquer momento</li>
          <li>✅ Sem taxa de cancelamento</li>
          <li>✅ Horas carregadas no 1º dia do mês</li>
        </ul>
      </div>
    </div>
  );
};

export default SubscriptionPlans;

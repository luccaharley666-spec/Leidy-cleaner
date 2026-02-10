/**
 * Hour Checkout Page
 * Página de compra de pacotes de horas
 */

import React, { useState, useEffect } from 'react';
import HourCalculator from '../components/Pricing/HourCalculator';

const HourCheckout = () => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [processingPayment, [REDACTED_TOKEN]] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [userCredit, setUserCredit] = useState(null);

  // Buscar crédito atual do usuário
  useEffect(() => {
    fetchUserCredit();
  }, []);

  const fetchUserCredit = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const response = await fetch('/api/pricing/user-hour-credit', {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const data = await response.json();

      if (data.success) {
        setUserCredit(data.creditInfo);
      }
    } catch (err) {
      console.error('Erro ao buscar crédito:', err);
    }
  };

  const handleCalculate = (result) => {
    setPriceData(result);
  };

  const [REDACTED_TOKEN] = async () => {
    if (!priceData || !priceData.hours) {
      alert('Selecione uma quantidade de horas válida');
      return;
    }

    try {
      [REDACTED_TOKEN](true);

      // 1. Iniciar compra do pacote
      const purchaseResponse = await fetch('/api/pricing/purchase-package', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${typeof window !== 'undefined' ? (localStorage.getItem('accessToken') || '') : ''}`,
        },
        body: JSON.stringify({
          packageHours: priceData.hours,
        }),
      });

      const purchaseData = await purchaseResponse.json();

      if (!purchaseData.success) {
        alert('Erro ao processar compra: ' + purchaseData.error);
        return;
      }

      // 2. Processar pagamento (integra com PaymentController)
      const token2 = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const paymentResponse = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token2 && { Authorization: `Bearer ${token2}` }),
        },
        body: JSON.stringify({
          amount: priceData.finalPrice,
          method: paymentMethod,
          type: 'hour_package',
          packageHours: priceData.hours,
          description: `Compra de ${priceData.hours} horas de serviço`,
        }),
      });

      const paymentResult = await paymentResponse.json();

      if (paymentResult.success) {
        // Sucesso!
        alert(`✅ Pagamento aprovado! Você adquiriu ${priceData.hours} horas.`);
        
        // Atualizar crédito
        fetchUserCredit();
        
        // Redirecionar ou limpar
        setSelectedPackage(null);
        setPriceData(null);
      } else {
        alert('Erro no pagamento: ' + paymentResult.error);
      }
    } catch (err) {
      console.error('Erro ao processar pagamento:', err);
      alert('Erro ao processar pagamento');
    } finally {
      [REDACTED_TOKEN](false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-12 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-green-900 mb-3">
            🎯 Comprar Horas de Serviço
          </h1>
          <p className="text-xl text-gray-700">
            Escolha um pacote de horas e use quando precisar
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calculadora */}
          <div className="lg:col-span-2">
            <HourCalculator
              onCalculate={handleCalculate}
              userId={typeof window !== 'undefined' ? localStorage.getItem('userId') : null}
            />
          </div>

          {/* Resumo e Checkout */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h3 className="text-2xl font-bold text-green-900 mb-6">
                📋 Resumo
              </h3>

              {/* Crédito Atual */}
              {userCredit && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-700">Horas Disponíveis:</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {userCredit.availableHours.toFixed(1)}h
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Total: {userCredit.totalHours.toFixed(1)}h | Usadas: {userCredit.usedHours.toFixed(1)}h
                  </p>
                </div>
              )}

              {/* Seleção de Horas */}
              {priceData && (
                <>
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-gray-700">Horas Selecionadas:</p>
                    <p className="text-3xl font-bold text-green-600">
                      {priceData.hours.toFixed(1)}h
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      @ R$ {priceData.pricePerHour}/h
                    </p>
                  </div>

                  {/* Preço Final */}
                  <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">Valor Total:</p>
                    <p className="text-4xl font-bold text-yellow-700">
                      R$ {priceData.finalPrice.toFixed(2)}
                    </p>
                  </div>

                  {/* Método de Pagamento */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Método de Pagamento:
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center p-3 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="pix"
                          checked={paymentMethod === 'pix'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3"
                        />
                        <span className="font-medium">💳 PIX</span>
                      </label>
                      <label className="flex items-center p-3 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="stripe"
                          checked={paymentMethod === 'stripe'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3"
                        />
                        <span className="font-medium">💰 Cartão de Crédito</span>
                      </label>
                    </div>
                  </div>

                  {/* Botão de Compra */}
                  <button
                    onClick={[REDACTED_TOKEN]}
                    disabled={processingPayment}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-white transition ${
                      processingPayment
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {processingPayment ? '⏳ Processando...' : '✅ Comprar Agora'}
                  </button>

                  {/* Termos */}
                  <p className="text-xs text-gray-500 mt-4 text-center">
                    Ao prosseguir, você concorda com nossos termos de serviço.
                    <br />
                    As horas expiram em 365 dias.
                  </p>
                </>
              )}

              {!priceData && (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    Selecione uma quantidade de horas à esquerda para ver o preço
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-green-900 mb-6">
            ❓ Perguntas Frequentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-gray-800 mb-2">
                💡 Como funciona?
              </h4>
              <p className="text-gray-600 text-sm">
                Você compra um pacote de horas. Depois, quando precisar de nosso
                serviço, você usa as horas que tem disponíveis. Simples assim!
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">
                🔄 Posso rolar horas para o próximo mês?
              </h4>
              <p className="text-gray-600 text-sm">
                Sim! As horas não expiram por 365 dias a partir da compra. Use-as
                quando precisar.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">
                💰 Há desconto em pacotes maiores?
              </h4>
              <p className="text-gray-600 text-sm">
                Sim! A primeira hora custa R$ 40/h, mas a partir de 60 horas, cada
                hora custa R$ 20/h.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">
                🤔 Posso devolver horas não usadas?
              </h4>
              <p className="text-gray-600 text-sm">
                Sim, até 30 dias após a compra! Entre em contato conosco para mais
                informações.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HourCheckout;

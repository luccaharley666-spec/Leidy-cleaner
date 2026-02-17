/**
 * AffiliatesDashboard.jsx
 * Painel de gerenciamento de afiliados e referências
 */

import { useState, useEffect } from 'react';
import { useState as useStateCallback } from 'react';
import {
  Share2,
  Copy,
  TrendingUp,
  DollarSign,
  Users,
  ArrowUp,
  MessageCircle,
  Mail,
  AlertCircle
} from 'lucide-react';

export default function AffiliatesDashboard() {
  const [affiliate, setAffiliate] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState(null);

  // Carregar dados do afiliado
  useEffect(() => {
    const fetchAffiliateData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/affiliates/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) throw new Error('Erro ao carregar dados');

        const data = await response.json();
        setAffiliate(data.stats);
        setReferrals(data.referrals || []);
        setError('');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAffiliateData();
  }, []);

  // Copiar código de referência
  const handleCopyCode = () => {
    navigator.clipboard.writeText(affiliate?.referral_code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compartilhar código
  const handleShare = async () => {
    try {
      const response = await fetch('/api/affiliates/link', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (navigator.share) {
        navigator.share({
          title: 'Código de Referência',
          text: data.shareText,
          url: data.referralLink
        });
      } else {
        // Fallback: copiar para clipboard
        navigator.clipboard.writeText(data.referralLink);
        alert('Link copiado para a área de transferência!');
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  // Compartilhar no WhatsApp
  const handleShareWhatsApp = async () => {
    try {
      const response = await fetch('/api/affiliates/link', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      const text = encodeURIComponent(data.whatsappShare);
      window.open(`https://wa.me/?text=${text}`, '_blank');
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  // Solicitar saque
  const handleWithdraw = async () => {
    const amount = prompt('Qual valor deseja sacar? (Mínimo: R$ 50)');
    if (!amount) return;

    try {
      const response = await fetch('/api/affiliates/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount: parseFloat(amount) })
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        // Recarregar dados
        window.location.reload();
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      alert('Erro ao processar saque');
    }
  };

  if (loading) { return (
      <div className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-green-500 rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando dados do painel...</p>
      </div>
    ); }

  if (error || !affiliate) {
    return (
      <div className="p-8 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          <span>{error || 'Você não é um afiliado ainda'}</span>
        </div>
      </div>
    );
  }

  // Calcular % de comissão
  const commissionPercent = (affiliate.commission_rate * 100).toFixed(0);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      {/* Cabeçalho com Info de Código */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
        <h1 className="text-3xl font-bold text-green-800 mb-4">💰 Seu Painel de Afiliado</h1>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Seu Código de Referência */}
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <p className="text-sm text-gray-600 mb-2">Seu Código de Referência</p>
            <div className="flex items-center justify-between bg-emerald-50 p-3 rounded border border-green-200">
              <span className="font-bold text-lg text-green-700">{affiliate.referral_code}</span>
              <button
                onClick={handleCopyCode}
                className="p-2 hover:bg-green-100 rounded transition"
                title="Copiar código"
              >
                <Copy size={18} className={copied ? 'text-green-600' : 'text-gray-600'} />
              </button>
            </div>
            {copied && <p className="text-xs text-green-600 mt-2">✓ Código copiado!</p>}
          </div>

          {/* Taxa de Comissão */}
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <p className="text-sm text-gray-600 mb-2">Sua Taxa de Comissão</p>
            <div className="text-3xl font-bold text-green-600">{commissionPercent}%</div>
            <p className="text-xs text-gray-500 mt-1">de cada venda referenciada</p>
          </div>
        </div>

        {/* Botões de Compartilhamento */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            <Share2 size={18} />
            Compartilhar Link
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            <MessageCircle size={18} />
            Compartilhar WhatsApp
          </button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Total de Referências */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total de Referências</p>
            <Users size={20} className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{affiliate.total_referrals}</p>
          <p className="text-xs text-gray-500 mt-2">pessoas que você indicou</p>
        </div>

        {/* Ganhos Totais */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Ganhos Totais</p>
            <TrendingUp size={20} className="text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            R$ {parseFloat(affiliate.total_earnings).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-2">rendimento acumulado</p>
        </div>

        {/* Conversão */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Ganho Médio</p>
            <DollarSign size={20} className="text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-orange-600">
            R$ {affiliate.total_referrals > 0
              ? (affiliate.total_earnings / affiliate.total_referrals).toFixed(2)
              : '0.00'
            }
          </p>
          <p className="text-xs text-gray-500 mt-2">por referência</p>
        </div>
      </div>

      {/* Botão de Saque */}
      {affiliate.total_earnings >= 50 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-emerald-900">Você tem saldo disponível!</p>
              <p className="text-sm text-emerald-700 mt-1">
                Pode sacar a partir de R$ 50. Processamos em até 5 dias úteis.
              </p>
            </div>
            <button
              onClick={handleWithdraw}
              className="px-6 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition whitespace-nowrap"
            >
              Solicitar Saque
            </button>
          </div>
        </div>
      )}

      {/* Histórico de Referências */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Histórico de Referências</h2>

        {referrals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma referência registrada ainda</p>
            <p className="text-sm mt-2">Comece a compartilhar seu código para ganhar!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b-2 border-gray-200">
                <tr>
                  <th className="text-left py-2 px-2 text-sm font-bold text-gray-700">Data</th>
                  <th className="text-left py-2 px-2 text-sm font-bold text-gray-700">Pessoa</th>
                  <th className="text-right py-2 px-2 text-sm font-bold text-gray-700">Venda</th>
                  <th className="text-right py-2 px-2 text-sm font-bold text-gray-700">Comissão</th>
                  <th className="text-center py-2 px-2 text-sm font-bold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((ref) => (
                  <tr key={ref.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2 text-sm text-gray-700">
                      {new Date(ref.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-800 font-medium">
                      {ref.referred_user_name || 'Usuário'}
                    </td>
                    <td className="py-3 px-2 text-sm text-right text-gray-700">
                      R$ {parseFloat(ref.transaction_amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-sm text-right font-bold text-green-600">
                      R$ {parseFloat(ref.commission_earned).toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        ref.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {ref.status === 'completed' ? '✓ Concluída' : '⏳ Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dicas de Crescimento */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">💡 Dicas para Ganhar Mais</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>✓ Compartilhe seu código em redes sociais (Instagram, LinkedIn)</li>
          <li>✓ Peça para amigos usarem seu código na primeira compra</li>
          <li>✓ Use o link personalizado em sua assinatura de emails</li>
          <li>✓ Compartilhe em grupos do WhatsApp e Telegram</li>
          <li>✓ Quanto mais pessoas indicar, maior sua comissão!</li>
        </ul>
      </div>
    </div>
  );
}

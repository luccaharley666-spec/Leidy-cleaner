import React, { useState } from 'react'

const SERVICE_TYPES = {
  limpeza_comum: { label: 'Limpeza Comum', bonus: '0%' },
  organizacao: { label: 'Organização', bonus: '+10%' },
  pos_obra: { label: 'Pós-Obra', bonus: '+20%' }
}

const PRICE_CONFIG = {
  firstHour: 40,
  additionalHour: 20,
  maxHours: 8,
  productFee: 3,
  companyPercentage: 0.40
}

export default function PriceCalculator() {
  const [bookings, setBookings] = useState([
    { hours: 2, serviceType: 'limpeza_comum', hasProducts: false }
  ])

  const calculateBase = (hours) => {
    if (hours < 1) return 0
    return PRICE_CONFIG.firstHour + Math.max(0, hours - 1) * PRICE_CONFIG.additionalHour
  }

  const calculateSingle = (hours, serviceType, hasProducts) => {
    const basePrice = calculateBase(hours)
    
    let bonus = 0
    if (serviceType === 'organizacao') bonus = basePrice * 0.10
    else if (serviceType === 'pos_obra') bonus = basePrice * 0.20
    
    const productFee = hasProducts ? PRICE_CONFIG.productFee : 0
    const finalPrice = basePrice + bonus + productFee
    
    return {
      basePrice,
      bonus,
      productFee,
      finalPrice,
      company40: finalPrice * PRICE_CONFIG.companyPercentage,
      profesional60: finalPrice * (1 - PRICE_CONFIG.companyPercentage)
    }
  }

  const totals = bookings.reduce(
    (acc, b) => {
      const calc = calculateSingle(b.hours, b.serviceType, b.hasProducts)
      return {
        totalBase: acc.totalBase + calc.basePrice,
        totalBonus: acc.totalBonus + calc.bonus,
        totalProducts: acc.totalProducts + calc.productFee,
        totalFinal: acc.totalFinal + calc.finalPrice,
        totalCompany: acc.totalCompany + calc.company40,
        totalProfessional: acc.totalProfessional + calc.profesional60,
        totalHours: acc.totalHours + b.hours
      }
    },
    { totalBase: 0, totalBonus: 0, totalProducts: 0, totalFinal: 0, totalCompany: 0, totalProfessional: 0, totalHours: 0 }
  )

  const addBooking = () => {
    setBookings([...bookings, { hours: 1, serviceType: 'limpeza_comum', hasProducts: false }])
  }

  const removeBooking = (idx) => {
    setBookings(bookings.filter((_, i) => i !== idx))
  }

  const updateBooking = (idx, field, value) => {
    const updated = [...bookings]
    updated[idx][field] = value
    setBookings(updated)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">💰 Calculadora de Preços</h1>
          <p className="text-gray-600">Leidy Cleaner - Sistema Simples e Acumulativo</p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl font-black text-green-600">R$40</div>
            <div className="text-sm text-gray-600">Primeira hora</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl font-black text-green-600">R$20</div>
            <div className="text-sm text-gray-600">Horas adicionais</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl font-black text-blue-600">40% / 60%</div>
            <div className="text-sm text-gray-600">Empresa / Profissional</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl font-black text-orange-600">+R$3</div>
            <div className="text-sm text-gray-600">Taxa produtos</div>
          </div>
        </div>

        {/* Bookings */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Serviços</h2>
          
          <div className="space-y-4">
            {bookings.map((booking, idx) => {
              const calc = calculateSingle(booking.hours, booking.serviceType, booking.hasProducts)
              const serviceLabel = SERVICE_TYPES[booking.serviceType]?.label || 'Serviço'
              const bonus = SERVICE_TYPES[booking.serviceType]?.bonus || '0%'
              
              return (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    {/* Horas */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Horas</label>
                      <select
                        value={booking.hours}
                        onChange={(e) => updateBooking(idx, 'hours', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                          <option key={h} value={h}>{h}h</option>
                        ))}
                      </select>
                    </div>

                    {/* Tipo */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo ({bonus})</label>
                      <select
                        value={booking.serviceType}
                        onChange={(e) => updateBooking(idx, 'serviceType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="limpeza_comum">Limpeza Comum</option>
                        <option value="organizacao">Organização (+10%)</option>
                        <option value="pos_obra">Pós-Obra (+20%)</option>
                      </select>
                    </div>

                    {/* Produtos */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Produtos?</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateBooking(idx, 'hasProducts', false)}
                          className={`flex-1 py-2 px-3 rounded-lg font-semibold transition ${
                            !booking.hasProducts
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Não
                        </button>
                        <button
                          onClick={() => updateBooking(idx, 'hasProducts', true)}
                          className={`flex-1 py-2 px-3 rounded-lg font-semibold transition ${
                            booking.hasProducts
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Sim (+R$3)
                        </button>
                      </div>
                    </div>

                    {/* Preço Final */}
                    <div className="bg-green-50 p-3 rounded-lg border-2 border-green-200">
                      <div className="text-sm text-gray-600">Total ao Cliente</div>
                      <div className="text-2xl font-black text-green-600">R${calc.finalPrice.toFixed(2)}</div>
                    </div>

                    {/* Remover */}
                    <button
                      onClick={() => removeBooking(idx)}
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg font-semibold transition"
                    >
                      ✕ Remover
                    </button>
                  </div>

                  {/* Breakdown */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-300">
                    <div className="text-xs">
                      <span className="text-gray-600">Base:</span>
                      <div className="font-bold">R${calc.basePrice.toFixed(2)}</div>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-600">Acréscimo:</span>
                      <div className="font-bold">R${calc.bonus.toFixed(2)}</div>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-600">Empresa/Prof:</span>
                      <div className="font-bold">R${calc.company40.toFixed(2)} / R${calc.profesional60.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Adicionar Serviço */}
          <button
            onClick={addBooking}
            className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-bold transition"
          >
            ➕ Adicionar Outro Serviço
          </button>
        </div>

        {/* Totais */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg shadow-2xl p-8 text-white">
          <h3 className="text-2xl font-black mb-6">📊 TOTAIS ACUMULATIVOS</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur">
              <div className="text-sm opacity-90">Total de Horas</div>
              <div className="text-4xl font-black">{totals.totalHours}h</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur">
              <div className="text-sm opacity-90">Preço Base + Acréscimos</div>
              <div className="text-4xl font-black">R${(totals.totalBase + totals.totalBonus + totals.totalProducts).toFixed(2)}</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur">
              <div className="text-sm opacity-90">Taxa Produtos</div>
              <div className="text-4xl font-black">R${totals.totalProducts.toFixed(2)}</div>
            </div>
          </div>

          <div className="border-t-2 border-white/30 pt-6 mb-6">
            <div className="text-lg opacity-90 mb-3">VALOR FINAL AO CLIENTE</div>
            <div className="text-6xl font-black mb-6">R${totals.totalFinal.toFixed(2)}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-4 border border-white/30">
              <div className="text-sm opacity-75">Empresa (40%)</div>
              <div className="text-3xl font-black">R${totals.totalCompany.toFixed(2)}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 border border-white/30">
              <div className="text-sm opacity-75">Profissional (60%)</div>
              <div className="text-3xl font-black">R${totals.totalProfessional.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-900">
            <strong>💡 Como funciona:</strong><br />
            • Escolha horas (1-8h máximo)<br />
            • Selecione tipo de serviço (aplicar acréscimo automático)<br />
            • Marque se leva produtos (+R$3)<br />
            • Adicione mais serviços para acumular (múltiplos booking)<br />
            • Veja a divisão: 40% empresa / 60% profissional
          </div>
        </div>
      </div>
    </div>
  )
}

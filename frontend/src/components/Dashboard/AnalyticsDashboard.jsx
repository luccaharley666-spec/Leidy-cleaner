/**
 * Analytics Dashboard Components - React Frontend
 * Comprehensive visualization of platform metrics
 */

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie,
  FunnelChart, Funnel,
  ScatterChart, Scatter,
  HeatMapChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

/**
 * Revenue Chart Component
 * Display revenue trends over time
 */
export const RevenueChart = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Receita" />
          <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Despesas" />
          <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Lucro" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Booking Trends Component
 * Display booking volume over time
 */
export const BookingTrendsChart = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Booking Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="bookings" fill="#3b82f6" name="Agendamentos" />
          <Bar dataKey="completed" fill="#10b981" name="Completados" />
          <Bar dataKey="cancelled" fill="#ef4444" name="Cancelados" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Conversion Funnel Component
 * Display conversion rates through funnel
 */
export const [REDACTED_TOKEN] = ({ data }) => {
  const chartData = [
    { name: 'Visitantes', value: data.visitors || 1000 },
    { name: 'Clientes Ativos', value: data.activeCustomers || 750 },
    { name: 'Com Agendamentos', value: data.bookingsCreated || 500 },
    { name: 'Pagamentos Processados', value: data.paymentsProcessed || 400 },
    { name: 'Avaliações Deixadas', value: data.reviewsLeft || 200 }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Funnel de Conversão</h3>
      <ResponsiveContainer width="100%" height={300}>
        <FunnelChart>
          <Tooltip formatter={(value) => `${value} usuários`} />
          <Funnel data={chartData} dataKey="value" stroke="#3b82f6" fill="#3b82f6">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={['#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe', '#eff6ff'][index]} />
            ))}
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
      <div className="mt-4 text-sm text-gray-600">
        {chartData.map((item, idx) => (
          <div key={idx} className="flex justify-between">
            <span>{item.name}</span>
            <span className="font-bold">{item.value}</span>
            {idx > 0 && (
              <span className="text-blue-600">
                {((item.value / chartData[0].value) * 100).toFixed(1)}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Customer Lifetime Value Distribution
 * Scatter plot of customers by LTV
 */
export const [REDACTED_TOKEN] = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Customer Lifetime Value</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bookings" name="Agendamentos" />
          <YAxis dataKey="ltv" name="LTV (R$)" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Clientes" data={data} fill="#3b82f6" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Customer Segmentation Pie Chart
 * Show distribution across customer segments
 */
export const [REDACTED_TOKEN] = ({ data }) => {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Customer Segmentation</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={100}
            fill="#3b82f6"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} clientes`} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
            <span>{item.name}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Churn Risk Heatmap
 * Identify at-risk customers by various metrics
 */
export const ChurnRiskHeatmap = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Churn Risk Analysis</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Metric</th>
              <th className="p-2 text-center">Status</th>
              <th className="p-2 text-right">Value</th>
              <th className="p-2 text-left">Risk</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => {
              let riskColor = 'bg-green-100';
              let riskText = 'Baixo';
              
              if (item.risk > 70) {
                riskColor = 'bg-red-100';
                riskText = 'Alto';
              } else if (item.risk > 40) {
                riskColor = 'bg-yellow-100';
                riskText = 'Médio';
              }

              return (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="p-2">{item.metric}</td>
                  <td className="p-2 text-center">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.risk > 70 ? 'bg-red-500' : item.risk > 40 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${item.risk}%` }}
                      />
                    </div>
                  </td>
                  <td className="p-2 text-right font-bold">{item.value}</td>
                  <td className={`p-2 font-bold ${riskColor}`}>{riskText}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Main Analytics Dashboard Component
 */
export const AnalyticsDashboard = ({ data, loading, error }) => {
  const [dateRange, setDateRange] = useState('30days');
  const [selectedMetrics, setSelectedMetrics] = useState(['revenue', 'bookings', 'conversion']);

  if (loading) {
    return <div className="p-8 text-center">Carregando analytics...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Erro ao carregar dados: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">Últimos 7 dias</option>
            <option value="30days">Últimos 30 dias</option>
            <option value="90days">Últimos 90 dias</option>
            <option value="1year">Último ano</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-gray-600 text-sm">Total Revenue</h4>
          <p className="text-2xl font-bold text-blue-600">R$ {(data.totalRevenue || 0).toLocaleString('pt-BR')}</p>
          <p className="text-xs text-gray-500">↑ {data.revenueGrowth || 0}% vs period anterior</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="text-gray-600 text-sm">Total Bookings</h4>
          <p className="text-2xl font-bold text-green-600">{data.totalBookings || 0}</p>
          <p className="text-xs text-gray-500">↑ {data.bookingGrowth || 0}% vs period anterior</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="text-gray-600 text-sm">Active Users</h4>
          <p className="text-2xl font-bold text-purple-600">{data.activeUsers || 0}</p>
          <p className="text-xs text-gray-500">↑ {data.userGrowth || 0}% vs period anterior</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <h4 className="text-gray-600 text-sm">Conversion Rate</h4>
          <p className="text-2xl font-bold text-orange-600">{(data.conversionRate || 0).toFixed(1)}%</p>
          <p className="text-xs text-gray-500">↑ {data.conversionGrowth || 0}% vs period anterior</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={data.revenueData || []} />
        <BookingTrendsChart data={data.bookingData || []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <[REDACTED_TOKEN] data={data.funnelData || {}} />
        <[REDACTED_TOKEN] data={data.segmentationData || []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <[REDACTED_TOKEN] data={data.clvData || []} />
        <ChurnRiskHeatmap data={data.churnData || []} />
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-4">Customize Dashboard</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['revenue', 'bookings', 'conversion', 'ltv', 'churn', 'engagement', 'payments', 'reviews'].map(metric => (
            <label key={metric} className="flex items-center space-x-2">
              <input
                type="checkbox"
                defaultChecked={selectedMetrics.includes(metric)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedMetrics([...selectedMetrics, metric]);
                  } else {
                    setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
                  }
                }}
                className="w-4 h-4"
              />
              <span className="text-sm capitalize">{metric}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

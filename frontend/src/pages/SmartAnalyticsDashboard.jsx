/**
 * AnalyticsDashboard.jsx
 * Página admin com todas as métricas e análises
 * Feature #4: Advanced Analytics
 */

import React, { useEffect, useState } from 'react';
import { apiCall } from '../config/api';
import styles from './AnalyticsDashboard.module.css';

// Componentes helpers
const KPICard = ({ title, value, unit, trend, icon }) => (
  <div className={styles.kpiCard}>
    <div className={styles.kpiHeader}>
      <span className={styles.icon}>{icon}</span>
      <h4>{title}</h4>
    </div>
    <div className={styles.kpiValue}>
      {value}
      {unit && <span className={styles.unit}>{unit}</span>}
    </div>
    {trend && (
      <div className={`${styles.trend} ${trend > 0 ? styles.up : styles.down}`}>
        {trend > 0 ? '📈' : '📉'} {Math.abs(trend)}%
      </div>
    )}
  </div>
);

const ChartContainer = ({ title, children }) => (
  <div className={styles.chartContainer}>
    <h3>{title}</h3>
    {children}
  </div>
);

export default function AnalyticsDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [churnData, setChurnData] = useState(null);
  const [demandForecast, setDemandForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [daysBack, setDaysBack] = useState(30);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch dashboard
        const dashboardRes = await apiCall(
          `/api/smart/analytics/dashboard?daysBack=${daysBack}`,
          { method: 'GET' }
        );

        // Fetch churn analysis
        const churnRes = await apiCall(
          `/api/smart/analytics/churn`,
          { method: 'GET' }
        );

        // Fetch demand forecast
        const forecastRes = await apiCall(
          `/api/smart/analytics/demand-forecast`,
          { method: 'GET' }
        );

        setDashboard(dashboardRes.data);
        setChurnData(churnRes.data);
        setDemandForecast(forecastRes.data);
      } catch (error) {
        console.error('Error fetching analytics', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [daysBack]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando dashboard...</div>
      </div>
    );
  }

  const metrics = dashboard?.metrics || {};

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1>📊 Analytics Dashboard</h1>
        <div className={styles.controls}>
          <select
            value={daysBack}
            onChange={(e) => setDaysBack(parseInt(e.target.value))}
            className={styles.select}
          >
            <option value={7}>Últimos 7 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={60}>Últimos 60 dias</option>
            <option value={90}>Últimos 90 dias</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📈 Overview
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'staff' ? styles.active : ''}`}
          onClick={() => setActiveTab('staff')}
        >
          👥 Staff Performance
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'churn' ? styles.active : ''}`}
          onClick={() => setActiveTab('churn')}
        >
          ⚠️ Churn Analysis
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'forecast' ? styles.active : ''}`}
          onClick={() => setActiveTab('forecast')}
        >
          🔮 Forecast
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className={styles.content}>
          {/* Revenue KPIs */}
          <section className={styles.section}>
            <h2>💰 Revenue</h2>
            <div className={styles.kpiGrid}>
              <KPICard
                title="Total Revenue"
                value={`R$ ${parseFloat(metrics.revenue?.total_revenue || 0).toFixed(2)}`}
                trend={12}
                icon="💵"
              />
              <KPICard
                title="Avg Booking Value"
                value={`R$ ${parseFloat(metrics.revenue?.avg_booking_value || 0).toFixed(2)}`}
                trend={5}
                icon="🎯"
              />
              <KPICard
                title="Revenue per Day"
                value={`R$ ${parseFloat(metrics.revenue?.revenue_per_day || 0).toFixed(2)}`}
                trend={8}
                icon="📅"
              />
              <KPICard
                title="From Satisfied"
                value={`${metrics.revenue?.revenue_from_satisfied_customers || 0}%`}
                icon="⭐"
              />
            </div>
          </section>

          {/* Booking KPIs */}
          <section className={styles.section}>
            <h2>📋 Bookings</h2>
            <div className={styles.kpiGrid}>
              <KPICard
                title="Total Bookings"
                value={metrics.bookings?.total_bookings || 0}
                trend={15}
                icon="✓"
              />
              <KPICard
                title="Completed"
                value={metrics.bookings?.completed || 0}
                unit={`/${metrics.bookings?.total_bookings || 0}`}
                icon="✅"
              />
              <KPICard
                title="Cancelled"
                value={metrics.bookings?.cancelled || 0}
                icon="❌"
              />
              <KPICard
                title="Cancellation Rate"
                value={`${metrics.bookings?.cancellation_rate || 0}%`}
                icon="📉"
              />
            </div>
          </section>

          {/* Customer KPIs */}
          <section className={styles.section}>
            <h2>👥 Customers</h2>
            <div className={styles.kpiGrid}>
              <KPICard
                title="Total Customers"
                value={metrics.customers?.total_customers || 0}
                trend={22}
                icon="👤"
              />
              <KPICard
                title="Active This Week"
                value={metrics.customers?.active_this_week || 0}
                icon="🟢"
              />
              <KPICard
                title="Loyal Customers"
                value={`${metrics.customers?.loyal_customers || 0}`}
                unit={`${metrics.customers?.retention_rate || 0}%`}
                icon="💎"
              />
              <KPICard
                title="Satisfaction"
                value={`${parseFloat(metrics.customers?.avg_satisfaction || 0).toFixed(1)}`}
                unit="/5.0"
                icon="😊"
              />
            </div>
          </section>

          {/* Trends */}
          <section className={styles.section}>
            <ChartContainer title="📊 Bookings by Day of Week">
              <div className={styles.trendChart}>
                {metrics.trends?.by_day_of_week?.map((day, idx) => (
                  <div key={idx} className={styles.trendBar}>
                    <div
                      className={styles.bar}
                      style={{
                        height: `${(day.bookings_count / Math.max(...metrics.trends.by_day_of_week.map(d => d.bookings_count)) || 1) * 100}%`
                      }}
                    />
                    <small>{day.day_name?.slice(0, 3)}</small>
                    <tiny>({day.bookings_count})</tiny>
                  </div>
                ))}
              </div>
            </ChartContainer>
          </section>
        </div>
      )}

      {/* Staff Performance Tab */}
      {activeTab === 'staff' && (
        <div className={styles.content}>
          <section className={styles.section}>
            <h2>👥 Staff Performance Ranking</h2>
            <div className={styles.staffTable}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Rating</th>
                    <th>Jobs</th>
                    <th>5-Star</th>
                    <th>Revenue</th>
                    <th>Cancel Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.staff?.staff_ranking?.slice(0, 10)?.map((staff) => (
                    <tr key={staff.id}>
                      <td className={styles.rank}>#{staff.rank}</td>
                      <td className={styles.staffName}>{staff.name}</td>
                      <td>
                        <span className={styles.rating}>
                          ⭐ {parseFloat(staff.avg_rating || 0).toFixed(1)}/5
                        </span>
                      </td>
                      <td>{staff.total_jobs}</td>
                      <td>{staff.five_star_count}</td>
                      <td>R$ {parseFloat(staff.revenue_generated || 0).toFixed(2)}</td>
                      <td>
                        <span className={
                          staff.cancellation_rate > 10 ? styles.high : styles.low
                        }>
                          {parseFloat(staff.cancellation_rate).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* Churn Analysis Tab */}
      {activeTab === 'churn' && (
        <div className={styles.content}>
          <section className={styles.section}>
            <div className={styles.churnAlerts}>
              <div className={styles.alert} style={{ borderLeft: '4px solid #ef4444' }}>
                <h3>🚨 Customers At Risk</h3>
                <p>{churnData?.at_risk_count || 0} clientes em risco crítico</p>
              </div>
              <div className={styles.alert} style={{ borderLeft: '4px solid #f59e0b' }}>
                <h3>⚠️ Warning Zone</h3>
                <p>{churnData?.warning_count || 0} clientes precisam atenção</p>
              </div>
            </div>

            {churnData?.at_risk_customers?.length > 0 && (
              <>
                <h3>Customers At Critical Risk</h3>
                <div className={styles.customersList}>
                  {churnData.at_risk_customers.slice(0, 5).map((customer) => (
                    <div key={customer.id} className={styles.customerItem}>
                      <div>
                        <strong>{customer.name}</strong>
                        <small>{customer.email}</small>
                        <p>Last booking: {customer.days_since_last_booking} days ago</p>
                      </div>
                      <button className={styles.actionButton}>Contact</button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {churnData?.recovery_recommendations?.length > 0 && (
              <>
                <h3>Recovery Recommendations</h3>
                <div className={styles.recommendations}>
                  {churnData.recovery_recommendations.map((rec, idx) => (
                    <div key={idx} className={styles.recommendation}>
                      <h4>{rec.customer_name} - {rec.action}</h4>
                      <p>{rec.reason}</p>
                      <span className={styles.badge}>{rec.suggested_incentive}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {/* Forecast Tab */}
      {activeTab === 'forecast' && (
        <div className={styles.content}>
          <section className={styles.section}>
            <ChartContainer title="🔮 Demand Forecast (Next 30 Days)">
              <div className={styles.forecastChart}>
                {demandForecast?.slice(0, 30)?.map((day, idx) => (
                  <div key={idx} className={styles.forecastBar}>
                    <div
                      className={`${styles.bar} ${
                        day.demand_level === 'high_demand'
                          ? styles.highDemand
                          : day.demand_level === 'normal_demand'
                          ? styles.normalDemand
                          : styles.lowDemand
                      }`}
                      style={{
                        height: `${(day.forecasted_bookings / 30) * 100 + 20}px`
                      }}
                      title={`${day.forecasted_bookings} bookings`}
                    />
                    <small>{idx + 1}</small>
                  </div>
                ))}
              </div>
            </ChartContainer>
          </section>
        </div>
      )}
    </div>
  );
}

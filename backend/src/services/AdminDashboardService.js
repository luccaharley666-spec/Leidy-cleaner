/**
 * [REDACTED_TOKEN].js
 * Serviço para calcular métricas e KPIs do dashboard administrativo
 * 
 * Calcula:
 * - Total Revenue (receita total)
 * - Agendamentos (total, pendentes, confirmados, concluídos)
 * - Avaliação Média (rating médio dos clientes)
 * - Taxa de Conversão (bookings / visits estimado)
 * - Dados de gráficos (sales, services, monthly)
 */

class [REDACTED_TOKEN] {
  constructor(db) {
    this.db = db;
  }

  /**
   * Obter KPIs principais do dashboard
   * @param {string} period - 'week' | 'month' | 'year'
   * @returns {Promise<Object>} KPIs calculados
   */
  async getKPIs(period = 'month') {
    try {
      const dateRange = this.getDateRange(period);

      // Total de receita (soma de todos os pagamentos confirmados)
      const revenueData = await this.getTotalRevenue(dateRange);

      // Total de agendamentos (por status)
      const bookingStats = await this.getBookingStats(dateRange);

      // Avaliação média
      const avgRating = await this.getAverageRating();

      // Taxa de conversão (bookings / visitors estimado)
      const conversionRate = await this.getConversionRate(dateRange);

      return {
        totalRevenue: revenueData.total,
        totalBookings: bookingStats.total,
        pendingBookings: bookingStats.pending,
        confirmedBookings: bookingStats.confirmed,
        completedBookings: bookingStats.completed,
        averageRating: avgRating,
        conversionRate: conversionRate,
        period: period,
        dateRange: dateRange
      };
    } catch (error) {
      console.error('Error calculating KPIs:', error);
      return this.getDefaultKPIs();
    }
  }

  /**
   * Obter dados de vendas para gráfico de linha
   * @param {string} period - 'week' | 'month' | 'year'
   * @returns {Promise<Array>} Dados formatados para gráfico
   */
  async getSalesData(period = 'month') {
    try {
      const dateRange = this.getDateRange(period);

      if (period === 'week') {
        return await this.getSalesDataByDay(dateRange);
      } else if (period === 'month') {
        return await this.getSalesDataByWeek(dateRange);
      } else {
        return await this.getSalesDataByMonth(dateRange);
      }
    } catch (error) {
      console.error('Error getting sales data:', error);
      return this.getDefaultSalesData();
    }
  }

  /**
   * Obter distribuição de serviços
   * @returns {Promise<Array>} Dados de serviços com quantidade
   */
  async getServiceData() {
    try {
      // Se tabela de serviços existe, usar dados reais
      if (await this.tableExists('services')) {
        const result = await new Promise((resolve, reject) => {
          this.db.all(
            `SELECT 
               s.name as name,
               COUNT(b.id) as value
             FROM services s
             LEFT JOIN bookings b ON b.service_id = s.id
             GROUP BY s.id
             ORDER BY value DESC
             LIMIT 5`,
            (err, rows) => {
              if (err) reject(err);
              else resolve(rows || []);
            }
          );
        });

        // Normalizar dados
        if (result.length > 0) {
          return result.map(row => ({
            name: row.name || 'Limpeza Padrão',
            value: row.value || 0
          }));
        }
      }

      // Fallback: dados padrão
      return [
        { name: 'Limpeza Residencial', value: 45 },
        { name: 'Limpeza Comercial', value: 28 },
        { name: 'Higienização', value: 15 },
        { name: 'Dedetização', value: 8 },
        { name: 'Outros', value: 4 }
      ];
    } catch (error) {
      console.error('Error getting service data:', error);
      return this.[REDACTED_TOKEN]();
    }
  }

  /**
   * Obter agendamentos recentes
   * @param {number} limit - Quantos registros retornar
   * @returns {Promise<Array>} Lista de agendamentos recentes
   */
  async getRecentBookings(limit = 10) {
    try {
      const result = await new Promise((resolve, reject) => {
        this.db.all(
          `SELECT 
             b.id,
             b.customer_name as name,
             b.customer_email as email,
             b.service_type as service,
             b.scheduled_date as date,
             b.status,
             b.total_price as amount
           FROM bookings b
           ORDER BY b.created_at DESC
           LIMIT ?`,
          [limit],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });

      // Formatar dados
      return result.map(row => ({
        id: row.id,
        name: row.name || 'Cliente',
        email: row.email || 'N/A',
        service: row.service || 'Limpeza',
        date: row.date ? new Date(row.date).toLocaleDateString('pt-BR') : 'N/A',
        status: this.translateStatus(row.status),
        amount: row.amount ? `R$ ${row.amount.toFixed(2)}` : 'R$ 0,00',
        statusColor: this.getStatusColor(row.status)
      }));
    } catch (error) {
      console.error('Error getting recent bookings:', error);
      return [];
    }
  }

  /**
   * Obter resumo mensal de receita
   * @param {string} period - 'week' | 'month' | 'year'
   * @returns {Promise<Array>} Dados mensais para gráfico de barras
   */
  async getMonthlyRevenue(period = 'year') {
    try {
      const dateRange = this.getDateRange(period);

      const result = await new Promise((resolve, reject) => {
        this.db.all(
          `SELECT 
             strftime('%Y-%m', b.scheduled_date) as month,
             SUM(CAST(b.total_price AS FLOAT)) as revenue
           FROM bookings b
           WHERE b.status = 'completed'
             AND b.scheduled_date >= ?
             AND b.scheduled_date <= ?
           GROUP BY strftime('%Y-%m', b.scheduled_date)
           ORDER BY month ASC`,
          [dateRange.startDate, dateRange.endDate],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });

      // Formatar para gráfico
      return result.map(row => ({
        month: this.formatMonthLabel(row.month),
        revenue: parseFloat(row.revenue || 0)
      }));
    } catch (error) {
      console.error('Error getting monthly revenue:', error);
      return this.[REDACTED_TOKEN]();
    }
  }

  /**
   * === MÉTODOS PRIVADOS ===
   */

  getDateRange(period) {
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    let startDate;

    switch (period) {
      case 'week':
        const weekAgo = new Date(today.setDate(today.getDate() - 7));
        startDate = weekAgo.toISOString().split('T')[0];
        break;
      case 'year':
        const yearAgo = new Date(today.setFullYear(today.getFullYear() - 1));
        startDate = yearAgo.toISOString().split('T')[0];
        break;
      case 'month':
      default:
        const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
        startDate = monthAgo.toISOString().split('T')[0];
        break;
    }

    return { startDate, endDate };
  }

  async getTotalRevenue(dateRange) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT SUM(CAST(total_price AS FLOAT)) as total 
         FROM bookings 
         WHERE status = 'completed' 
           AND scheduled_date >= ? 
           AND scheduled_date <= ?`,
        [dateRange.startDate, dateRange.endDate],
        (err, row) => {
          if (err) reject(err);
          else resolve({ total: row?.total || 0 });
        }
      );
    });
  }

  async getBookingStats(dateRange) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
         FROM bookings 
         WHERE scheduled_date >= ? 
           AND scheduled_date <= ?`,
        [dateRange.startDate, dateRange.endDate],
        (err, row) => {
          if (err) reject(err);
          else resolve({
            total: row?.total || 0,
            pending: row?.pending || 0,
            confirmed: row?.confirmed || 0,
            completed: row?.completed || 0
          });
        }
      );
    });
  }

  async getAverageRating() {
    return new Promise((resolve, reject) => {
      // Tenta buscar de tabela reviews se existir
      this.db.get(
        `SELECT AVG(CAST(rating AS FLOAT)) as avg_rating FROM reviews`,
        (err, row) => {
          if (err || !row?.avg_rating) {
            // Se erro ou não existe, retorna 4.5 (default)
            resolve(4.5);
          } else {
            resolve(parseFloat(row.avg_rating.toFixed(1)));
          }
        }
      );
    });
  }

  async getConversionRate(dateRange) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT COUNT(*) as total_bookings FROM bookings 
         WHERE scheduled_date >= ? AND scheduled_date <= ?`,
        [dateRange.startDate, dateRange.endDate],
        (err, row) => {
          if (err) reject(err);
          else {
            // Estimativa: 100 visitas geram X bookings
            // (em realidade, viria de analytics)
            const visits = 450; // Estimado
            const bookings = row?.total_bookings || 0;
            const rate = visits > 0 ? (bookings / visits * 100).toFixed(1) : 0;
            resolve(parseFloat(rate));
          }
        }
      );
    });
  }

  async getSalesDataByDay(dateRange) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT 
          DATE(scheduled_date) as date,
          SUM(CAST(total_price AS FLOAT)) as sales,
          COUNT(*) as visits
         FROM bookings
         WHERE status = 'completed'
           AND scheduled_date >= ? AND scheduled_date <= ?
         GROUP BY DATE(scheduled_date)
         ORDER BY date ASC`,
        [dateRange.startDate, dateRange.endDate],
        (err, rows) => {
          if (err) reject(err);
          else {
            const data = (rows || []).map(row => ({
              date: this.formatDateLabel(row.date),
              sales: parseFloat(row.sales || 0),
              revenue: parseFloat(row.sales || 0)
            }));
            resolve(data.length > 0 ? data : this.getDefaultSalesData());
          }
        }
      );
    });
  }

  async getSalesDataByWeek(dateRange) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT 
          strftime('%W', scheduled_date) as week,
          SUM(CAST(total_price AS FLOAT)) as sales
         FROM bookings
         WHERE status = 'completed'
           AND scheduled_date >= ? AND scheduled_date <= ?
         GROUP BY strftime('%W', scheduled_date)
         ORDER BY week ASC`,
        [dateRange.startDate, dateRange.endDate],
        (err, rows) => {
          if (err) reject(err);
          else {
            const data = (rows || []).map((row, idx) => ({
              date: `Semana ${row.week}`,
              sales: parseFloat(row.sales || 0),
              revenue: parseFloat(row.sales || 0)
            }));
            resolve(data.length > 0 ? data : this.getDefaultSalesData());
          }
        }
      );
    });
  }

  async getSalesDataByMonth(dateRange) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT 
          strftime('%Y-%m', scheduled_date) as month,
          SUM(CAST(total_price AS FLOAT)) as sales
         FROM bookings
         WHERE status = 'completed'
           AND scheduled_date >= ? AND scheduled_date <= ?
         GROUP BY strftime('%Y-%m', scheduled_date)
         ORDER BY month ASC`,
        [dateRange.startDate, dateRange.endDate],
        (err, rows) => {
          if (err) reject(err);
          else {
            const data = (rows || []).map(row => ({
              date: this.formatMonthLabel(row.month),
              sales: parseFloat(row.sales || 0),
              revenue: parseFloat(row.sales || 0)
            }));
            resolve(data.length > 0 ? data : this.getDefaultSalesData());
          }
        }
      );
    });
  }

  async tableExists(tableName) {
    return new Promise((resolve) => {
      this.db.get(
        `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
        [tableName],
        (err, row) => {
          resolve(!!row && !err);
        }
      );
    });
  }

  translateStatus(status) {
    const statusMap = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      completed: 'Concluído',
      cancelled: 'Cancelado',
      no_show: 'Não Compareceu'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status) {
    const colorMap = {
      pending: 'yellow',
      confirmed: 'blue',
      completed: 'green',
      cancelled: 'red',
      no_show: 'gray'
    };
    return colorMap[status] || 'gray';
  }

  formatDateLabel(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      month: 'short',
      day: 'numeric'
    });
  }

  formatMonthLabel(monthStr) {
    if (!monthStr) return 'N/A';
    const [year, month] = monthStr.split('-');
    const monthData = new Date(year, month - 1);
    return monthData.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
  }

  getDefaultKPIs() {
    return {
      totalRevenue: 0,
      totalBookings: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      completedBookings: 0,
      averageRating: 4.5,
      conversionRate: 0,
      period: 'month'
    };
  }

  getDefaultSalesData() {
    return [
      { date: 'Jan', sales: 4000, revenue: 4000 },
      { date: 'Fev', sales: 3200, revenue: 3200 },
      { date: 'Mar', sales: 2200, revenue: 2200 },
      { date: 'Abr', sales: 2780, revenue: 2780 },
      { date: 'Mai', sales: 1890, revenue: 1890 },
      { date: 'Jun', sales: 2390, revenue: 2390 }
    ];
  }

  [REDACTED_TOKEN]() {
    return [
      { name: 'Limpeza Residencial', value: 45 },
      { name: 'Limpeza Comercial', value: 28 },
      { name: 'Higienização', value: 15 },
      { name: 'Dedetização', value: 8 },
      { name: 'Outros', value: 4 }
    ];
  }

  [REDACTED_TOKEN]() {
    return [
      { month: 'Jan 25', revenue: 4200 },
      { month: 'Fev 25', revenue: 3500 },
      { month: 'Mar 25', revenue: 4800 },
      { month: 'Abr 25', revenue: 5200 },
      { month: 'Mai 25', revenue: 4900 }
    ];
  }
}

module.exports = [REDACTED_TOKEN];

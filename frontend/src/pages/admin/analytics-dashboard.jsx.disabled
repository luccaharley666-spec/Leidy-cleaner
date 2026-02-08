/**
 * Admin Analytics Page
 * Full-featured analytics dashboard for admin users
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AnalyticsDashboard } from '@/components/Dashboard/AnalyticsDashboard';
import useAnalytics from '@/hooks/useAnalytics';
import { authenticateToken } from '@/middleware/auth';

export default function AdminAnalytics() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState('30days');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);

  const { data, loading, error, refetch, exportReport } = useAnalytics(dateRange);

  // Update when date range changes
  useEffect(() => {
    setDateRange(router.query.range || '30days');
  }, [router.query.range]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportReport(exportFormat, { dateRange });
      // Success - file downloaded
    } catch (err) {
      console.error('Export failed:', err);
      alert('Falha ao exporting relatório');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    router.push(`/admin/analytics?range=${range}`, undefined, { shallow: true });
  };

  return (
    <>
      <Head>
        <title>Admin Analytics Dashboard - Avante</title>
        <meta name="description" content="Platform analytics and reporting dashboard" />
      </Head>

      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600 mt-1">Comprehensive platform metrics and insights</p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Carregando...' : 'Atualizar'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              Erro ao carregar analytics: {error}
            </div>
          )}

          {/* Toolbar */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => handleDateRangeChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="7days">Últimos 7 dias</option>
                  <option value="30days">Últimos 30 dias</option>
                  <option value="90days">Últimos 90 dias</option>
                  <option value="1year">Último ano</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel (XLSX)</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleExport}
                  disabled={isExporting || loading}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {isExporting ? 'Exportando...' : `Export ${exportFormat.toUpperCase()}`}
                </button>
              </div>
            </div>
          </div>

          {/* Analytics Dashboard Component */}
          <AnalyticsDashboard
            data={data}
            loading={loading}
            error={error}
          />
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}

// Server-side authentication check
export async function getServerSideProps(context) {
  try {
    const token = context.req.cookies.token;

    if (!token) {
      return {
        redirect: {
          destination: '/login',
          permanent: false
        }
      };
    }

    // Verify token (optional - can be done in middleware)
    // const user = await authenticateToken(token);
    // if (!user || user.role !== 'admin') {
    //   return {
    //     redirect: {
    //       destination: '/dashboard',
    //       permanent: false
    //     }
    //   };
    // }

    return {
      props: {
        initialToken: token
      }
    };
  } catch (error) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    };
  }
}

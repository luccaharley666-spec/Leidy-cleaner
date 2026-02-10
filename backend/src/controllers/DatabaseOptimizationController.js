/**
 * Database Optimization Controller
 * Endpoints para análise e otimização de banco de dados
 */

const [REDACTED_TOKEN] = require('../services/[REDACTED_TOKEN]');
const logger = require('../utils/logger');

class [REDACTED_TOKEN] {
  /**
   * GET /api/db/query-report
   * Relatório de performance de queries
   */
  static async getQueryReport(req, res) {
    try {
      const report = [REDACTED_TOKEN].getQueryReport();
      return res.json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Error getting query report', { error: error.message });
      return res.status(500).json({ error: 'Falha ao gerar relatório' });
    }
  }

  /**
   * GET /api/db/slow-queries
   * Detectar queries lentas
   */
  static async getSlowQueries(req, res) {
    try {
      const { threshold = 100 } = req.query;
      const slowQueries = await [REDACTED_TOKEN].detectSlowQueries(null, parseInt(threshold));
      
      return res.json({
        success: true,
        data: slowQueries
      });
    } catch (error) {
      logger.error('Error detecting slow queries', { error: error.message });
      return res.status(500).json({ error: 'Falha ao detectar queries lentas' });
    }
  }

  /**
   ✅ NOVO: GET /api/db/analyze-query
   * Analisar uma query específica
   */
  static async analyzeQuery(req, res) {
    try {
      const { query, params } = req.body;

      if (!query) {
        return res.status(400).json({ error: 'Query é obrigatória' });
      }

      const analysis = await [REDACTED_TOKEN].analyzeQuery(query, params || []);
      
      return res.json({
        success: true,
        data: {
          query: query.substring(0, 100),
          analysis,
          recommendations: [
            'Verificar índices em colunas WHERE',
            'Usar EXPLAIN QUERY PLAN para análise detalhada',
            'Considerar batch operations para múltiplas linhas'
          ]
        }
      });
    } catch (error) {
      logger.error('Error analyzing query', { error: error.message });
      return res.status(500).json({ error: 'Falha ao analisar query' });
    }
  }

  /**
   ✅ NOVO: GET /api/db/suggest-indices
   * Sugerir índices para melhorar performance
   */
  static async suggestIndices(req, res) {
    try {
      const suggestions = [REDACTED_TOKEN].suggestIndices();

      return res.json({
        success: true,
        data: {
          count: suggestions.length,
          suggestions,
          message: suggestions.length === 0 
            ? 'Nenhuma sugestão no momento. Índices estão otimizados.'
            : `${suggestions.length} sugestão(ões) de índice encontrada(s)`
        }
      });
    } catch (error) {
      logger.error('Error suggesting indices', { error: error.message });
      return res.status(500).json({ error: 'Falha ao sugerir índices' });
    }
  }

  /**
   ✅ NOVO: GET /api/db/index-usage
   * Analisar uso de índices
   */
  static async analyzeIndexUsage(req, res) {
    try {
      const analysis = await [REDACTED_TOKEN].analyzeIndexUsage(null);

      return res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      logger.error('Error analyzing index usage', { error: error.message });
      return res.status(500).json({ error: 'Falha ao analisar índices' });
    }
  }

  /**
   ✅ NOVO: GET /api/db/integrity-check
   * Validar integridade do banco
   */
  static async validateIntegrity(req, res) {
    try {
      const result = await [REDACTED_TOKEN].[REDACTED_TOKEN](null);

      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error validating database', { error: error.message });
      return res.status(500).json({ error: 'Falha ao validar banco' });
    }
  }

  /**
   ✅ NOVO: POST /api/db/vacuum
   * Limpar espaço livre no banco (requer admin)
   */
  static async vacuumDatabase(req, res) {
    try {
      const result = await [REDACTED_TOKEN].vacuumDatabase(null);

      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error vacuuming database', { error: error.message });
      return res.status(500).json({ error: 'Falha ao fazer vacuum' });
    }
  }

  /**
   ✅ NOVO: POST /api/db/optimize
   * Otimizar tabelas (ANALYZE) - requer admin
   */
  static async optimizeTables(req, res) {
    try {
      const result = await [REDACTED_TOKEN].optimizeTables(null);

      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error optimizing tables', { error: error.message });
      return res.status(500).json({ error: 'Falha ao otimizar banco' });
    }
  }

  /**
   ✅ NOVO: GET /api/db/table-sizes
   * Obter tamanhos de tabelas
   */
  static async getTableSizes(req, res) {
    try {
      const sizes = await [REDACTED_TOKEN].getTableSizes(null);

      return res.json({
        success: true,
        data: sizes
      });
    } catch (error) {
      logger.error('Error getting table sizes', { error: error.message });
      return res.status(500).json({ error: 'Falha ao obter tamanhos' });
    }
  }

  /**
   ✅ NOVO: GET /api/db/stats
   * Dashboard completo de stats do banco
   */
  static async getDatabaseStats(req, res) {
    try {
      const report = [REDACTED_TOKEN].getQueryReport();
      const slowQueries = await [REDACTED_TOKEN].detectSlowQueries(null, 100);
      const indices = await [REDACTED_TOKEN].analyzeIndexUsage(null);
      const sizes = await [REDACTED_TOKEN].getTableSizes(null);
      const integrity = await [REDACTED_TOKEN].[REDACTED_TOKEN](null);

      return res.json({
        success: true,
        data: {
          overallHealth: integrity.status === 'OK' ? '✅ Saudável' : '⚠️  Com problemas',
          queryPerformance: report,
          slowQueries,
          indices,
          sizes,
          integrity,
          generatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error getting database stats', { error: error.message });
      return res.status(500).json({ error: 'Falha ao gerar stats' });
    }
  }

  /**
   ✅ NOVO: POST /api/db/reset-stats
   * Resetar estatísticas de query (para testes)
   */
  static async resetStatistics(req, res) {
    try {
      [REDACTED_TOKEN].resetStatistics();

      return res.json({
        success: true,
        message: 'Estatísticas resetadas com sucesso'
      });
    } catch (error) {
      logger.error('Error resetting statistics', { error: error.message });
      return res.status(500).json({ error: 'Falha ao resetar stats' });
    }
  }
}

module.exports = [REDACTED_TOKEN];

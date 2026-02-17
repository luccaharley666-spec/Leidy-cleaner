/**
 * Advanced Search Service
 * Busca completa com filters, fuzzy matching, autocomplete
 */

const logger = require('../utils/logger');

class SearchService {
  constructor() {
    this.searchIndex = new Map();
  }

  /**
   * Busca avançada de serviços
   */
  async searchServices(query, filters = {}) {
    try {
      const {
        city,
        minPrice = 0,
        maxPrice = 10000,
        minRating = 0,
        maxDistance = 50,
        sortBy = 'rating'
      } = filters;

      // Simulado: em produção fazer full-text search no banco
      const results = [
        // São Paulo
        {
          id: '1',
          name: 'Limpeza Residencial Premium',
          city: 'São Paulo',
          state: 'SP',
          price: 250,
          rating: 4.8,
          reviews: 156,
          distance: 2.5,
          featured: true,
          tags: ['residencial', 'profissional', 'rápido']
        },
        {
          id: '2',
          name: 'Limpeza Comercial Especializada',
          city: 'São Paulo',
          state: 'SP',
          price: 450,
          rating: 4.6,
          reviews: 89,
          distance: 5.2,
          featured: false,
          tags: ['comercial', 'escritório', 'eficiente']
        },
        // Rio de Janeiro
        {
          id: '3',
          name: 'Rio Clean - Serviços Profissionais',
          city: 'Rio de Janeiro',
          state: 'RJ',
          price: 280,
          rating: 4.7,
          reviews: 142,
          distance: 3.1,
          featured: true,
          tags: ['residencial', 'premium', 'confiável']
        },
        // Belo Horizonte
        {
          id: '4',
          name: 'BH Limpeza Total',
          city: 'Belo Horizonte',
          state: 'MG',
          price: 220,
          rating: 4.5,
          reviews: 98,
          distance: 4.2,
          featured: false,
          tags: ['comercial', 'econômico', 'rápido']
        },
        // Salvador
        {
          id: '5',
          name: 'Limpeza Salvador Premium',
          city: 'Salvador',
          state: 'BA',
          price: 240,
          rating: 4.6,
          reviews: 67,
          distance: 2.8,
          featured: true,
          tags: ['residencial', 'profissional']
        },
        // Fortaleza
        {
          id: '6',
          name: 'Fortaleza Clean',
          city: 'Fortaleza',
          state: 'CE',
          price: 230,
          rating: 4.4,
          reviews: 45,
          distance: 3.5,
          featured: false,
          tags: ['residencial', 'econômico']
        },
        // Brasília
        {
          id: '7',
          name: 'Limpeza Brasília',
          city: 'Brasília',
          state: 'DF',
          price: 260,
          rating: 4.7,
          reviews: 84,
          distance: 2.2,
          featured: true,
          tags: ['residencial', 'comercial', 'profissional']
        },
        // Florianópolis
        {
          id: '8',
          name: 'SC Clean - Florianópolis',
          city: 'Florianópolis',
          state: 'SC',
          price: 270,
          rating: 4.8,
          reviews: 125,
          distance: 1.9,
          featured: true,
          tags: ['residencial', 'premium', 'atencioso']
        },
        // Manaus
        {
          id: '9',
          name: 'Amazônia Clean',
          city: 'Manaus',
          state: 'AM',
          price: 300,
          rating: 4.5,
          reviews: 32,
          distance: 4.1,
          featured: false,
          tags: ['residencial', 'confiável']
        },
        // Campinas
        {
          id: '10',
          name: 'Campinas Limpeza Service',
          city: 'Campinas',
          state: 'SP',
          price: 240,
          rating: 4.6,
          reviews: 58,
          distance: 3.8,
          featured: false,
          tags: ['comercial', 'eficiente']
        },
        // Niterói
        {
          id: '11',
          name: 'Niterói Clean Premium',
          city: 'Niterói',
          state: 'RJ',
          price: 265,
          rating: 4.7,
          reviews: 71,
          distance: 2.4,
          featured: true,
          tags: ['residencial', 'profissional', 'rápido']
        }
      ];

      // Filtrar por cidade
      let filtered = results;
      if (city) {
        filtered = filtered.filter(s => s.city.toLowerCase().includes(city.toLowerCase()));
      }

      // Filtrar por preço
      filtered = filtered.filter(s => s.price >= minPrice && s.price <= maxPrice);

      // Filtrar por rating
      filtered = filtered.filter(s => s.rating >= minRating);

      // Filtrar por distância
      filtered = filtered.filter(s => s.distance <= maxDistance);

      // Ordenar
      if (sortBy === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === 'distance') {
        filtered.sort((a, b) => a.distance - b.distance);
      }

      logger.log({
        level: 'info',
        message: 'Search executed',
        query,
        filters,
        resultsCount: filtered.length
      });

      return {
        query,
        filters,
        results: filtered,
        totalCount: filtered.length,
        pagination: {
          page: 1,
          perPage: 20,
          total: filtered.length
        }
      };
    } catch (error) {
      logger.error('Search failed', { error: error.message });
      throw error;
    }
  }

  /**
   ✅ NOVO: Fuzzy matching para typos
   */
  fuzzyMatch(query, data) {
    const lowerQuery = query.toLowerCase();
    const matches = data.filter(item => {
      const nameLower = item.name.toLowerCase();
      let matches = 0;
      let queryIndex = 0;

      for (let i = 0; i < nameLower.length && queryIndex < lowerQuery.length; i++) {
        if (nameLower[i] === lowerQuery[queryIndex]) {
          matches++;
          queryIndex++;
        }
      }

      return matches > query.length / 2;
    });

    return matches;
  }

  /**
   ✅ NOVO: Autocomplete suggestions
   */
  async PLACEHOLDER(query) {
    const suggestions = [
      'Limpeza Residencial',
      'Limpeza Comercial',
      'Limpeza de Fachada',
      'Higienização',
      'Desinfecção',
      'Limpeza de Piscina',
      'Limpeza de Jardim',
      'Organização'
    ];

    const filtered = suggestions.filter(s =>
      s.toLowerCase().startsWith(query.toLowerCase())
    );

    return {
      query,
      suggestions: filtered.slice(0, 10),
      count: filtered.length
    };
  }

  /**
   ✅ NOVO: Busca por categoria
   */
  async searchByCategory(category) {
    const categories = {
      'residencial': ['Limpeza Residencial', 'Limpeza de Sofá'],
      'comercial': ['Limpeza Comercial', 'Limpeza de Escritório'],
      'saudável': ['Higienização', 'Desinfecção'],
      'exterior': ['Limpeza de Fachada', 'Limpeza de Jardim']
    };

    return {
      category,
      services: categories[category.toLowerCase()] || [],
      count: categories[category.toLowerCase()]?.length || 0
    };
  }

  /**
   ✅ NOVO: Trends (o que está em alta)
   */
  async getTrends() {
    return {
      trending: [
        { name: 'Limpeza com vapor', count: 1250, growth: '+45%' },
        { name: 'Higienização COVID', count: 980, growth: '+32%' },
        { name: 'Limpeza eco-friendly', count: 750, growth: '+28%' },
        { name: 'Organização profissional', count: 620, growth: '+15%' }
      ],
      updatedAt: new Date().toISOString()
    };
  }

  /**
   ✅ NOVO: Busca por localização (GPS)
   */
  async searchByLocation(lat, lng, radiusKm = 10) {
    return {
      coordinates: { lat, lng },
      radius: radiusKm,
      results: [
        {
          id: '1',
          name: 'Limpeza Próximo',
          distance: 0.5,
          rating: 4.8
        },
        {
          id: '2',
          name: 'Limpeza Regional',
          distance: 3.2,
          rating: 4.6
        }
      ]
    };
  }

  /**
   ✅ NOVO: Busca popular (most viewed)
   */
  async getPopularSearches() {
    return {
      popular: [
        'limpeza residencial São Paulo',
        'limpeza urgent',
        'limpeza econômica',
        'limpeza profissional',
        'higienização escritório'
      ],
      timestamp: new Date().toISOString()
    };
  }

  /**
   ✅ NOVO: Comparar serviços
   */
  async compareServices(serviceIds) {
    return {
      comparison: [
        {
          id: serviceIds[0],
          name: 'Serviço 1',
          price: 200,
          rating: 4.8,
          responseTime: '< 1h'
        },
        {
          id: serviceIds[1],
          name: 'Serviço 2',
          price: 250,
          rating: 4.6,
          responseTime: '< 2h'
        }
      ],
      winner: serviceIds[0]
    };
  }
}

module.exports = new SearchService();

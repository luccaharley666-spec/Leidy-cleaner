/**
 * ServiceSearch.jsx - Componente de Busca e Filtro de Serviços
 * Feature útil #1
 */

import React, { useState, useMemo } from 'react';
import styles from './ServiceSearch.module.css';

const ServiceSearch = ({ services = [], onSelect, maxHeight = '400px' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: '🏠 Todos', icon: 'all' },
    { value: 'residential', label: '🏠 Residencial', icon: 'home' },
    { value: 'commercial', label: '🏢 Comercial', icon: 'building' },
    { value: 'specialized', label: '✨ Especializados', icon: 'star' },
  ];

  const defaultServices = [
    { id: 1, name: 'Limpeza Residencial', category: 'residential', price: 150, icon: '🏠', time: '2-3h' },
    { id: 2, name: 'Limpeza Profunda', category: 'specialized', price: 250, icon: '✨', time: '4-5h' },
    { id: 3, name: 'Limpeza de Vidros', category: 'specialized', price: 100, icon: '🪟', time: '1-2h' },
    { id: 4, name: 'Limpeza de Tapetes', category: 'specialized', price: 80, icon: '🧽', time: '1-3h' },
    { id: 5, name: 'Limpeza Comercial', category: 'commercial', price: 300, icon: '🏢', time: '3-6h' },
    { id: 6, name: 'Limpeza de Áreas Externas', category: 'residential', price: 120, icon: '🌳', time: '1-2h' },
  ];

  const servicesList = services.length > 0 ? services : defaultServices;

  const filtered = useMemo(() => {
    return servicesList.filter(service => {
      const matchSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = selectedCategory === 'all' || service.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [searchTerm, selectedCategory, servicesList]);

  return (
    <div className={styles.container}>
      {/* Search Bar */}
      <div className={styles.searchBar}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          placeholder="Buscar serviço..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className={styles.clearBtn}
            title="Limpar busca"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className={styles.categoryTabs}>
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`${styles.categoryTab} ${selectedCategory === cat.value ? styles.active : ''}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className={styles.results} style={{ maxHeight }}>
        {filtered.length > 0 ? (
          <div className={styles.servicesList}>
            {filtered.map(service => (
              <div
                key={service.id}
                className={styles.serviceCard}
                onClick={() => onSelect && onSelect(service)}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.icon}>{service.icon}</span>
                  <div className={styles.cardInfo}>
                    <h4 className={styles.serviceName}>{service.name}</h4>
                    <span className={styles.time}>⏱️ {service.time}</span>
                  </div>
                  <span className={styles.price}>R$ {service.price}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>😕 Nenhum serviço encontrado</p>
            <small>Tente outro termo de busca</small>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className={styles.footer}>
        <small>{filtered.length} serviço{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</small>
      </div>
    </div>
  );
};

export default ServiceSearch;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GeoMap.css';

const GeoMap = ({ userId, token, onSelectProfessional }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyProfessionals, setNearbyProfessionals] = useState([]);
  const [radius, setRadius] = useState(5);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    fetchUserAddresses();
    getUserLocation(); }, []);

  const fetchUserAddresses = async () => {
    try {
      const res = await axios.get('/api/geolocation/addresses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(res.data.addresses || []);
    } catch (error) {
      console.error('Erro ao buscar endereços:', error);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          setMessage('✅ Localização obtida com sucesso');
        },
        () => {
          setMessage('⚠️ Permita acesso à sua localização');
        }
      );
    } else {
      setMessage('❌ Geolocalização não suportada');
    }
  };

  const handleAddressSelect = async (address) => {
    try {
      setLoading(true);
      // Geocodificar o endereço
      const geocodeRes = await axios.post(
        '/api/geolocation/geocode',
        { address },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { latitude, longitude } = geocodeRes.data.coordinates || {};
      setUserLocation({ latitude, longitude });
      setSelectedAddress(address);
      await fetchNearby(latitude, longitude);
    } catch (error) {
      setMessage('❌ Erro ao geocodificar endereço');
    } finally {
      setLoading(false);
    }
  };
  const fetchNearby = async (lat, lng) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `/api/geolocation/nearby?latitude=${lat}&longitude=${lng}&radiusKm=${radius}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNearbyProfessionals(res.data.professionals || []);
      if ((res.data.professionals || []).length === 0) {
        setMessage(`⚠️ Nenhum profissional encontrado em ${radius}km`);
      }
    } catch (error) {
      setMessage('❌ Erro ao buscar profissionais');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = () => {
    if (!userLocation) {
      setMessage('❌ Obtenha sua localização primeiro');
      return;
    }
    fetchNearby(userLocation.latitude, userLocation.longitude);
  };

  return (
    <div className="geo-map">
      <h2>📍 Profissionais Próximos</h2>

      {message && (
        <div className={`geo-message ${message.includes('✅') ? 'success' : message.includes('⚠️') ? 'warning' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="location-controls">
        <div className="control-group">
          <label>Meu Local</label>
          {userLocation ? (
            <p className="location-info">
              📍 {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
            </p>
          ) : (
            <button className="btn-secondary" onClick={getUserLocation}>
              📍 Usar Minha Localização
            </button>
          )}
        </div>

        {addresses.length > 0 && (
          <div className="control-group">
            <label>Ou selecione um endereço salvo</label>
            <select
              className="address-select"
              value={selectedAddress}
              onChange={(e) => handleAddressSelect(e.target.value)}
            >
              <option value="">Escolha um endereço</option>
              {addresses.map((addr) => (
                <option key={addr.id} value={addr.address}>
                  {addr.address}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="control-group">
          <label>Raio de Busca: {radius}km</label>
          <input
            type="range"
            min="1"
            max="50"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="radius-slider"
          />
        </div>

        <button
          className="btn-primary"
          onClick={handleSearchClick}
          disabled={!userLocation || loading}
        >
          {loading ? 'Procurando...' : '🔍 Buscar Profissionais'}
        </button>
      </div>

      {nearbyProfessionals.length > 0 && (
        <div className="professionals-list">
          <h3>Encontrados {nearbyProfessionals.length} profissionais</h3>
          <div className="professionals-grid">
            {nearbyProfessionals.map((professional) => (
              <div key={professional.id} className="professional-card">
                <div className="professional-header">
                  <h4>{professional.name}</h4>
                  <span className="distance">
                    📍 {professional.distance?.toFixed(1) || '?'} km
                  </span>
                </div>

                <p className="professional-info">
                  {professional.service} • ⭐ {professional.rating || 'N/A'}
                </p>

                { professional.address && (
                  <p className="decoded">{professional.address}</p>
                )}

                <button
                  className="decoded"
                  onClick={() => onSelectProfessional?.(professional)}
                >
                  Selecionar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && <div className="geo-loading">Procurando profissionais...</div>}
    </div>
  );
};

export default GeoMap;

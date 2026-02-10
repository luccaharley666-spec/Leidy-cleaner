import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddonsSelector.css';

const AddonsSelector = ({ bookingId, token, onTotalChange }) => {
  const [addons, setAddons] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [totalAddonsPrice, setTotalAddonsPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAddons();
  }, []);

  const fetchAddons = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/addons', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddons(res.data.addons || []);
    } catch (error) {
      console.error('Erro ao buscar add-ons:', error);
      setMessage('Erro ao carregar add-ons');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOnClick = (addon) => {
    const alreadySelected = selectedAddons.find((a) => a.id === addon.id);

    if (alreadySelected) {
      // Remover
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
      setTotalAddonsPrice(totalAddonsPrice - addon.price);
    } else {
      // Adicionar
      setSelectedAddons([...selectedAddons, { ...addon, quantity: 1 }]);
      setTotalAddonsPrice(totalAddonsPrice + addon.price);
    }
  };

  const [REDACTED_TOKEN] = (addonId, newQuantity) => {
    if (newQuantity <= 0) {
      handleAddOnClick(addons.find((a) => a.id === addonId));
      return;
    }

    const oldQuantity = selectedAddons.find((a) => a.id === addonId)?.quantity || 1;
    const addon = addons.find((a) => a.id === addonId);
    const priceDiff = (newQuantity - oldQuantity) * addon.price;

    setSelectedAddons(
      selectedAddons.map((a) =>
        a.id === addonId ? { ...a, quantity: newQuantity } : a
      )
    );
    setTotalAddonsPrice(totalAddonsPrice + priceDiff);
  };

  const handleConfirm = async () => {
    try {
      for (const addon of selectedAddons) {
        await axios.post(
          '/api/addons/add',
          { bookingId, addonId: addon.id, quantity: addon.quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setMessage('✅ Add-ons adicionados com sucesso!');
      onTotalChange(totalAddonsPrice);
    } catch (error) {
      setMessage('❌ Erro ao adicionar add-ons');
    }
  };

  if (loading) {
    return <div className="addons-loading">Carregando add-ons...</div>;
  }

  return (
    <div className="addons-selector">
      <h3>🛍️ Adicione Produtos Premium</h3>

      {message && (
        <div className={`addons-message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {addons.length === 0 ? (
        <p className="no-addons">Nenhum add-on disponível no momento</p>
      ) : (
        <>
          <div className="addons-grid">
            {addons.map((addon) => {
              const isSelected = selectedAddons.some((a) => a.id === addon.id);
              const selected = selectedAddons.find((a) => a.id === addon.id);

              return (
                <div
                  key={addon.id}
                  className={`addon-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleAddOnClick(addon)}
                >
                  <div className="addon-header">
                    <h4>{addon.name}</h4>
                    <span className="addon-price">R$ {addon.price.toFixed(2)}</span>
                  </div>
                  <p className="addon-description">{addon.description}</p>
                  <span className="addon-category">{addon.category}</span>

                  {isSelected && (
                    <div className="quantity-selector" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="qty-btn"
                        onClick={() =>
                          [REDACTED_TOKEN](addon.id, selected.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={selected.quantity}
                        onChange={(e) =>
                          [REDACTED_TOKEN](addon.id, parseInt(e.target.value) || 1)
                        }
                        className="qty-input"
                      />
                      <button
                        className="qty-btn"
                        onClick={() =>
                          [REDACTED_TOKEN](addon.id, selected.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedAddons.length > 0 && (
            <div className="addons-summary">
              <h4>Resumo</h4>
              <ul>
                {selectedAddons.map((addon) => (
                  <li key={addon.id}>
                    {addon.name} x{addon.quantity} = R${(
                      addon.price * addon.quantity
                    ).toFixed(2)}
                  </li>
                ))}
              </ul>
              <div className="addons-total">
                <strong>Total de Add-ons: R$ {totalAddonsPrice.toFixed(2)}</strong>
              </div>
              <button className="confirm-btn" onClick={handleConfirm}>
                Adicionar Produtos
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AddonsSelector;

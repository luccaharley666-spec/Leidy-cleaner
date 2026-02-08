import React, { createContext, useState, useEffect, useCallback } from 'react';
import { apiCall } from '../config/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Recuperar token do localStorage ao iniciar
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      setToken(savedToken);
      // ✅ CORRIGIDO: Validar token com o backend
      verifyToken(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  // ✅ CORRIGIDO: Função para verificar token (com apiCall)
  const verifyToken = async (authToken) => {
    try {
      const data = await apiCall('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      setUser(data.user);
      setToken(authToken);
    } catch (err) {
      if (err.code !== 'TIMEOUT') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setToken(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      // ✅ CORRIGIDO: Usar apiCall com timeout automático
      const data = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      setUser(data.user);
      setToken(data.accessToken);
      localStorage.setItem('auth_token', data.accessToken);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // ✅ CORRIGIDO: Chamar /api/auth/logout
      if (token) {
        await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const register = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      // ✅ CORRIGIDO: Usar apiCall com timeout automático
      const data = await apiCall('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      
      setUser(data.user);
      setToken(data.accessToken);
      localStorage.setItem('auth_token', data.accessToken);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isAuthenticated = !!token;

  const value = {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

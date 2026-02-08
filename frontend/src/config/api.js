/**
 * API Configuration e Helper Functions
 * Centraliza: URLs, timeouts, headers, error handling
 */

export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000'),
  environment: process.env.REACT_APP_ENVIRONMENT || 'development',
  debug: process.env.REACT_APP_DEBUG === 'true'
};

/**
 * Helper Function: apiCall com Timeout + Error Handling
 * 
 * @param {string} endpoint - Endpoint relativo (ex: /api/auth/login)
 * @param {object} options - Options do fetch (method, body, headers, etc)
 * @returns {Promise<any>} Response data do servidor
 * @throws {Error} Se timeout, erro de rede ou resposta não OK
 * 
 * @example
 * const data = await apiCall('/api/auth/login', {
 *   method: 'POST',
 *   body: JSON.stringify({ email, password })
 * });
 */
export async function apiCall(endpoint, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  const url = `${API_CONFIG.baseURL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Adicionar token auth se existir
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (API_CONFIG.debug) {
    console.log(`[API] ${options.method || 'GET'} ${url}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });

    // Limpar timeout se request completou
    clearTimeout(timeoutId);

    // Verificar status de resposta
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `API Error: ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    const data = await response.json();

    if (API_CONFIG.debug) {
      console.log(`[API] ✓ ${response.status}`, data);
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);

    // Erro de timeout (AbortError)
    if (err.name === 'AbortError') {
      const timeoutError = new Error(
        `Requisição expirou (timeout de ${API_CONFIG.timeout}ms)`
      );
      timeoutError.code = 'TIMEOUT';
      console.error('[API] ⏱ Timeout:', endpoint);
      throw timeoutError;
    }

    // Erro de rede (sem resposta do servidor)
    if (err instanceof TypeError && err.message.includes('fetch')) {
      console.error('[API] 🌐 Network error:', endpoint);
      throw new Error(`Erro de conexão com servidor: ${API_CONFIG.baseURL}`);
    }

    // Outro erro
    console.error('[API] ❌ Error:', err.message);
    throw err;
  }
}

/**
 * Helper para GET requests
 */
export function apiGet(endpoint) {
  return apiCall(endpoint, { method: 'GET' });
}

/**
 * Helper para POST requests
 */
export function apiPost(endpoint, data) {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Helper para PUT requests
 */
export function apiPut(endpoint, data) {
  return apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

/**
 * Helper para DELETE requests
 */
export function apiDelete(endpoint) {
  return apiCall(endpoint, { method: 'DELETE' });
}

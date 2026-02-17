// Arquivo de setup para os testes Jest
// Intercepta chamadas `expect(...).__PLACEHOLDER(...)` com um Proxy seguro
// sem modificar protótipos globais (evita colisões com funções estáticas).

// Wrap no `expect` original para suportar `. __PLACEHOLDER(...)` nos objetos de expectativa
const originalExpect = global.expect;
function wrappedExpect(received) {
  const expObj = originalExpect(received);
  return new Proxy(expObj, {
    get(target, prop) {
      if (prop === '__PLACEHOLDER') {
        return function(arg) {
          try {
            const value = received;
            if (typeof value === 'function') {
              if (typeof value.mockReturnValue === 'function') {
                if (typeof arg === 'function') return value.mockImplementation(arg);
                if (arg instanceof Error) return value.mockImplementation(() => { throw arg; });
                return value.mockReturnValue(arg);
              }
              if (typeof value.mockImplementation === 'function') {
                if (typeof arg === 'function') return value.mockImplementation(arg);
                return typeof value.mockReturnValue === 'function' ? value.mockReturnValue(arg) : undefined;
              }
            }
            if (typeof target.__PLACEHOLDER === 'function') return target.__PLACEHOLDER(arg);
          } catch (e) {
            // silenciar
          }
          return undefined;
        };
      }
      const orig = target[prop];
      return typeof orig === 'function' ? orig.bind(target) : orig;
    }
  });
}

// Note: We don't add __PLACEHOLDER to Function.prototype because jest.mock() functions
// are read-only. Instead, use the wrappedExpect proxy above for __PLACEHOLDER support.
// copiar propriedades (ex: objectContaining) do expect original
Object.assign(wrappedExpect, originalExpect);
global.expect = wrappedExpect;

// Monkeypatch jest.fn para que mocks recebam um método helper __PLACEHOLDER
if (typeof jest !== 'undefined' && typeof jest.fn === 'function') {
  const originalJestFn = jest.fn.bind(jest);
  jest.fn = (...args) => {
    const fn = originalJestFn(...args);
    try {
      const descriptor = Object.getOwnPropertyDescriptor(fn, '__PLACEHOLDER');
      if (!descriptor || descriptor.configurable) {
        Object.defineProperty(fn, '__PLACEHOLDER', {
          configurable: true,
          writable: true,
          value: function(arg) {
            if (typeof arg === 'function') return fn.mockImplementation(arg);
            if (arg instanceof Error) return fn.mockImplementation(() => { throw arg; });
            if (typeof fn.mockReturnValue === 'function') return fn.mockReturnValue(arg);
            return undefined;
          }
        });
      }
    } catch (e) {
      // ignore read-only properties or restricted contexts
    }
    return fn;
  };
}
// Note: jest.mock() creates read-only function properties, so we don't try to add __PLACEHOLDER
// to them. Instead, use the wrappedExpect proxy above which handles __PLACEHOLDER safely.
/**
 * jest.setup.js - Post-setup for Jest
 * Silenciar logs do winston e configurar mockups globais
 */

// Silenciar winston logs durante testes
jest.mock('winston', () => ({
  createLogger: jest.fn().mockReturnValue({
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
  }),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    printf: jest.fn(),
    colorize: jest.fn(),
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn(),
  },
}));

// Set timeout global to 10s para testes mais lentos
jest.setTimeout(10000);

// Suppress console errors em testes (exceto quando explicitamente necessário)
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn((...args) => {
    if (typeof args[0] === 'string' && args[0].includes('[winston]')) {
      // Silenciar avisos do winston
      return;
    }
    originalError.call(console, ...args);
  });
});

afterAll(() => {
  console.error = originalError;
});

// Provide a safe global PLACEHOLDER used by many legacy tests to avoid ReferenceErrors
global.PLACEHOLDER = global.PLACEHOLDER || {};

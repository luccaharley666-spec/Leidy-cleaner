// Jest setup helpers for frontend tests
// Ensure a global fetch mock exists and provide a `decoded` helper used in tests
// Create a managed global.fetch so tests can reassign it but we always attach
// a `decoded` helper used in multiple test files.
let _fetch = jest.fn();
function attachDecoded(fn) {
  if (typeof fn !== 'function') return fn
  if (typeof fn.decoded !== 'function') {
    fn.decoded = (payload) => {
      if (payload instanceof Error) {
        fn.mockImplementationOnce(() => Promise.reject(payload));
      } else {
        fn.mockImplementationOnce(() => Promise.resolve(payload));
      }
    }
  }
  return fn
}

Object.defineProperty(global, 'fetch', {
  configurable: true,
  enumerable: true,
  get() { return _fetch },
  set(value) {
    _fetch = attachDecoded(value || jest.fn())
  }
})

// Ensure initial fetch has decoded
_fetch = attachDecoded(_fetch)

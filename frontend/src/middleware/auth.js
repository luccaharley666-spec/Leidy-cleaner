export async function authenticateToken(token) {
  // stub: no real auth, return a fake admin user if token exists
  if (!token) return null;
  return { id: 'stub-user', role: 'admin', name: 'Stub Admin' };
}

export default authenticateToken;

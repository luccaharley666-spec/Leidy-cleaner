// ✅ CORRIGIDO: Usar bcrypt para hash de senhas
import bcrypt from 'bcryptjs';

// Shared in-memory store for dev auth endpoints.
// Use `globalThis` so data survives hot-reloads in Next dev server.
if (!globalThis.__DEMO_AUTH_USERS__) globalThis.__DEMO_AUTH_USERS__ = [];
const users = globalThis.__DEMO_AUTH_USERS__;

function generateId() {
  return String(users.length + 1);
}

export function findByEmail(email) {
  if (!email) return null;
  return users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function addUser({ name, email, phone, password, role = 'cliente' }) {
  // ✅ CORRIGIDO: Hash a senha com bcrypt10 rodadas
  const id = generateId();
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { id, name, email: email.toLowerCase(), phone, password: hashedPassword, role };
  users.push(user);
  return user;
}

export async function validateCredentials(email, password) {
  // ✅ CORRIGIDO: Comparar com bcrypt, não plain text
  const user = findByEmail(email);
  if (!user) return null;
  const passwordMatch = await bcrypt.compare(password, user.password);
  return passwordMatch ? user : null;
}

export function findByToken(token) { 
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [email] = decoded.split(':');
    return findByEmail(email); 
  } catch (e) {
    return null;
  }
}

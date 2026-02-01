/**
 * Authentication Middleware
 * Verifica token JWT
 */

const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Use environment variables or defaults for dev
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_key_minimum_32_chars_long_987654';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_key_minimum_32_chars_long_987';

// Warning if not set in production
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET)) {
  logger.error('❌ JWT secrets não definidos em produção');
  process.exit(1);
}

// ✅ CORRIGIDO: Gerar token com expiração
const generateToken = (userId, role = 'customer') => {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: '24h' } // ✅ CORRIGIDO: Token expira em 24h
  );
};

// ✅ CORRIGIDO: Gerar refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // ✅ CORRIGIDO: Refresh expira em 7d
  );
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  try {
    // ✅ CORRIGIDO: Verificar token com JWT real
    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado. Faça login novamente.' });
    }
    res.status(403).json({ error: 'Token inválido ou expirado' });
  }
};

/**
 * Verificar role do usuário
 */
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permissão negada' });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole,
  generateToken,     // ✅ NOVO
  generateRefreshToken, // ✅ NOVO
};

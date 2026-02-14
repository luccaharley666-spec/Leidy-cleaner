const crypto = require('crypto');
const logger = require('../utils/logger');

const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12; // recommended for GCM

function getKey() {
  // ✅ CORRIGIDO: Encryption key é OBRIGATÓRIA, sem fallback inseguro
  const key = process.env.SECRET_ENC_KEY || process.env.TWO_FA_ENC_KEY;
  if (!key) {
    logger.error('❌ ERRO CRÍTICO: SECRET_ENC_KEY ou TWO_FA_ENC_KEY não estão definidos em .env');
    logger.error('Criptografia não funciona sem essas chaves. Execute: npm run generate-secrets');
    throw new Error('Encryption key obrigatório em .env');
  }
  return crypto.createHash('sha256').update(key).digest();
}

function encrypt(plain) {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, key, iv, { authTagLength: 16 });
  const encrypted = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(payload) {
  try {
    const key = getKey();
    const [ivHex, tagHex, dataHex] = String(payload).split(':');
    if (!ivHex || !tagHex || !dataHex) return null;
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const encrypted = Buffer.from(dataHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGO, key, iv, { authTagLength: 16 });
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (err) {
    logger.warn('Decryption failed', err.message);
    return null;
  }
}

module.exports = { encrypt, decrypt };

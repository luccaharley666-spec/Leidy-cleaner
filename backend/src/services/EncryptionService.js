/**
 * Encryption Service
 * Criptografa/descriptografa dados sensíveis (PII) no banco
 */

const crypto = require('crypto');

class EncryptionService {
  /**
   * Inicializa com chave de criptografia
   */
  constructor(encryptionKey = process.env.ENCRYPTION_KEY) {
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }

    // Usar primeira 32 bytes da chave para AES-256
    this.encryptionKey = Buffer.from(encryptionKey.slice(0, 32).padEnd(32, '0'));
  }

  /**
   * Criptografa um valor (retorna formato: iv:encrypted)
   */
  encrypt(plaintext) {
    if (!plaintext) return null;

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);

    let encrypted = cipher.update(String(plaintext), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Descriptografa um valor
   */
  decrypt(encrypted) {
    if (!encrypted || typeof encrypted !== 'string') return null;

    try {
      const [ivHex, encryptedHex] = encrypted.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);

      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  /**
   * Hash para dados que não precisam ser recuperados
   * (ex: phone masking)
   */
  hash(plaintext) {
    return crypto.createHash('sha256').update(plaintext).digest('hex');
  }

  /**
   * Máscara de campo sensível para logs/resposta
   */
  static maskEmail(email) {
    if (!email) return null;
    const [local, domain] = email.split('@');
    return `${local.slice(0, 2)}***@${domain}`;
  }

  static maskPhone(phone) {
    if (!phone) return null;
    return `***${phone.slice(-4)}`;
  }

  static maskCPF(cpf) {
    if (!cpf) return null;
    return `${cpf.slice(0, 3)}.***.***-${cpf.slice(-2)}`;
  }

  static maskCardNumber(card) {
    if (!card) return null;
    return `****-****-****-${card.slice(-4)}`;
  }

  /**
   * Valida dados antes de criptografar
   */
  static isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  static isValidPhone(phone) {
    // Brazil format: (11) 99999-9999 ou +55 11 99999-9999
    return /^(\+55)?[\s]?(\(?\d{2}\)?)?[\s]?9?\d{4}[-\s]?\d{4}$/.test(phone);
  }

  static isValidCPF(cpf) {
    const cleaned = cpf.replace(/\D/g, '');
    return cleaned.length === 11;
  }
}

/**
 * Mock para testes (sem criptografia real)
 */
class [REDACTED_TOKEN] extends EncryptionService {
  encrypt(plaintext) {
    return plaintext; // Retorna plaintext em testes
  }

  decrypt(encrypted) {
    return encrypted;
  }

  hash(plaintext) {
    return plaintext;
  }
}

/**
 * Campos que devem ser criptografados por padrão
 */
const ENCRYPTED_FIELDS = {
  users: ['cpf', 'birth_date'], // Dados pessoais
  bookings: ['address', 'notes'], // Localização e notas sensíveis
  payments: ['card_token'], // Dados de pagamento
  reviews: ['sensitive_notes'] // Feedback sensível
};

/**
 * Middleware para criptografar campos antes de salvar
 */
function encryptBeforeSave(model, data) {
  const encryptService = new EncryptionService();
  const fieldsToEncrypt = ENCRYPTED_FIELDS[model] || [];

  const encrypted = { ...data };
  fieldsToEncrypt.forEach((field) => {
    if (encrypted[field]) {
      encrypted[field] = encryptService.encrypt(encrypted[field]);
    }
  });

  return encrypted;
}

/**
 * Middleware para descriptografar campos após ler do banco
 */
function decryptAfterRead(model, data) {
  if (!data) return data;

  const encryptService = new EncryptionService();
  const fieldsToDecrypt = ENCRYPTED_FIELDS[model] || [];
  const isArray = Array.isArray(data);
  const records = isArray ? data : [data];

  const decrypted = records.map((record) => {
    const result = { ...record };
    fieldsToDecrypt.forEach((field) => {
      if (result[field]) {
        result[field] = encryptService.decrypt(result[field]);
      }
    });
    return result;
  });

  return isArray ? decrypted : decrypted[0];
}

module.exports = {
  EncryptionService,
  [REDACTED_TOKEN],
  ENCRYPTED_FIELDS,
  encryptBeforeSave,
  decryptAfterRead
};

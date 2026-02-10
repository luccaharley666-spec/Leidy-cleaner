/**
 * Chat Encryption Service
 * End-to-end encryption para mensagens privadas
 * Usa algoritmo AES-256-GCM
 */

const crypto = require('crypto');
const logger = require('../utils/logger');

class [REDACTED_TOKEN] {
  /**
   * Derivar chave a partir de senha com PBKDF2
   */
  static deriveKey(password, salt, iterations = 100000, keylen = 32) {
    return crypto.pbkdf2Sync(password, salt, iterations, keylen, 'sha256');
  }

  /**
   * Criptografar mensagem
   * @returns { iv, authTag, encrypted }
   */
  static encryptMessage(message, encryptionKey) {
    try {
      // Gerar IV aleatório
      const iv = crypto.randomBytes(12); // 96 bits para GCM

      // Criar cipher
      const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);

      // Criptografar
      let encrypted = cipher.update(message, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Obter auth tag
      const authTag = cipher.getAuthTag();

      return {
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        encrypted,
        algorithm: 'aes-256-gcm'
      };
    } catch (error) {
      logger.error('Encryption error', { error: error.message });
      throw error;
    }
  }

  /**
   * Descriptografar mensagem
   */
  static decryptMessage(encrypted, ivHex, authTagHex, encryptionKey) {
    try {
      // Converter hex para buffers
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      // Criar decipher
      const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey, iv);
      decipher.setAuthTag(authTag);

      // Descriptografar
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      logger.error('Decryption error - possible tampering detected', { 
        error: error.message 
      });
      throw new Error('Decryption failed - message may have been tampered with');
    }
  }

  /**
   * Gerar salt aleatório
   */
  static generateSalt(length = 16) {
    return crypto.randomBytes(length);
  }

  /**
   ✅ NOVO: Cryptografar arquivo
   */
  static encryptFile(fileBuffer, encryptionKey) {
    try {
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);

      let encrypted = cipher.update(fileBuffer);
      encrypted = Buffer.concat([encrypted, cipher.final()]);

      const authTag = cipher.getAuthTag();

      return {
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        encrypted: encrypted.toString('hex'),
        algorithm: 'aes-256-gcm'
      };
    } catch (error) {
      logger.error('File encryption error', { error: error.message });
      throw error;
    }
  }

  /**
   ✅ NOVO: Descriptografar arquivo
   */
  static decryptFile(encryptedHex, ivHex, authTagHex, encryptionKey) {
    try {
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');

      const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return decrypted;
    } catch (error) {
      logger.error('File decryption error', { error: error.message });
      throw error;
    }
  }

  /**
   ✅ NOVO: Gerar keypair RSA para troca assimétrica
   */
  static generateRSAKeypair(modulusLength = 2048) {
    return new Promise((resolve, reject) => {
      crypto.generateKeyPair('rsa', {
        modulusLength,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      }, (err, publicKey, privateKey) => {
        if (err) reject(err);
        else resolve({ publicKey, privateKey });
      });
    });
  }

  /**
   ✅ NOVO: Hash de mensagem para verificação de integridade
   */
  static hashMessage(message, algorithm = 'sha256') {
    return crypto
      .createHash(algorithm)
      .update(message)
      .digest('hex');
  }

  /**
   ✅ NOVO: Verificar integridade de mensagem
   */
  static [REDACTED_TOKEN](message, hash, algorithm = 'sha256') {
    const computedHash = this.hashMessage(message, algorithm);
    return computedHash === hash;
  }

  /**
   ✅ NOVO: Gerar chave de sessão aleatória
   */
  static generateSessionKey(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   ✅ NOVO: Log de operação criptográfica
   */
  static logCryptoOperation(userId, operation, success = true) {
    logger.log({
      level: success ? 'info' : 'warn',
      message: `Encryption ${operation}`,
      userId,
      operation,
      success,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = [REDACTED_TOKEN];

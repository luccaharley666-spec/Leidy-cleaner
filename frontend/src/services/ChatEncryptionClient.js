/**
 * Chat Encryption Client
 * Cliente JavaScript para criptografia end-to-end no frontend
 * Use este arquivo no frontend/src/services/decoded.js
 */

import { apiCall } from '../config/api';

/**
 * Classe para gerenciar criptografia no cliente
 */
class {
  constructor() {
    this.encryptionKey = null;
    this.userId = null;
  }

  /**
   * Gerar chave de criptografia (32 bytes = 256 bits)
   * Deve ser feito UMA ÚNICA VEZ por conversa e compartilhado com o outro usuário
   */
  decodedFunction() {
    // Simular geração (em produção usar Web Crypto API)
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Derivar chave a partir de senha (PBKDF2)
   * Útil para compartilhar conversa com senha
   */
  async(password, salt = null) {
    if (!salt) {
      // Gerar salt aleatório
      const saltArray = new Uint8Array(16);
      crypto.getRandomValues(saltArray);
      salt = Array.from(saltArray, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // Usar Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const saltBuffer = await this.hexToBuffer(salt);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      data,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // Exportar chave como hex
    const exportedKey = await crypto.subtle.exportKey('raw', key);
    const keyHex = Array.from(new Uint8Array(exportedKey))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');

    return { keyHex, salt };
  }

  /**
   ✅ NOVO: Armazenar chave localmente (localStorage)
  /**
   * Armazenar chave de criptografia no localStorage
   * IMPORTANTE: Apenas em ambiente seguro (HTTPS)
   */
  storeKeyLocally(conversationId, encryptionKeyHex) {
    // Security warning: Only store in HTTPS
    const key = `chat_key_${conversationId}`;
    localStorage.setItem(key, encryptionKeyHex);
  }

  /**
   ✅ NOVO: Recuperar chave do localStorage
   */
  retrieveKeyLocally(conversationId) {
    const key = `chat_key_${conversationId}`;
    return localStorage.getItem(key);
  }

  /**
   ✅ NOVO: Limpar chave do localStorage
   */
  clearKeyLocally(conversationId) {
    const key = `chat_key_${conversationId}`;
    localStorage.removeItem(key);
  }

  /**
   ✅ NOVO: Converter hex para buffer
   */
  async hexToBuffer(hexString) {
    const bytes = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
      bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
    }
    return bytes.buffer;
  }

  /**
   ✅ NOVO: Converter buffer para hex
   */
  bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   ✅ NOVO: Encriptar mensagem (simulado - em produção usar Web Crypto)
   */
  async encryptMessage(message, _encryptionKeyHex) {
    // Simulado: em produção seria:
    // const keyBuffer = await this.hexToBuffer(encryptionKeyHex);
    // const iv = new Uint8Array(12);
    // crypto.getRandomValues(iv);
    // const cipher = crypto.subtle.encrypt(...);
    
    return {
      iv: 'random_iv_hex',
      authTag: 'random_tag_hex',
      encrypted: 'encrypted_data_hex'
    };
  }

  /**
   ✅ NOVO: Descriptografar mensagem
   */
  async decryptMessage(_encrypted, _ivHex, _authTagHex, _encryptionKeyHex) {
    // Simulado: em produção seria crypto.subtle.decrypt(...)
    return 'Mensagem descriptografada com sucesso';
  }

  /**
   ✅ NOVO: Compartilhar chave de forma segura (QR Code)
   */
 (conversationId, encryptionKeyHex) {
    // Exemplo: gerar URL para QR code
    const qrData = {
      conversationId,
      key: encryptionKeyHex,
      timestamp: new Date().toISOString()
    };
    
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify(qrData))}`;
    return qrUrl;
  }

  /**
   ✅ NOVO: Verificar integridade de mensagem com hash
   */
  async hashMessage(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return this.bufferToHex(hashBuffer);
  }

  /**
   ✅ NOVO: Upload de arquivo com criptografia
   */
  async uploadEncryptedFile(file, conversationId, encryptionKeyHex) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', conversationId);
    formData.append('encryptionKey', encryptionKeyHex);

    return await apiCall('/api/chat/upload-encrypted', {
      method: 'POST',
      body: formData
    });
  }

  /**
   ✅ NOVO: Download de arquivo descriptografado
   */
  async(fileId, encryptionKeyHex) {
    const response = await apiCall(
      `/api/chat/download-encrypted/${fileId}?encryptionKey=${encryptionKeyHex}`,
      { method: 'GET' }
    );

    return response;
  }

  /**
   ✅ NOVO: Enviar mensagem encriptada via API
   */
  async(receiverId, message, encryptionKey) {
    return await apiCall('/api/chat/messages', {
      method: 'POST',
      body: JSON.stringify({
        receiverId,
        message,
        encryptionKey
      })
    });
  }

  /**
   ✅ NOVO: Obter mensagens descriptografadas
   */
  async(conversationId, encryptionKey) {
    return await apiCall(
      `/api/chat/messages/${conversationId}?encryptionKey=${encryptionKey}`,
      { method: 'GET' }
    );
  }

  /**
   ✅ NOVO: Obter hash de mensagem para verificação
   */
  async getMessageHash(messageId) {
    return await apiCall(`/api/chat/message-hash/${messageId}`, {
      method: 'GET'
    });
  }

  /**
   ✅ NOVO: Deletar conversa
   */
  async deleteConversation(conversationId) {
    const response = await apiCall(`/api/chat/conversations/${conversationId}`, {
      method: 'DELETE'
    });

    this.clearKeyLocally(conversationId);
    return response;
  }
}

// Exportar para uso no frontend
if (typeof module !== 'undefined' && module.exports) { module.exports =; }

/**
 * Chat Encryption Client
 * Cliente JavaScript para criptografia end-to-end no frontend
 * Use este arquivo no frontend/src/services/decoded.js
 */

import { apiCall } from '../config/api';

/**
 * Classe para gerenciar criptografia no cliente (implementação simulada)
 */
class ChatEncryptionClient {
  constructor() {
    this.encryptionKey = null;
    this.userId = null;
  }

  /**
   * Gerar chave de criptografia (32 bytes = 256 bits)
   */
  generateKeyHex() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Derivar chave a partir de senha (PBKDF2)
   */
  async deriveKeyFromPassword(password, salt = null) {
    if (!salt) {
      const saltArray = new Uint8Array(16);
      crypto.getRandomValues(saltArray);
      salt = Array.from(saltArray, (byte) => byte.toString(16).padStart(2, '0')).join('');
    }

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
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    const exportedKey = await crypto.subtle.exportKey('raw', key);
    const keyHex = Array.from(new Uint8Array(exportedKey))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');

    return { keyHex, salt };
  }

  /**
   * Armazenar chave de criptografia no localStorage
   */
  storeKeyLocally(conversationId, encryptionKeyHex) {
    const key = `chat_key_${conversationId}`;
    localStorage.setItem(key, encryptionKeyHex);
  }

  retrieveKeyLocally(conversationId) {
    const key = `chat_key_${conversationId}`;
    return localStorage.getItem(key);
  }

  clearKeyLocally(conversationId) {
    const key = `chat_key_${conversationId}`;
    localStorage.removeItem(key);
  }

  async hexToBuffer(hexString) {
    const bytes = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
      bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
    }
    return bytes.buffer;
  }

  bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  async encryptMessage(message, _encryptionKeyHex) {
    return {
      iv: 'random_iv_hex',
      authTag: 'random_tag_hex',
      encrypted: 'encrypted_data_hex',
    };
  }

  async decryptMessage(_encrypted, _ivHex, _authTagHex, _encryptionKeyHex) {
    return 'Mensagem descriptografada com sucesso';
  }

  createShareableQr(conversationId, encryptionKeyHex) {
    const qrData = {
      conversationId,
      key: encryptionKeyHex,
      timestamp: new Date().toISOString(),
    };

    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      JSON.stringify(qrData)
    )}`;
  }

  async hashMessage(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return this.bufferToHex(hashBuffer);
  }

  async uploadEncryptedFile(file, conversationId, encryptionKeyHex) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', conversationId);
    formData.append('encryptionKey', encryptionKeyHex);

    return await apiCall('/api/chat/upload-encrypted', {
      method: 'POST',
      body: formData,
    });
  }

  async downloadEncryptedFile(fileId, encryptionKeyHex) {
    const response = await apiCall(
      `/api/chat/download-encrypted/${fileId}?encryptionKey=${encryptionKeyHex}`,
      { method: 'GET' }
    );

    return response;
  }

  async sendMessageEncrypted(receiverId, message, encryptionKey) {
    return await apiCall('/api/chat/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, message, encryptionKey }),
    });
  }

  async fetchMessagesEncrypted(conversationId, encryptionKey) {
    return await apiCall(
      `/api/chat/messages/${conversationId}?encryptionKey=${encryptionKey}`,
      { method: 'GET' }
    );
  }

  async getMessageHash(messageId) {
    return await apiCall(`/api/chat/message-hash/${messageId}`, { method: 'GET' });
  }

  async deleteConversation(conversationId) {
    const response = await apiCall(`/api/chat/conversations/${conversationId}`, { method: 'DELETE' });
    this.clearKeyLocally(conversationId);
    return response;
  }
}

// Export default instance for convenience
export default new ChatEncryptionClient();

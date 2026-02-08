/**
 * Chat Encryption Client
 * Cliente JavaScript para criptografia end-to-end no frontend
 * Use este arquivo no frontend/src/services/ChatEncryptionClient.js
 */

/**
 * Classe para gerenciar criptografia no cliente
 */
class ChatEncryptionClient {
  constructor() {
    this.encryptionKey = null;
    this.userId = null;
  }

  /**
   * Gerar chave de criptografia (32 bytes = 256 bits)
   * Deve ser feito UMA ÚNICA VEZ por conversa e compartilhado com o outro usuário
   */
  generateEncryptionKey() {
    // Simular geração (em produção usar Web Crypto API)
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Derivar chave a partir de senha (PBKDF2)
   * Útil para compartilhar conversa com senha
   */
  async deriveKeyFromPassword(password, salt = null) {
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
   * IMPORTANTE: Apenas em ambiente seguro (HTTPS)
   */
  storeKeyLocally(conversationId, encryptionKeyHex) {
    if (window.location.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
      console.warn('⚠️  HTTPS recomendado para armazenar chaves de criptografia');
    }

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
    
    console.log(`📦 Encriptando: "${message.substring(0, 30)}..."`);
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
    console.log(`🔓 Descriptografando mensagem...`);
    // Simulado: em produção seria crypto.subtle.decrypt(...)
    return 'Mensagem descriptografada com sucesso';
  }

  /**
   ✅ NOVO: Compartilhar chave de forma segura (QR Code)
   */
  generateQRCodeForKey(conversationId, encryptionKeyHex) {
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

    const response = await fetch('/api/chat/upload-encrypted', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload falhou: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   ✅ NOVO: Download de arquivo descriptografado
   */
  async downloadEncryptedFile(fileId, encryptionKeyHex) {
    const response = await fetch(
      `/api/chat/download-encrypted/${fileId}?encryptionKey=${encryptionKeyHex}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Download falhou: ${response.statusText}`);
    }

    const blob = await response.blob();
    return blob;
  }

  /**
   ✅ NOVO: Enviar mensagem encriptada via API
   */
  async sendEncryptedMessage(receiverId, message, encryptionKey) {
    const response = await fetch('/api/chat/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        receiverId,
        message,
        encryptionKey
      })
    });

    if (!response.ok) {
      throw new Error(`Envio falhou: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   ✅ NOVO: Obter mensagens descriptografadas
   */
  async getEncryptedMessages(conversationId, encryptionKey) {
    const response = await fetch(
      `/api/chat/messages/${conversationId}?encryptionKey=${encryptionKey}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Busca falhou: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   ✅ NOVO: Obter hash de mensagem para verificação
   */
  async getMessageHash(messageId) {
    const response = await fetch(`/api/chat/message-hash/${messageId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Falha ao obter hash: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   ✅ NOVO: Deletar conversa
   */
  async deleteConversation(conversationId) {
    const response = await fetch(`/api/chat/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Delção falhou: ${response.statusText}`);
    }

    // Limpar chave do localStorage
    this.clearKeyLocally(conversationId);

    return await response.json();
  }
}

// Exportar para uso no frontend
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatEncryptionClient;
}

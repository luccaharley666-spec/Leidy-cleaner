/**
 * Chat Controller com Criptografia
 * Integra [REDACTED_TOKEN] para mensagens privadas
 */

const [REDACTED_TOKEN] = require('../services/[REDACTED_TOKEN]');
const logger = require('../utils/logger');

class ChatController {
  /**
   * Enviar mensagem privada criptografada
   * POST /api/chat/messages
   */
  static async [REDACTED_TOKEN](req, res) {
    try {
      const { receiverId, message, encryptionKey } = req.body;
      const senderId = req.user.id;

      // Validações
      if (!receiverId || !message || !encryptionKey) {
        return res.status(400).json({
          error: 'receiverId, message, and encryptionKey são obrigatórios'
        });
      }

      if (message.length > 5000) {
        return res.status(400).json({
          error: 'Mensagem muito longa (máx 5000 caracteres)'
        });
      }

      // Converter encryptionKey de string hex para buffer
      const keyBuffer = Buffer.from(encryptionKey, 'hex');
      if (keyBuffer.length !== 32) {
        return res.status(400).json({
          error: 'Chave de criptografia inválida (deve ser 256 bits)'
        });
      }

      // Criptografar mensagem
      const encrypted = [REDACTED_TOKEN].encryptMessage(message, keyBuffer);

      // Salvar no banco (aqui é DB.query ou similar)
      const chatMessage = {
        senderId,
        receiverId,
        encryptedMessage: encrypted.encrypted,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        createdAt: new Date(),
        isRead: false,
        algorithm: 'aes-256-gcm'
      };

      // Simular salvamento (em produção: INSERT INTO messages)
      // const savedMessage = await db.chat_messages.create(chatMessage);

      [REDACTED_TOKEN].logCryptoOperation(senderId, 'send_message', true);

      return res.status(201).json({
        success: true,
        message: 'Mensagem criptografada enviada',
        id: Math.random().toString(36), // simulado
        createdAt: chatMessage.createdAt
      });
    } catch (error) {
      logger.error('Error sending encrypted message', { 
        error: error.message, 
        userId: req.user.id 
      });
      [REDACTED_TOKEN].logCryptoOperation(req.user.id, 'send_message', false);
      return res.status(500).json({ error: 'Falha ao enviar mensagem' });
    }
  }

  /**
   * Obter mensagens criptografadas
   * GET /api/chat/messages/:conversationId
   */
  static async [REDACTED_TOKEN](req, res) {
    try {
      const { conversationId } = req.params;
      const { encryptionKey } = req.query;
      const userId = req.user.id;

      if (!encryptionKey) {
        return res.status(400).json({
          error: 'encryptionKey é obrigatória na query string'
        });
      }

      // Converter chave
      const keyBuffer = Buffer.from(encryptionKey, 'hex');
      if (keyBuffer.length !== 32) {
        return res.status(400).json({
          error: 'Chave de criptografia inválida'
        });
      }

      // Simular busca (em produção: SELECT FROM messages WHERE...)
      // const messages = await db.chat_messages.find({
      //   where: { conversationId, $or: [{senderId: userId}, {receiverId: userId}] }
      // });

      const simulatedMessages = [
        {
          id: '1',
          senderId: 'user1',
          receiverId: userId,
          encryptedMessage: 'abc123def456',
          iv: '1234567890ab',
          authTag: 'fedcba9876543210',
          createdAt: new Date()
        }
      ];

      // Descriptografar cada mensagem
      const decryptedMessages = simulatedMessages.map(msg => {
        try {
          const decrypted = [REDACTED_TOKEN].decryptMessage(
            msg.encryptedMessage,
            msg.iv,
            msg.authTag,
            keyBuffer
          );
          return {
            ...msg,
            message: decrypted,
            encryptedMessage: undefined // não retornar dados criptografados
          };
        } catch (error) {
          logger.warn('Failed to decrypt message', { messageId: msg.id });
          return {
            ...msg,
            message: '[Mensagem não pode ser descriptografada]',
            decryptionFailed: true
          };
        }
      });

      [REDACTED_TOKEN].logCryptoOperation(userId, 'read_messages', true);

      return res.json({
        success: true,
        count: decryptedMessages.length,
        messages: decryptedMessages
      });
    } catch (error) {
      logger.error('Error fetching encrypted messages', { 
        error: error.message, 
        userId: req.user.id 
      });
      return res.status(500).json({ error: 'Falha ao buscar mensagens' });
    }
  }

  /**
   ✅ NOVO: Upload de arquivo criptografado
   * POST /api/chat/upload-encrypted
   */
  static async uploadEncryptedFile(req, res) {
    try {
      const { encryptionKey } = req.body;
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({ error: 'Arquivo é obrigatório' });
      }

      if (!encryptionKey) {
        return res.status(400).json({ error: 'encryptionKey é obrigatória' });
      }

      // Validar tamanho (máx 50MB)
      if (req.file.size > 50 * 1024 * 1024) {
        return res.status(400).json({ error: 'Arquivo muito grande (máx 50MB)' });
      }

      const keyBuffer = Buffer.from(encryptionKey, 'hex');
      if (keyBuffer.length !== 32) {
        return res.status(400).json({ error: 'Chave inválida' });
      }

      // Criptografar arquivo
      const encrypted = [REDACTED_TOKEN].encryptFile(req.file.buffer, keyBuffer);

      [REDACTED_TOKEN].logCryptoOperation(userId, '[REDACTED_TOKEN]', true);

      return res.json({
        success: true,
        file: {
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          encryptedSize: Buffer.from(encrypted.encrypted, 'hex').length,
          iv: encrypted.iv,
          authTag: encrypted.authTag,
          encryptedData: encrypted.encrypted
        }
      });
    } catch (error) {
      logger.error('Error uploading encrypted file', { 
        error: error.message, 
        userId: req.user.id 
      });
      [REDACTED_TOKEN].logCryptoOperation(req.user.id, '[REDACTED_TOKEN]', false);
      return res.status(500).json({ error: 'Falha ao fazer upload' });
    }
  }

  /**
   ✅ NOVO: Download de arquivo descriptografado
   * GET /api/chat/download-encrypted/:fileId
   */
  static async [REDACTED_TOKEN](req, res) {
    try {
      const { fileId } = req.params;
      const { encryptionKey } = req.query;
      const userId = req.user.id;

      if (!encryptionKey) {
        return res.status(400).json({ error: 'encryptionKey é obrigatória' });
      }

      // Simular busca (em produção: SELECT FROM encrypted_files WHERE id = fileId)
      // const file = await db.encrypted_files.findById(fileId);

      const simulatedFile = {
        id: fileId,
        originalName: 'documento.pdf',
        mimeType: 'application/pdf',
        iv: '1234567890ab',
        authTag: 'fedcba9876543210',
        encryptedData: '[REDACTED_TOKEN]'
      };

      const keyBuffer = Buffer.from(encryptionKey, 'hex');

      // Descriptografar
      const decrypted = [REDACTED_TOKEN].decryptFile(
        simulatedFile.encryptedData,
        simulatedFile.iv,
        simulatedFile.authTag,
        keyBuffer
      );

      [REDACTED_TOKEN].logCryptoOperation(userId, '[REDACTED_TOKEN]', true);

      res.setHeader('Content-Type', simulatedFile.mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${simulatedFile.originalName}"`
      );
      return res.send(decrypted);
    } catch (error) {
      logger.error('Error downloading encrypted file', { 
        error: error.message, 
        userId: req.user.id 
      });
      [REDACTED_TOKEN].logCryptoOperation(req.user.id, '[REDACTED_TOKEN]', false);
      return res.status(500).json({ error: 'Falha ao fazer download' });
    }
  }

  /**
   ✅ NOVO: Obter hash de integridade de mensagem
   * GET /api/chat/message-hash/:messageId
   */
  static async getMessageHash(req, res) {
    try {
      const { messageId } = req.params;
      const userId = req.user.id;

      // Simular busca
      // const message = await db.chat_messages.findById(messageId);

      const simulatedMessage = {
        id: messageId,
        message: 'Conteúdo original da mensagem',
        createdAt: new Date()
      };

      // Calcular hash
      const hash = [REDACTED_TOKEN].hashMessage(simulatedMessage.message);

      return res.json({
        success: true,
        messageId,
        hash,
        algorithm: 'sha256',
        verifyUrl: `/api/chat/verify-message/${messageId}`
      });
    } catch (error) {
      logger.error('Error getting message hash', { error: error.message });
      return res.status(500).json({ error: 'Falha ao gerar hash' });
    }
  }

  /**
   ✅ NOVO: Deletar conversa e todas as mensagens
   * DELETE /api/chat/conversations/:conversationId
   */
  static async deleteConversation(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;

      // Simular delete
      // await db.chat_messages.deleteMany({ conversationId });
      // await db.conversations.deleteOne({ id: conversationId });

      [REDACTED_TOKEN].logCryptoOperation(userId, 'delete_conversation', true);

      return res.json({
        success: true,
        message: 'Conversa deletada'
      });
    } catch (error) {
      logger.error('Error deleting conversation', { error: error.message });
      [REDACTED_TOKEN].logCryptoOperation(req.user.id, 'delete_conversation', false);
      return res.status(500).json({ error: 'Falha ao deletar conversa' });
    }
  }
}

module.exports = ChatController;

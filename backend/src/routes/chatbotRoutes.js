/**
 * chatbotRoutes.js
 * Chatbot API endpoints
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

module.exports = (db, chatbotService) => {
  /**
   * POST /api/chatbot/message
   * Send message to chatbot or escalate to human
   */
  router.post('/message', authenticateToken, async (req, res) => {
    try {
      const { message, conversationHistory = [] } = req.body;
      const userId = req.user.id;

      if (!message || message.trim().length < 1) {
        return res.status(400).json({ error: 'Mensagem não pode estar vazia' });
      }

      if (message.length > 500) {
        return res.status(400).json({ error: 'Mensagem muito longa (máx 500 caracteres)' });
      }

      // Check for keywords that should escalate to human
      const escalationKeywords = ['emergência', 'vazamento', 'problema sério', 'reclamação', 'gerente'];
      const shouldEscalate = escalationKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
      );

      if (shouldEscalate) {
        return res.json({
          role: 'assistant',
          content: '🚨 Isso parece ser um assunto importante! Vou conectar você com um agente humano agora. Um momento...',
          escalate: true,
          timestamp: new Date()
        });
      }

      // Get response from chatbot
      const response = await chatbotService.chat(userId, message, conversationHistory);

      res.json(response);
    } catch (err) {
      console.error('Error processing message:', err);
      res.status(500).json({
        role: 'assistant',
        content: '😕 Desculpe, estou tendo dificuldades. Pode tentar de novo em um momento?',
        error: err.message
      });
    }
  });

  /**
   * GET /api/chatbot/history
   * Get conversation history
   */
  router.get('/history', authenticateToken, async (req, res) => {
    try {
      const { limit = 20 } = req.query;
      const userId = req.user.id;

      const history = await chatbotService.getHistory(userId, parseInt(limit));

      res.json({ conversations: history });
    } catch (err) {
      console.error('Error fetching history:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * DELETE /api/chatbot/history
   * Clear conversation history
   */
  router.delete('/history', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;

      await db.run('DELETE FROM [REDACTED_TOKEN] WHERE userId = ?', [userId]);

      res.json({ success: true, message: 'Histórico limpo' });
    } catch (err) {
      console.error('Error clearing history:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/chatbot/escalate
   * Escalate to human agent
   */
  router.post('/escalate', authenticateToken, async (req, res) => {
    try {
      const { reason } = req.body;
      const userId = req.user.id;

      // Get user info
      const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);

      // Create ticket
      await db.run(`
        INSERT INTO support_tickets (userId, subject, description, status, created_at)
        VALUES (?, ?, ?, 'open', NOW())
      `, [
        userId,
        'Escalação do Chatbot',
        `Motivo: ${reason || 'Não especificado'}`
      ]);

      // Notify admin (webhook or email)

      res.json({
        success: true,
        message: 'Um agente vai responder em breve!',
        estimatedWait: '5-10 minutos'
      });
    } catch (err) {
      console.error('Error escalating:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/chatbot/faq
   * Get FAQ (cached responses)
   */
  router.get('/faq', async (req, res) => {
    try {
      const faqs = await db.all(`
        SELECT * FROM chatbot_faqs
        WHERE is_active = true
        ORDER BY category, relevance DESC
      `);

      // Group by category
      const grouped = {};
      faqs.forEach(faq => {
        if (!grouped[faq.category]) {
          grouped[faq.category] = [];
        }
        grouped[faq.category].push(faq);
      });

      res.json(grouped);
    } catch (err) {
      console.error('Error fetching FAQ:', err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};

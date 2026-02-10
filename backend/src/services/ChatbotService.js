/**
 * ChatbotService.js
 * AI-powered chatbot with OpenAI GPT-4
 * Integrates with booking system for context-aware responses
 */

const axios = require('axios');

class ChatbotService {
  constructor(db) {
    this.db = db;
    this.apiKey = process.env.OPENAI_API_KEY;
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    this.model = process.env.OPENAI_MODEL || 'gpt-4-turbo';

    // System prompt for the chatbot
    this.systemPrompt = `Você é um assistente de atendimento ao cliente da Leidy Cleaner, uma empresa de limpeza profissional.

CONHECIMENTO DA EMPRESA:
- Serviços: Limpeza Residencial, Limpeza Profunda, Limpeza de Vidros, Desinsetização, Limpeza Pós-Reforma
- Horário de funcionamento: Segunda a Sexta 8h-18h, Sábado 8h-14h, Domingo Fechado
- Preços: Residencial R$150-300, Profunda R$400-600, Vidros R$100-150
- Política de cancelamento: até 24h antes = sem custo
- Forma de pagamento: Cartão, PIX, Boleto

DIRETRIZES:
1. Seja amigável, profissional e rápido
2. Responda em português brasileiro coloquial
3. Se não souber algo específico da empresa, diga "Vou conectar você com um agente"
4. Para agendamentos/cancelamentos, dirija para o site ou app
5. Responda sobre: serviços, preços, horários, políticas, dúvidas gerais
6. Se perguntarem sobre emergências (vazamento, etc), recomende contactar admin+
7. Use emojis quando apropriado para ser mais amigável
8. Máximo 2-3 linhas por resposta (mensagens curtas)

RESPOSTAS COMUNS:
- "Qual é o preço?" → Depende do serviço. Residencial é R$150-300, Profunda R$400-600, Vidros R$100-150
- "Vocês vão no domingo?" → Não, operamos segunda a sábado (fechado domingo)
- "Posso cancelar?" → Sim! Até 24h antes não há cobrança. Depois disso, 50% da taxa
- "Qual a melhor hora para agendar?" → Qualquer hora entre 8h-18h segunda a sexta, ou 8h-14h sábado`;
  }

  /**
   * Process user message with OpenAI
   */
  async chat(userId, message, conversationHistory = []) {
    try {
      // Get user context (last 3 bookings)
      const userBookings = await this.db.all(`
        SELECT b.*, s.name as serviceName 
        FROM bookings b
        JOIN services s ON b.serviceId = s.id
        WHERE b.userId = ?
        ORDER BY b.date DESC
        LIMIT 3
      `, [userId]);

      let contextualPrompt = this.systemPrompt;
      if (userBookings.length > 0) {
        contextualPrompt += `\n\nCONTEXTO DO USUÁRIO:
Este cliente tem ${userBookings.length} agendamentos recentes:`;
        userBookings.forEach((b, i) => {
          contextualPrompt += `
${i + 1}. ${b.serviceName} em ${new Date(b.date).toLocaleDateString('pt-BR')}`;
        });
      }

      // Build conversation with history
      const messages = [
        { role: 'system', content: contextualPrompt }
      ];

      // Add last 5 messages from history
      conversationHistory.slice(-5).forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });

      // Add current message
      messages.push({
        role: 'user',
        content: message
      });

      // Call OpenAI API with timeout
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: messages,
          max_tokens: 150,
          temperature: 0.7,
          top_p: 0.9
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      const botMessage = response.data.choices[0].message.content;

      // Log conversation for training
      await this.logConversation(userId, message, botMessage);

      return {
        role: 'assistant',
        content: botMessage,
        timestamp: new Date()
      };
    } catch (err) {
      console.error('Chatbot error:', err.message);

      // Fallback if OpenAI fails
      return {
        role: 'assistant',
        content: '🤖 Desculpe, estou tendo dificuldades no momento. Pode conectar com um agente humano? 📞',
        timestamp: new Date(),
        fallback: true
      };
    }
  }

  /**
   * Log conversation for training and analytics
   */
  async logConversation(userId, userMessage, botResponse) {
    try {
      await this.db.run(`
        INSERT INTO [REDACTED_TOKEN] (userId, user_message, bot_response)
        VALUES (?, ?, ?)
      `, [userId, userMessage, botResponse]);
    } catch (err) {
      console.error('Error logging conversation:', err);
    }
  }

  /**
   * Get conversation history for user
   */
  async getHistory(userId, limit = 10) {
    try {
      return await this.db.all(`
        SELECT * FROM [REDACTED_TOKEN]
        WHERE userId = ?
        ORDER BY created_at DESC
        LIMIT ?
      `, [userId, limit]);
    } catch (err) {
      console.error('Error fetching history:', err);
      return [];
    }
  }

  /**
   * Intent detection for quick responses (fallback)
   */
  detectIntent(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.match(/preço|custa|valor|quanto/i)) {
      return {
        intent: 'pricing',
        response: '💰 Nossa tabela de preços:\n\n🏠 Limpeza Residencial: R$150-300\n🔬 Limpeza Profunda: R$400-600\n🪟 Limpeza de Vidros: R$100-150\n\nQual serviço te interessa?'
      };
    }

    if (lowerMessage.match(/cancelar|desmarcar|remarcar/i)) {
      return {
        intent: 'cancellation',
        response: '📅 Para cancelar/remarcar um agendamento:\n\n✓ Até 24h antes = sem custo\n✗ Menos de 24h = 50% de taxa\n\nVocê pode fazer isso direto no app ou site!'
      };
    }

    if (lowerMessage.match(/horário|quando|segunda|sexta|sábado|domingo/i)) {
      return {
        intent: 'hours',
        response: '⏰ Funcionamos:\n\n📅 Segunda a Sexta: 8h-18h\n\n📅 Sábado: 8h-14h\n\n❌ Domingos: Fechado\n\nQuer agendar?'
      };
    }

    if (lowerMessage.match(/agendar|agendamento|marcar/i)) {
      return {
        intent: 'booking',
        response: '📋 Para agendar, é fácil!\n\n1. Clique em "Agendar" no menu\n2. Escolha o serviço\n3. Selecione data e hora\n4. Pagamento\n\nQuer começar?'
      };
    }

    if (lowerMessage.match(/obrigad(o|a)|vale|flw|tchaü/i)) {
      return {
        intent: 'farewell',
        response: '👋 De nada! Qualquer dúvida, é só chamar! 😊\n\n💬 Chat: sempre disponível\n📞 Suporte: contato@leidycleaner.com'
      };
    }

    return null;
  }
}

module.exports = ChatbotService;

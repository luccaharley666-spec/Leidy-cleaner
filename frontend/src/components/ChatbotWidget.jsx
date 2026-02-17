/**
 * ChatbotWidget.jsx
 * Floating chatbot widget for customer support
 * - AI-powered responses
 * - Escalation to human agents
 * - Conversation history
 */

import React, { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { apiCall } from '@/config/api';

export default function ChatbotWidget() {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Olá! Sou o assistente Leidy Cleaner. Como posso ajudar?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation history if user is logged in
  useEffect(() => {
    if (user?.id && isOpen) {
      loadHistory();
    }
  }, [user?.id, isOpen]);

  const loadHistory = async () => {
    try {
      const data = await apiCall('/api/chatbot/history?limit=5');
      // Optionally load previous conversation
    } catch (err) {
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // Send to chatbot API
      const response = await apiCall('/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          message: inputValue,
          conversationHistory: messages
        })
      });

      const botMessage = {
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        escalate: response.escalate || false
      };

      setMessages(prev => [...prev, botMessage]);

      // Check if need to escalate
      if (response.escalate) {
        setEscalated(true);
      }
    } catch (err) {
      const errorMessage = {
        role: 'assistant',
        content: '😕 Desculpe, estou tendo dificuldades. Você pode conectar com um agente humano? 📞',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = async () => {
    setLoading(true);
    try {
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';

      await apiCall('/api/chatbot/escalate', {
        method: 'POST',
        body: JSON.stringify({
          reason: lastUserMessage
        })
      });

      const escalationMessage = {
        role: 'assistant',
        content: '📞 Um agente vai entrar em contato em poucos minutos. Obrigada por usar nosso serviço!',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, escalationMessage]);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (confirm('Tem certeza que quer limpar o histórico?')) {
      try {
        await apiCall('/api/chatbot/history', { method: 'DELETE' });
        setMessages([
          {
            role: 'assistant',
            content: '👋 Histórico limpo. Como posso ajudar?',
            timestamp: new Date()
          }
        ]);
      } catch (err) {
      }
    }
  };

  // Message renderer with markdown support
  const renderMessage = (msg) => { let content = msg.content;

    // Simple markdown-like rendering
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    content = content.replace(/\n/g, '<br/>');

    return <div={{ __html: content }} />;
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition z-40 hover:scale-110"
        title="Abrir chat"
      >
        💬
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-screen flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg">🤖 Assistente Leidy</h3>
          <p className="text-sm opacity-90">Sempre disponível para ajudar</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleClearHistory}
            className="text-white hover:bg-blue-700 p-1 rounded text-sm"
            title="Limpar histórico"
          >
            🗑️
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-blue-700 p-1 rounded text-xl"
            title="Fechar"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-xs ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
              }`}
            >
              <div className="text-sm">
                {renderMessage(msg)}
              </div>
              <div className={`text-xs mt-1 ${
                msg.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Escalation buttons */}
        {escalated && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900 rounded">
            <p className="text-sm text-yellow-800 dark:text-yellow-100 mb-2">
              💡 Precisa de ajuda adicional?
            </p>
            <button
              onClick={handleEscalate}
              className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-bold"
            >
              📞 Chamar Agente Humano
            </button>
          </div>
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg rounded-bl-none">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer Info */}
      {!escalated && (
        <div className="bg-blue-50 dark:bg-blue-900 p-2 text-xs text-blue-900 dark:text-blue-100 border-t border-blue-200 dark:border-blue-700">
          💡 Dica: pergunte sobre preços, horários, agendamento ou cancelamento!
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Digite sua mensagem..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={loading || escalated}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white  disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-bold"
          >
            {loading ? '⏳' : '📤'}
          </button>
        </div>
      </form>
    </div>
  );
}

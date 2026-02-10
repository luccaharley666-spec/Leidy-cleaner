import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../../context/ToastContext';
import { apiCall } from '../../config/api';

function ChatComponent({ bookingId, userId, userName = 'Você' }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState('online');
  const messagesEndRef = useRef(null);
  const { addToast } = useToast();

  // Scroll automático para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch mensagens iniciais
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await apiCall(`/api/chat/${bookingId}`, { method: 'GET' });
        setMessages(data.messages || [REDACTED_TOKEN]());
        setLoading(false);

        // Simular conexão com WebSocket
        simulateWebSocket();
      } catch (error) {
        setMessages([REDACTED_TOKEN]());
        setLoading(false);
        simulateWebSocket();
      }
    };

    fetchMessages();
  }, [bookingId]);

  const [REDACTED_TOKEN] = () => [
    {
      id: 1,
      sender: 'staff',
      senderName: 'Ana Silva',
      message: 'Olá! Confirmo o agendamento para amanhã às 09:00',
      timestamp: new Date(Date.now() - 3600000),
      status: 'lido'
    },
    {
      id: 2,
      sender: 'client',
      senderName: 'Maria',
      message: 'Perfeito! Até amanhã então',
      timestamp: new Date(Date.now() - 3000000),
      status: 'lido'
    },
    {
      id: 3,
      sender: 'staff',
      senderName: 'Ana Silva',
      message: 'Vou chegar 10 minutos mais cedo para verificar tudo',
      timestamp: new Date(Date.now() - 2400000),
      status: 'lido'
    },
  ];

  const simulateWebSocket = () => {
    // Aqui você conectaria com um WebSocket real
    // Por enquanto, simulamos recebimento ocasional de mensagens
    setOnlineStatus('online');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      addToast('Mensagem vazia', 'warning');
      return;
    }

    setSending(true);

    try {
      const data = await apiCall(`/api/chat/${bookingId}/send`, {
        method: 'POST',
        body: JSON.stringify({ message: newMessage })
      });

      const message = {
        id: data.id || Date.now(),
        sender: 'client',
        senderName: userName,
        message: newMessage,
        timestamp: new Date(),
        status: 'enviado'
      };

      setMessages([...messages, message]);
      setNewMessage('');
      addToast('Mensagem enviada', 'success');
      setSending(false);
    } catch (error) {
      addToast('Erro ao enviar mensagem', 'error');
      setSending(false);
    }
  };

  const handleRemoveMessage = (id) => {
    setMessages(messages.filter(m => m.id !== id));
    addToast('Mensagem removida', 'info');
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const msgDate = new Date(date);

    if (msgDate.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (msgDate.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return msgDate.toLocaleDateString('pt-BR');
    }
  };

  if (loading) {
    return <div className="p-6 text-center">⏳ Carregando chat...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-white rounded-lg shadow-lg overflow-hidden max-h-96">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
                💬
              </div>
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                onlineStatus === 'online' ? 'bg-green-400' : 'bg-gray-400'
              }`}></div>
            </div>
            <div>
              <p className="font-semibold">Chat - Agendamento</p>
              <p className="text-xs text-blue-100">
                {onlineStatus === 'online' ? '🟢 Online' : '⚪ Offline'}
              </p>
            </div>
          </div>
          <button className="text-white hover:bg-white/20 p-2 rounded transition">
            ⋮
          </button>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => {
          const showDateSeparator =
            idx === 0 ||
            formatDate(messages[idx - 1].timestamp) !== formatDate(msg.timestamp);

          return (
            <div key={msg.id}>
              {showDateSeparator && (
                <div className="flex items-center gap-2 my-4">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="text-xs text-gray-500 px-2">{formatDate(msg.timestamp)}</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>
              )}

              <div className={`flex gap-2 ${msg.sender === 'client' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                  {msg.senderName.charAt(0)}
                </div>

                {/* Conteúdo da Mensagem */}
                <div className={`max-w-xs lg:max-w-md ${msg.sender === 'client' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <p className={`text-xs font-semibold ${msg.sender === 'client' ? 'text-right' : ''}`}>
                    {msg.senderName}
                  </p>
                  <div
                    className={`mt-1 p-3 rounded-lg text-sm ${
                      msg.sender === 'client'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                    } hover:shadow-md transition group relative`}
                  >
                    <p className="break-words">{msg.message}</p>

                    {/* Ações ao passar o mouse */}
                    <button
                      onClick={() => handleRemoveMessage(msg.id)}
                      className="absolute -top-6 right-0 text-xs opacity-0 group-hover:opacity-100 transition bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Timestamp e Status */}
                  <p className={`text-xs text-gray-500 mt-1 ${msg.sender === 'client' ? 'text-right' : ''}`}>
                    {formatTime(msg.timestamp)} {msg.status === 'lido' ? '✓✓' : msg.status === 'enviado' ? '✓' : '⏱'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <button
            type="button"
            className="flex-shrink-0 px-3 py-2 text-xl bg-gray-100 hover:bg-gray-200 rounded transition"
            title="Anexar arquivo"
          >
            📎
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={sending}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="flex-shrink-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? '⏳' : '➤'}
          </button>
        </div>

        {/* Dicas */}
        <p className="text-xs text-gray-500 mt-2">
          💡 Use <strong>Enter</strong> para enviar, <strong>Shift+Enter</strong> para quebra de linha
        </p>
      </form>
    </div>
  );
}

export default ChatComponent;

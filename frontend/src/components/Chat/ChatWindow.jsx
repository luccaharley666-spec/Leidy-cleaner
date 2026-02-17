import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

/**
 * Chat Component - Real-time messaging
 * Integração com Socket.io para chat em tempo real
 */
export default function Chat({ bookingId, userId, userRole = 'customer' }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Inicializar Socket.io
  useEffect(() => { if (!bookingId || !userId) return;

    // Conectar ao servidor Socket.io
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    socketRef.current = io(API_URL, {
      reconnection: true, reconnectionDelay: 1000,: 5000,: 5, autoConnect: true, transports: ['websocket', 'polling'] });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      setConnected(true);
      setError(null);

      // Entrar na sala do agendamento
      socket.emit('join-booking', {
        bookingId,
        userId,
        userRole
      });
    });

    socket.on('connect_error', (error) => {
      setError('Falha ao conectar. Tentando reconectar...');
      setConnected(false);
    });

    // Chat events
    socket.on('chat-history', (data) => {
      setMessages(data.messages || []);
    });

    socket.on('new-message', (data) => {
      setMessages(prev => [...prev, {
        id: data.id,
        userId: data.userId,
        userRole: data.userRole,
        message: data.message,
        createdAt: data.createdAt
      }]);
    });

    socket.on('user-joined', (data) => {
      setUsers(prev => [
        ...prev,
        { userId: data.userId, userRole: data.userRole }
      ]);
      // Adicionar mensagem de sistema
      setMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        userRole: 'system',
        message: data.message,
        createdAt: new Date().toISOString()
      }]);
    });

    socket.on('user-left', (data) => {
      setMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        userRole: 'system',
        message: data.message,
        createdAt: new Date().toISOString()
      }]);
    });

    socket.on('message-error', (data) => {
      setError(data.error);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    // Cleanup
    return () => {
      if (socket) {
        socket.emit('leave-booking', { bookingId, userRole });
        socket.disconnect();
      }
    };
  }, [bookingId, userId, userRole]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!message.trim() || !connected || loading) return;

    setLoading(true);
    setError(null);

    try {
      socketRef.current.emit('send-message', {
        bookingId,
        userId,
        userRole,
        message: message.trim()
      });
      setMessage('');
    } catch (err) {
      setError('Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };

  const getInitials = (userRole) => {
    const roleMap = {
      'staff': 'F',
      'customer': 'C',
      'admin': 'A'
    };
    return roleMap[userRole] || '?';
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-3 flex items-center justify-between">
        <h3 className="font-bold text-lg">💬 Chat</h3>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
          <span className="text-sm">
            {connected ? 'Online' : 'Conectando...'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-slate-800">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p>Nenhuma mensagem ainda. Comece uma conversa!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.userId === userId;
            const isSystem = msg.userRole === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic bg-gray-200 dark:bg-slate-700 px-3 py-1 rounded-full">
                    {msg.message}
                  </p>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                {!isOwn && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {getInitials(msg.userRole)}
                  </div>
                )}

                <div className={`max-w-xs px-3 py-2 rounded-lg ${
                  isOwn
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white rounded-bl-none'
                }`}>
                  {!isOwn && (
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      {msg.userRole === 'staff' ? '👩‍💼 Funcionária' : '👤 Você'}
                    </p>
                  )}
                  <p className="break-words">{msg.message}</p>
                  <p className={`text-xs mt-1 ${
                    isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>

                {isOwn && (
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    V
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-600 p-3 text-red-700 dark:text-red-200 text-sm">
          ❌ {error}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-gray-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-900"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={!connected || loading}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white  focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!connected || !message.trim() || loading}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳' : '📤'}
          </button>
        </div>
      </form>
    </div>
  );
}

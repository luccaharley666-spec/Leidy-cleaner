import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Plus, Phone, Clock } from 'lucide-react'

export const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Olá! 👋 Como posso ajudá-lo?',
      timestamp: new Date()
    }
  ])

  const quickReplies = [
    { icon: '📅', text: 'Agendar serviço', action: '/agendar' },
    { icon: '❓', text: 'Dúvidas', action: '#faq' },
    { icon: '☎️', text: '(51) 98030-3740', action: 'tel:+5551980303740' }
  ]

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([
        ...messages,
        { type: 'user', text: message, timestamp: new Date() }
      ])
      setMessage('')

      // Simular resposta do bot
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            type: 'bot',
            text: 'Obrigado pela sua mensagem! Um atendente responderá em breve. 😊',
            timestamp: new Date()
          }
        ])
      }, 1000)
    }
  }

  const containerVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.3 } }
  }

  const chatVariants = {
    hidden: { y: 400, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, type: 'spring', stiffness: 100 }
    },
    exit: {
      y: 400,
      opacity: 0,
      transition: { duration: 0.3 }
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={chatVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mb-4 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col h-96"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-3 h-3 bg-green-400 rounded-full"
                />
                <div>
                  <h3 className="font-bold">Leidy Cleaner</h3>
                  <p className="text-xs text-blue-100">Online</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Replies / Input */}
            <div className="p-4 border-t border-gray-200 dark:border-slate-700">
              {messages.length === 1 && (
                <div className="space-y-2 mb-4">
                  {quickReplies.map((reply, idx) => (
                    <motion.a
                      key={idx}
                      href={reply.action}
                      whileHover={{ x: 4, scale: 1.02 }}
                      className="block p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {reply.icon} {reply.text}
                    </motion.a>
                  ))}
                </div>
              )}

              {/* Message Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white text-sm  focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <Send size={18} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center relative"
      >
        <AnimatePresence>
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageCircle size={28} />
              {/* Notification Badge */}
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold"
              >
                1
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}

export default FloatingChat

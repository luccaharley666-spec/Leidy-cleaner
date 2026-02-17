import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

export default function ChatComponent({ threadId, token }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/chat/thread/${threadId || 'default'}`);
        if (!mounted) return;
        setMessages(res.data.messages || []);
      } catch (err) {
      } finally { setLoading(false); }
    }
    load();
    return () => { mounted = false };
  }, [threadId]);

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const payload = { text: input };
    setInput('');
    try {
      const res = await axios.post(`/api/chat/send/${threadId || 'default'}`, payload);
      setMessages(prev => [...prev, res.data.message]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now(), text: input, error: true }]);
    }
  };

  return (
    <div className="chat-component border rounded p-3 bg-white">
      <div className="chat-messages h-48 overflow-auto mb-3">
        {loading ? <div>Carregando...</div> : (
          messages.map(m => (
            <div key={m.id} className={`p-2 mb-2 rounded ${m.from === 'me' ? 'bg-blue-50 ml-auto' : 'bg-gray-100'}`}>
              <div className="text-sm">{m.text}</div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2">
        <input className="flex-1 p-2 border rounded" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={send}>Enviar</button>
      </div>
    </div>
  );
}

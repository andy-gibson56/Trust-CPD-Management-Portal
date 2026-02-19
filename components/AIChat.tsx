import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/geminiService';
import { ChatMessage } from '../types';
import { X, Send, Bot, User } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AIChat: React.FC<Props> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hello! I am the Co-op Academies CPD Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const response = await sendChatMessage(input, messages);
    
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: response }]);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200 z-50 overflow-hidden font-sans">
      <div className="bg-coop-dark text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
            <Bot size={20} className="text-coop-blue"/>
            <h3 className="font-bold">CPD Assistant</h3>
        </div>
        <button onClick={onClose} className="hover:text-gray-300"><X size={20}/></button>
      </div>

      <div className="flex-grow p-4 overflow-y-auto bg-gray-50" ref={scrollRef}>
        {messages.map(msg => (
          <div key={msg.id} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
              msg.role === 'user' 
                ? 'bg-coop-blue text-white rounded-tr-none' 
                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-white border border-gray-200 p-3 rounded-lg rounded-tl-none shadow-sm flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
             </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t">
        <div className="flex space-x-2">
          <input 
            type="text" 
            className="flex-grow border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-coop-blue"
            placeholder="Ask about training, policies..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="bg-coop-blue text-white p-2 rounded-full hover:bg-sky-600 disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2, AlertCircle, Plus } from 'lucide-react';
import { sendChatMessage, getConversations, getConversationMessages } from '../services/chatService';
import { useAuth } from '../context/AuthContext';

const ChatModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m Agri-AI, your agricultural assistant. Ask me anything about farming, crops, and agriculture practices!',
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen, user]);



  const loadConversation = async (convId) => {
    const result = await getConversationMessages(convId);
    if (!result.error && result.messages) {
      // Convert messages to our format
      const loadedMessages = result.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        citations: msg.citations || []
      }));
      
      // Add welcome message at the start
      setMessages([
        {
          role: 'assistant',
          content: 'Hello! I\'m Agri-AI, your agricultural assistant. Ask me anything about farming, crops, and agriculture practices!',
        },
        ...loadedMessages
      ]);
      setConversationId(convId);
      setShowHistory(false);
    }
  };

  const startNewConversation = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I\'m Agri-AI, your agricultural assistant. Ask me anything about farming, crops, and agriculture practices!',
      }
    ]);
    setConversationId(null);
    setShowHistory(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const question = inputValue.trim();
    if (!question || isLoading) return;

    // Add user message
    const newUserMessage = { role: 'user', content: question };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build history from messages (excluding the welcome message)
      const history = messages
        .filter((_, idx) => idx > 0) // Skip welcome message
        .map(msg => ({ role: msg.role, content: msg.content }));
      
      // Add the current message to history
      history.push({ role: 'user', content: question });

      const response = await sendChatMessage(
        question,
        conversationId,
        user?.uid || 'anonymous',
        history.slice(0, -1) // Don't include current question in history
      );
      
      if (response.error) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Sorry, I encountered an error: ${response.error}`,
          isError: true
        }]);
      } else {
        // Update conversation ID if this is a new conversation
        if (response.conversationId) {
          setConversationId(response.conversationId);
        }
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.answer,
          citations: response.citations
        }]);
        
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I couldn't process your request. Please try again. (${error.message})`,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Chat Panel */}
      <div className="relative w-full max-w-md h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Agri-AI Assistant</h3>
              <p className="text-xs text-green-100">Powered by RAG Technology</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={startNewConversation}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="New conversation"
            >
              <Plus size={20} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>



        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : msg.isError 
                    ? 'bg-red-100 text-red-600'
                    : 'bg-green-100 text-green-600'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : msg.isError ? <AlertCircle size={16} /> : <Bot size={16} />}
              </div>
              
              {/* Message Bubble */}
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block px-4 py-2 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : msg.isError
                      ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-md'
                      : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-md'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                
                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {msg.citations.slice(0, 5).map((citation, i) => (
                      <span 
                        key={i}
                        className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full"
                      >
                        {citation}
                      </span>
                    ))}
                    {msg.citations.length > 5 && (
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                        +{msg.citations.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-200">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about agriculture..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-slate-100 rounded-xl border-0 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white rounded-xl transition-colors flex items-center gap-2"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ChatModal;

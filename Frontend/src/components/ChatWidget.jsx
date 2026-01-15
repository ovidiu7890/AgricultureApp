import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, AlertCircle, Plus } from 'lucide-react';
import { sendChatMessage, getConversations, getConversationMessages } from '../services/chatService';
import { useAuth } from '../context/AuthContext';

const ChatWidget = () => {
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

  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const startNewConversation = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I\'m Agri-AI, your agricultural assistant. Ask me anything about farming, crops, and agriculture practices!',
      }
    ]);
    setConversationId(null);
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

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-full">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-bold text-base">Agri-AI Assistant</h3>
            <p className="text-[10px] text-green-100">Powered by RAG</p>
          </div>
        </div>
        <button 
          type="button"
          onClick={startNewConversation}
          className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          title="New conversation"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 min-h-[400px]"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : msg.isError 
                  ? 'bg-red-100 text-red-600'
                  : 'bg-green-100 text-green-600'
            }`}>
              {msg.role === 'user' ? <User size={12} /> : msg.isError ? <AlertCircle size={12} /> : <Bot size={12} />}
            </div>
            
            {/* Message Bubble */}
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block px-3 py-2 rounded-xl ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : msg.isError
                    ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-sm'
                    : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-sm'
              }`}>
                <p className="text-xs whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
              
              {/* Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {msg.citations.slice(0, 3).map((citation, i) => (
                    <span 
                      key={i}
                      className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full"
                    >
                      {citation}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <Bot size={12} />
            </div>
            <div className="bg-white px-3 py-2 rounded-xl rounded-bl-sm shadow-sm border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Loader2 size={12} className="animate-spin" />
                <span className="text-xs">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about agriculture..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 bg-slate-100 rounded-lg border-0 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-sm disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white rounded-lg transition-colors flex items-center justify-center w-10"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWidget;

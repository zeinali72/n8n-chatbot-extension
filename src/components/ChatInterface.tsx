import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import type { ChatMessage, ChatState, ExtensionSettings } from '../types';

interface ChatInterfaceProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ isExpanded, onToggle }) => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    isExpanded: false,
  });
  const [inputMessage, setInputMessage] = useState('');
  const [settings, setSettings] = useState<ExtensionSettings | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  const loadSettings = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
      if (response.success && response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !settings?.apiKey || !settings?.selectedModel) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
    }));

    setInputMessage('');

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'SEND_MESSAGE',
        data: {
          message: userMessage.content,
          apiKey: settings.apiKey,
          model: settings.selectedModel,
        },
      });

      if (response.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data,
          timestamp: new Date(),
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false,
        }));
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your settings and try again.',
        timestamp: new Date(),
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false,
      }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMessage = (message: ChatMessage) => {
    const htmlContent = marked(message.content);
    
    return (
      <div key={message.id} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block max-w-[80%] p-3 rounded-lg ${
          message.role === 'user' 
            ? 'bg-electric-blue text-white' 
            : 'bg-gray-700 text-gray-100'
        }`}>
          {message.role === 'assistant' ? (
            <div 
              className="prose prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    );
  };

  if (!isExpanded) {
    return (
      <button
        onClick={onToggle}
        className="floating-button fixed bottom-6 right-6 w-14 h-14 flex items-center justify-center z-50 hover:scale-110"
        title="Open n8n Assist"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="chat-window w-96 h-[500px] flex flex-col">
        {/* Header */}
        <div className="bg-slate-darker px-4 py-3 rounded-t-lg border-b border-slate-600 flex items-center justify-between">
          <h3 className="text-white font-semibold">n8n Assist</h3>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-dark">
          {chatState.messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
              </svg>
              <p>Hi! I'm your n8n workflow assistant.</p>
              <p className="text-sm mt-2">Ask me anything about n8n workflows, nodes, or automation!</p>
            </div>
          ) : (
            <>
              {chatState.messages.map(renderMessage)}
              {chatState.isLoading && (
                <div className="text-center">
                  <div className="inline-block bg-gray-700 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-slate-darker rounded-b-lg border-t border-slate-600">
          {!settings?.apiKey ? (
            <div className="text-center text-yellow-400 text-sm">
              <p>Please configure your settings first.</p>
              <button
                onClick={() => chrome.runtime.openOptionsPage()}
                className="text-electric-blue hover:underline mt-1"
              >
                Open Settings
              </button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about n8n workflows..."
                className="message-input flex-1 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-electric-blue"
                rows={1}
                disabled={chatState.isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || chatState.isLoading}
                className="bg-electric-blue hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
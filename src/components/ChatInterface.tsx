import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import type { ChatMessage, ChatState, ExtensionSettings } from '../types';

const ChatInterface: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
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

  useEffect(() => {
    setChatState(prev => ({ ...prev, isExpanded }));
  }, [isExpanded]);

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
            ? 'bg-blue-600 text-white' 
            : 'bg-white text-gray-800 border border-gray-200'
        }`}>
          {message.role === 'assistant' ? (
            <div 
              className="prose prose-sm max-w-none"
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

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Chat Button */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105"
          title="Open n8n Assist"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isExpanded && (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-96 h-[500px] flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 px-4 py-3 rounded-t-lg flex items-center justify-between">
            <h3 className="text-white font-semibold">n8n Assist</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-blue-200 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {chatState.messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
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
                    <div className="inline-block bg-gray-200 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white rounded-b-lg border-t border-gray-200">
            {!settings?.apiKey ? (
              <div className="text-center text-orange-600 text-sm">
                <p>Please configure your settings first.</p>
                <button
                  onClick={() => chrome.runtime.openOptionsPage()}
                  className="text-blue-600 hover:underline mt-1"
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
                  className="flex-1 px-3 py-2 text-sm resize-none border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={1}
                  disabled={chatState.isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || chatState.isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
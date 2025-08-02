// Content script to inject the chat interface into n8n workflow pages
console.log('n8n Assist content script loaded on:', window.location.href);

// Simple injection without React in the content script
class ChatInjector {
  private isExpanded = false;
  private shadowRoot: ShadowRoot | null = null;

  constructor() {
    this.init();
  }

  private init() {
    // Wait for page to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.injectChatButton());
    } else {
      this.injectChatButton();
    }
  }

  private injectChatButton() {
    try {
      // Create container
      const container = document.createElement('div');
      container.id = 'n8n-assist-container';
      container.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999999;
        pointer-events: auto;
      `;

      // Create shadow DOM
      this.shadowRoot = container.attachShadow({ mode: 'open' });
      
      // Add styles
      const style = document.createElement('style');
      style.textContent = this.getStyles();
      this.shadowRoot.appendChild(style);

      // Create chat UI
      this.renderChatUI();

      // Append to body
      document.body.appendChild(container);

      console.log('n8n Assist chat button injected successfully');
    } catch (error) {
      console.error('Failed to inject n8n Assist:', error);
    }
  }

  private renderChatUI() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>
      <div id="chat-interface">
        ${this.isExpanded ? this.getChatWindow() : this.getFloatingButton()}
      </div>
    `;

    // Add event listeners
    const button = this.shadowRoot.querySelector('#toggle-btn');
    if (button) {
      button.addEventListener('click', () => this.toggleChat());
    }

    const closeBtn = this.shadowRoot.querySelector('#close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.toggleChat());
    }

    const sendBtn = this.shadowRoot.querySelector('#send-btn');
    const input = this.shadowRoot.querySelector('#message-input') as HTMLTextAreaElement;
    
    if (sendBtn && input) {
      sendBtn.addEventListener('click', () => this.sendMessage());
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }
  }

  private toggleChat() {
    this.isExpanded = !this.isExpanded;
    this.renderChatUI();
  }

  private getFloatingButton() {
    return `
      <button id="toggle-btn" class="floating-button">
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
      </button>
    `;
  }

  private getChatWindow() {
    return `
      <div class="chat-window">
        <div class="chat-header">
          <h3>n8n Assist</h3>
          <button id="close-btn" class="close-button">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div class="chat-messages" id="messages">
          <div class="welcome-message">
            <div class="message-icon">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
              </svg>
            </div>
            <p>Hi! I'm your n8n workflow assistant.</p>
            <p class="subtitle">Ask me anything about n8n workflows, nodes, or automation!</p>
          </div>
        </div>
        <div class="chat-input">
          <div class="input-group">
            <textarea id="message-input" placeholder="Ask about n8n workflows..." rows="1"></textarea>
            <button id="send-btn" class="send-button">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private async sendMessage() {
    const input = this.shadowRoot?.querySelector('#message-input') as HTMLTextAreaElement;
    const messagesDiv = this.shadowRoot?.querySelector('#messages');
    
    if (!input || !messagesDiv) return;

    const message = input.value.trim();
    if (!message) return;

    // Clear input
    input.value = '';

    // Add user message
    const userMessageEl = document.createElement('div');
    userMessageEl.className = 'message user-message';
    userMessageEl.innerHTML = `
      <div class="message-content">${this.escapeHtml(message)}</div>
      <div class="message-time">${new Date().toLocaleTimeString()}</div>
    `;
    messagesDiv.appendChild(userMessageEl);

    // Add loading indicator
    const loadingEl = document.createElement('div');
    loadingEl.className = 'message assistant-message loading';
    loadingEl.innerHTML = `
      <div class="message-content">
        <div class="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    messagesDiv.appendChild(loadingEl);

    // Scroll to bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    try {
      // Get settings and send message
      const settings = await this.getSettings();
      if (!settings?.apiKey || !settings?.selectedModel) {
        throw new Error('Please configure your settings first.');
      }

      const response = await chrome.runtime.sendMessage({
        type: 'SEND_MESSAGE',
        data: {
          message,
          apiKey: settings.apiKey,
          model: settings.selectedModel,
        },
      });

      // Remove loading indicator
      messagesDiv.removeChild(loadingEl);

      if (response.success) {
        const assistantMessageEl = document.createElement('div');
        assistantMessageEl.className = 'message assistant-message';
        assistantMessageEl.innerHTML = `
          <div class="message-content">${this.formatResponse(response.data)}</div>
          <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;
        messagesDiv.appendChild(assistantMessageEl);
      } else {
        throw new Error(response.error || 'Failed to get response');
      }
    } catch {
      console.error('Chat error');
      
      // Remove loading indicator
      if (loadingEl.parentNode) {
        messagesDiv.removeChild(loadingEl);
      }

      // Show error message
      const errorEl = document.createElement('div');
      errorEl.className = 'message assistant-message error';
      errorEl.innerHTML = `
        <div class="message-content">
          An error occurred. Please try again.
          ${!await this.getSettings() ? '<br><br><a href="#" onclick="chrome.runtime.openOptionsPage()">Open Settings</a>' : ''}
        </div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
      `;
      messagesDiv.appendChild(errorEl);
    }

    // Scroll to bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  private async getSettings() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
      return response.success ? response.data : null;
    } catch {
      return null;
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private formatResponse(text: string): string {
    // Simple markdown-like formatting
    return this.escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  private getStyles() {
    return `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      .floating-button {
        width: 56px;
        height: 56px;
        background: #0066ff;
        color: white;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 102, 255, 0.3);
        transition: all 0.2s ease;
        font-family: 'Inter', sans-serif;
      }

      .floating-button:hover {
        background: #0052cc;
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(0, 102, 255, 0.4);
      }

      .chat-window {
        width: 384px;
        height: 500px;
        background: #1e293b;
        border: 1px solid #475569;
        border-radius: 12px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        font-family: 'Inter', sans-serif;
        overflow: hidden;
      }

      .chat-header {
        background: #0f172a;
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #475569;
      }

      .chat-header h3 {
        color: white;
        font-size: 16px;
        font-weight: 600;
        margin: 0;
      }

      .close-button {
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: color 0.2s;
      }

      .close-button:hover {
        color: white;
      }

      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .chat-messages::-webkit-scrollbar {
        width: 6px;
      }

      .chat-messages::-webkit-scrollbar-track {
        background: #0f172a;
      }

      .chat-messages::-webkit-scrollbar-thumb {
        background: #475569;
        border-radius: 3px;
      }

      .welcome-message {
        text-align: center;
        color: #94a3b8;
        margin-top: 32px;
      }

      .message-icon {
        width: 48px;
        height: 48px;
        background: #374151;
        border-radius: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;
        color: #9ca3af;
      }

      .welcome-message p {
        margin-bottom: 8px;
        font-size: 16px;
        color: #e2e8f0;
      }

      .welcome-message .subtitle {
        font-size: 14px;
        color: #94a3b8;
      }

      .message {
        display: flex;
        flex-direction: column;
        max-width: 85%;
      }

      .user-message {
        align-self: flex-end;
        align-items: flex-end;
      }

      .assistant-message {
        align-self: flex-start;
        align-items: flex-start;
      }

      .message-content {
        padding: 12px 16px;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.5;
        word-wrap: break-word;
      }

      .user-message .message-content {
        background: #0066ff;
        color: white;
      }

      .assistant-message .message-content {
        background: #374151;
        color: #e2e8f0;
      }

      .assistant-message.error .message-content {
        background: #dc2626;
        color: white;
      }

      .message-time {
        font-size: 11px;
        color: #6b7280;
        margin-top: 4px;
        padding: 0 4px;
      }

      .typing-indicator {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .typing-indicator span {
        width: 6px;
        height: 6px;
        background: #9ca3af;
        border-radius: 50%;
        animation: typing 1.4s infinite ease-in-out;
      }

      .typing-indicator span:nth-child(2) {
        animation-delay: 0.2s;
      }

      .typing-indicator span:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typing {
        0%, 60%, 100% {
          transform: scale(1);
          opacity: 0.5;
        }
        30% {
          transform: scale(1.2);
          opacity: 1;
        }
      }

      .chat-input {
        background: #0f172a;
        padding: 16px;
        border-top: 1px solid #475569;
      }

      .input-group {
        display: flex;
        gap: 8px;
        align-items: flex-end;
      }

      #message-input {
        flex: 1;
        background: #1e293b;
        border: 1px solid #475569;
        border-radius: 8px;
        padding: 12px;
        color: white;
        font-size: 14px;
        font-family: 'Inter', sans-serif;
        resize: none;
        min-height: 20px;
        max-height: 100px;
      }

      #message-input::placeholder {
        color: #6b7280;
      }

      #message-input:focus {
        outline: none;
        border-color: #0066ff;
        box-shadow: 0 0 0 2px rgba(0, 102, 255, 0.2);
      }

      .send-button {
        background: #0066ff;
        border: none;
        border-radius: 8px;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .send-button:hover {
        background: #0052cc;
      }

      .send-button:disabled {
        background: #4b5563;
        cursor: not-allowed;
      }

      code {
        background: #0f172a;
        color: #fbbf24;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 13px;
      }

      strong {
        font-weight: 600;
      }

      em {
        font-style: italic;
      }

      a {
        color: #60a5fa;
        text-decoration: underline;
      }

      a:hover {
        color: #93c5fd;
      }
    `;
  }
}

// Check if we're on a valid n8n workflow page
if (window.location.pathname.includes('/workflow/')) {
  new ChatInjector();
} else {
  console.log('n8n Assist: Not on a workflow page, skipping injection');
}
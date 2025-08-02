import type { OpenRouterModel, OpenRouterResponse, ExtensionSettings } from '../types';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export class OpenRouterService {
  static async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('API key validation failed:', error);
      return false;
    }
  }

  static async getModels(apiKey: string): Promise<OpenRouterModel[]> {
    try {
      const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Failed to fetch models:', error);
      throw error;
    }
  }

  static async sendMessage(
    apiKey: string, 
    model: string, 
    message: string
  ): Promise<string> {
    try {
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant specialized in helping users with n8n workflows. Provide helpful, accurate, and concise responses about n8n workflow automation, node configurations, and best practices. Format your responses in markdown when appropriate.',
            },
            {
              role: 'user',
              content: message,
            },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data: OpenRouterResponse = await response.json();
      return data.choices[0]?.message?.content || 'No response received';
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }
}

export class StorageService {
  static async saveSettings(settings: ExtensionSettings): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ settings }, () => {
        resolve();
      });
    });
  }

  static async getSettings(): Promise<ExtensionSettings | null> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['settings'], (result) => {
        resolve(result.settings || null);
      });
    });
  }

  static async clearSettings(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.clear(() => {
        resolve();
      });
    });
  }
}
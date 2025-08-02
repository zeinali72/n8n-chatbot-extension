import { OpenRouterService, StorageService } from '../services/openrouter';
import type { MessagePayload, ExtensionSettings, OpenRouterModel } from '../types';

// Background service worker for Chrome extension
console.log('n8n Assist background service worker loaded');

// Handle messages from content scripts and options page
chrome.runtime.onMessage.addListener((request: MessagePayload, _sender, sendResponse) => {
  console.log('Background received message:', request);

  switch (request.type) {
    case 'GET_SETTINGS':
      handleGetSettings(sendResponse);
      break;
    
    case 'SAVE_SETTINGS':
      if (request.data?.apiKey && request.data?.selectedModel) {
        handleSaveSettings({
          apiKey: request.data.apiKey,
          selectedModel: request.data.selectedModel
        }, sendResponse);
      } else {
        sendResponse({ error: 'API key and model required' });
      }
      break;
    
    case 'GET_MODELS':
      if (request.data?.apiKey) {
        handleGetModels(request.data.apiKey, sendResponse);
      } else {
        sendResponse({ error: 'API key required' });
      }
      break;
    
    case 'SEND_MESSAGE':
      if (request.data?.message && request.data?.apiKey && request.data?.model) {
        handleSendMessage({
          message: request.data.message,
          apiKey: request.data.apiKey,
          model: request.data.model
        }, sendResponse);
      } else {
        sendResponse({ error: 'Message, API key, and model required' });
      }
      break;
    
    default:
      sendResponse({ error: 'Unknown message type' });
  }

  // Return true to indicate we'll send response asynchronously
  return true;
});

async function handleGetSettings(sendResponse: (response: { success?: boolean; error?: string; data?: ExtensionSettings | null }) => void) {
  try {
    const settings = await StorageService.getSettings();
    sendResponse({ success: true, data: settings });
  } catch (error) {
    console.error('Failed to get settings:', error);
    sendResponse({ error: 'Failed to get settings' });
  }
}

async function handleSaveSettings(settings: ExtensionSettings, sendResponse: (response: { success?: boolean; error?: string }) => void) {
  try {
    // Validate API key before saving
    const isValid = await OpenRouterService.validateApiKey(settings.apiKey);
    if (!isValid) {
      sendResponse({ error: 'Invalid API key' });
      return;
    }

    await StorageService.saveSettings(settings);
    sendResponse({ success: true });
  } catch (error) {
    console.error('Failed to save settings:', error);
    sendResponse({ error: 'Failed to save settings' });
  }
}

async function handleGetModels(apiKey: string, sendResponse: (response: { success?: boolean; error?: string; data?: OpenRouterModel[] }) => void) {
  try {
    const models = await OpenRouterService.getModels(apiKey);
    sendResponse({ success: true, data: models });
  } catch (error) {
    console.error('Failed to get models:', error);
    sendResponse({ error: 'Failed to fetch models' });
  }
}

async function handleSendMessage(
  { message, apiKey, model }: { message: string; apiKey: string; model: string }, 
  sendResponse: (response: { success?: boolean; error?: string; data?: string }) => void
) {
  try {
    const response = await OpenRouterService.sendMessage(apiKey, model, message);
    sendResponse({ success: true, data: response });
  } catch (error) {
    console.error('Failed to send message:', error);
    sendResponse({ error: 'Failed to send message' });
  }
}

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('n8n Assist extension installed:', details);
});
import React, { useState, useEffect, useCallback } from 'react';
import type { ExtensionSettings, OpenRouterModel } from '../types';

const OptionsPage: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const loadModels = useCallback(async (key: string) => {
    if (!key) return;

    setIsLoading(true);
    try {
      const response = await chrome.runtime.sendMessage({ 
        type: 'GET_MODELS', 
        data: { apiKey: key } 
      });

      if (response.success && Array.isArray(response.data)) {
        setModels(response.data);
        if (response.data.length > 0) {
          showMessage('Models loaded successfully!', 'success');
        } else {
           showMessage('API key is valid, but no models were found.', 'error');
        }
      } else {
        showMessage(response.error || 'Failed to load models. Check your API key.', 'error');
        setModels([]);
      }
    } catch {
      showMessage('An error occurred while fetching models.', 'error');
      setModels([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
      if (response.success && response.data) {
        setApiKey(response.data.apiKey || '');
        setSelectedModel(response.data.selectedModel || '');
        if (response.data.apiKey) {
          loadModels(response.data.apiKey);
        }
      }
    } catch {
      console.error('Failed to load settings');
    }
  }, [loadModels]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      showMessage('Please enter an API key', 'error');
      return;
    }

    if (!selectedModel) {
      showMessage('Please select a model', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const settings: ExtensionSettings = { apiKey, selectedModel };
      const response = await chrome.runtime.sendMessage({ 
        type: 'SAVE_SETTINGS', 
        data: settings 
      });

      if (response.success) {
        showMessage('Settings saved successfully!', 'success');
        await loadModels(apiKey); // Reload models to ensure they're current
      } else {
        showMessage(response.error || 'Failed to save settings', 'error');
      }
    } catch {
      showMessage('Failed to save settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    if (value.length > 10) { // Basic validation
      loadModels(value);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">n8n Assist Settings</h1>
          <p className="text-gray-600">Configure your OpenRouter API settings to start using the AI assistant.</p>
        </div>

        <div className="space-y-6">
          {/* API Key Section */}
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
              OpenRouter API Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              placeholder="Enter your OpenRouter API key..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Get your API key from{' '}
              <a 
                href="https://openrouter.ai/keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                OpenRouter.ai
              </a>
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
              AI Model
            </label>
            <select
              id="model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              disabled={isLoading || models.length === 0}
            >
              {isLoading && <option>Loading models...</option>}
              {!isLoading && models.length === 0 && <option>Enter a valid API key above</option>}
              {!isLoading && models.length > 0 && (
                <>
                  <option value="">Select a model...</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name || model.id}
                    </option>
                  ))}
                </>
              )}
            </select>
            {models.length === 0 && apiKey && (
              <p className="mt-1 text-sm text-gray-500">
                Enter a valid API key to load available models
              </p>
            )}
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-4 rounded-md ${
              messageType === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Save Button */}
          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={isLoading || !apiKey || !selectedModel}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-900 mb-2">How to use:</h3>
          <ol className="text-sm text-blue-800 list-decimal list-inside space-y-1">
            <li>Get an API key from OpenRouter.ai</li>
            <li>Enter your API key above</li>
            <li>Select your preferred AI model</li>
            <li>Save your settings</li>
            <li>Navigate to any n8n workflow page to see the chat assistant</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default OptionsPage;
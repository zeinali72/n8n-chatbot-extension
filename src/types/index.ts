export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ExtensionSettings {
  apiKey: string;
  selectedModel: string;
}

export interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export interface MessagePayload {
  type: 'SEND_MESSAGE' | 'GET_MODELS' | 'SAVE_SETTINGS' | 'GET_SETTINGS';
  data?: {
    apiKey?: string;
    selectedModel?: string;
    message?: string;
    model?: string;
  };
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isExpanded: boolean;
}
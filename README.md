# n8n Assist - AI-Powered Chrome Extension

An intelligent Chrome extension that provides real-time AI assistance for n8n workflow automation. Built with React, TypeScript, and the OpenRouter API.

## Features

- 🤖 **AI-Powered Chat Interface**: Get instant help with n8n workflows, nodes, and automation best practices
- 🔐 **Secure Configuration**: API keys stored securely using Chrome's storage.sync API
- 🎨 **Modern UI**: Clean, dark-themed interface with shadow DOM isolation
- 🚀 **Real-time Responses**: Streaming responses from various AI models via OpenRouter
- 📱 **Floating Widget**: Non-intrusive chat button that appears on n8n workflow pages
- 🔧 **Multiple AI Models**: Choose from GPT, Claude, Llama, and other popular models

## Installation

### From Source

1. **Clone the repository**
   ```bash
   git clone https://github.com/zeinali72/n8n-chatbot-extension.git
   cd n8n-chatbot-extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from the project directory

## Setup

### 1. Get an OpenRouter API Key

1. Visit [OpenRouter.ai](https://openrouter.ai/keys)
2. Sign up for an account
3. Generate an API key
4. Copy the key for configuration

### 2. Configure the Extension

1. Right-click the extension icon in Chrome
2. Select "Options" to open the settings page
3. Enter your OpenRouter API key
4. Select your preferred AI model from the dropdown
5. Click "Save Settings"

The extension will validate your API key and load available models automatically.

## Usage

### 1. Navigate to n8n

Visit any n8n workflow page:
- `https://*.n8n.cloud/workflow/*`
- `http://localhost:5678/workflow/*`

### 2. Use the Assistant

1. Look for the floating blue chat button in the bottom-right corner
2. Click to expand the chat interface
3. Ask questions about:
   - n8n workflow design
   - Node configurations
   - Automation best practices
   - Troubleshooting issues
   - Integration recommendations

### 3. Example Questions

- "How do I set up a webhook trigger in n8n?"
- "What's the best way to handle errors in workflows?"
- "How can I transform data between nodes?"
- "Show me how to use the HTTP Request node"
- "What are some common n8n workflow patterns?"

## Development

### Project Structure

```
src/
├── background/          # Service worker for API calls
├── content/            # Content script for page injection
├── options/            # Settings page components
├── components/         # Reusable React components
├── services/           # API and storage services
└── types/              # TypeScript type definitions
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run test` - Run Playwright tests
- `npm run preview` - Preview production build

### Building for Production

```bash
npm run build
```

This creates a `dist/` folder with the complete extension ready for:
- Loading as an unpacked extension in Chrome
- Packaging for Chrome Web Store submission

## Architecture

### Security Features

- **API Key Protection**: Keys stored in Chrome's secure storage.sync
- **Content Security Policy**: Strict CSP prevents code injection
- **Shadow DOM Isolation**: Extension UI completely isolated from host pages
- **Background API Calls**: All external requests made from service worker

### Technical Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **Build Tool**: Vite with Chrome extension optimizations
- **Testing**: Playwright for end-to-end testing
- **AI Integration**: OpenRouter API for multiple model access

### Chrome Extension APIs Used

- `chrome.storage.sync` - Secure settings storage
- `chrome.runtime` - Background script communication
- `chrome.scripting` - Content script injection
- Content Scripts - Page interaction and UI injection

## API Integration

The extension integrates with [OpenRouter](https://openrouter.ai/) to provide access to multiple AI models:

- **GPT Models**: GPT-4, GPT-3.5 Turbo
- **Claude Models**: Claude 3.5 Sonnet, Claude 3 Haiku
- **Open Source**: Llama 2/3, Mistral, and others
- **Specialized**: Code-focused and domain-specific models

## Privacy & Data

- **No Data Collection**: Extension doesn't collect or store user conversations
- **Local Storage Only**: Settings stored locally in Chrome sync storage
- **Direct API Communication**: Messages sent directly to OpenRouter
- **Open Source**: Full source code available for audit

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests if applicable
5. Run the linter: `npm run lint`
6. Submit a pull request

## Testing

The extension includes Playwright tests for core functionality:

```bash
npm run test
```

Tests cover:
- Settings page functionality
- Chat interface injection
- API key validation
- Message sending/receiving

## Troubleshooting

### Extension Not Loading

1. Check that all files are in the `dist/` folder after building
2. Ensure manifest.json is valid
3. Check Chrome Developer Tools for errors

### Chat Button Not Appearing

1. Verify you're on a valid n8n workflow page
2. Check browser console for content script errors
3. Ensure extension has necessary permissions

### API Errors

1. Verify your OpenRouter API key is valid
2. Check you have sufficient credits in your OpenRouter account
3. Ensure your selected model is available

### Settings Not Saving

1. Check that Chrome storage permissions are granted
2. Look for validation errors in the settings page
3. Try clearing extension data and reconfiguring

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues, feature requests, or questions:

1. Check the [Issues](https://github.com/zeinali72/n8n-chatbot-extension/issues) page
2. Create a new issue with detailed information
3. Include browser version, extension version, and error messages

## Acknowledgments

- [n8n](https://n8n.io/) - The amazing workflow automation platform
- [OpenRouter](https://openrouter.ai/) - AI model access and routing
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [React](https://react.dev/) - Frontend framework
- [Vite](https://vitejs.dev/) - Build tool and development server

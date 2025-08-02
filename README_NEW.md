# 🤖 n8n Assist Chrome Extension

An AI-powered Chrome extension that provides intelligent assistance for n8n workflows using the OpenRouter API.

## ✨ Features

- **Floating Chat Interface**: Appears on all websites with a clean, modern UI
- **AI-Powered Responses**: Uses OpenRouter API with multiple AI model options
- **n8n Specialized**: Optimized for n8n workflow questions and automation help
- **Markdown Support**: Rich text formatting for AI responses
- **Easy Configuration**: Simple settings page for API key and model selection
- **Privacy-First**: All data stays between you and OpenRouter

## 🚀 Quick Start

### 1. Get OpenRouter API Key
1. Visit [OpenRouter.ai](https://openrouter.ai/keys)
2. Sign up for a free account
3. Generate your API key

### 2. Install the Extension

#### Development Installation:
1. Clone or download this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the extension
4. Open Chrome and go to `chrome://extensions/`
5. Enable "Developer mode" (toggle in top-right)
6. Click "Load unpacked" and select the `dist` folder

#### Production Installation:
*Coming soon to Chrome Web Store*

### 3. Configure Settings
1. Click the extension icon in Chrome toolbar
2. Go to "Options" or right-click and select "Options"
3. Enter your OpenRouter API key
4. Select your preferred AI model
5. Save settings

### 4. Start Chatting
1. Visit any website
2. Look for the blue chat button in the bottom-right corner
3. Click to open the chat interface
4. Ask questions about n8n workflows!

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Chrome browser

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### Project Structure
```
src/
├── background/         # Chrome extension background scripts
├── components/         # React components
├── content/           # Content scripts for webpage injection
├── options/           # Extension settings page
├── services/          # API services (OpenRouter)
├── types/             # TypeScript type definitions
└── assets/            # Static assets

public/
├── manifest.json      # Extension manifest
└── icons/            # Extension icons
```

### Key Files
- `src/components/ChatInterface.tsx` - Main chat UI component
- `src/background/background.ts` - Extension background service worker
- `src/content/content.tsx` - Content script for injecting UI
- `src/services/openrouter.ts` - OpenRouter API integration
- `src/options/OptionsPage.tsx` - Settings page component

## 🔧 Configuration

The extension requires an OpenRouter API key to function. You can configure:

- **API Key**: Your OpenRouter authentication key
- **AI Model**: Choose from available models (GPT-4, Claude, etc.)

Settings are stored locally using Chrome's storage API.

## 📝 Usage Examples

### Example Questions for n8n:
- "How do I create a webhook trigger in n8n?"
- "What's the best way to handle errors in n8n workflows?"
- "How can I connect Google Sheets to Slack using n8n?"
- "Explain n8n's Code node functionality"
- "Help me debug my workflow execution"

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: Report bugs via GitHub Issues
- **Questions**: Use GitHub Discussions
- **n8n Help**: Visit [n8n Community](https://community.n8n.io/)

## 🔄 Changelog

### v1.0.1
- Initial release
- Basic chat functionality
- OpenRouter API integration
- Chrome extension framework
- Settings page
- Floating UI interface

---

Built with ❤️ for the n8n community

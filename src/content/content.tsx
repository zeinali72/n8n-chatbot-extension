// Content script to inject the chat interface into n8n workflow pages
console.log('n8n Assist content script loaded on:', window.location.href);

import React from 'react';
import { createRoot } from 'react-dom/client';
import ChatInterface from '../components/ChatInterface';
import '../index.css';

// Create a container div for our React app
const container = document.createElement('div');
container.id = 'n8n-assist-react-root';
document.body.appendChild(container);

// Create a Shadow DOM to isolate styles
const shadowRoot = container.attachShadow({ mode: 'open' });
const appRoot = document.createElement('div');
shadowRoot.appendChild(appRoot);

// Link the TailwindCSS stylesheet into the Shadow DOM
const tailwindLink = document.createElement('link');
tailwindLink.rel = 'stylesheet';
tailwindLink.href = chrome.runtime.getURL('assets/index.css'); // Vite will generate this
shadowRoot.appendChild(tailwindLink);

// Render the React component
const root = createRoot(appRoot);
root.render(
  <React.StrictMode>
    <ChatInterface />
  </React.StrictMode>
);

console.log('n8n Assist: React UI injected.');

// Check if we're on a valid n8n workflow page
if (window.location.pathname.includes('/workflow/')) {
  // Injected in the above code
} else {
  console.log('n8n Assist: Not on a workflow page, skipping injection');
}
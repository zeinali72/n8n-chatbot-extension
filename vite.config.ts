import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        options: 'options.html',
        background: path.resolve(__dirname, 'src/background/background.ts'),
        content: path.resolve(__dirname, 'src/content/content.tsx'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Use consistent naming for background and content scripts
          if (chunkInfo.name === 'background' || chunkInfo.name === 'content') {
            return `js/${chunkInfo.name}.js`;
          }
          return 'js/[name].js';
        },
        chunkFileNames: 'js/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { arbApiPlugin } from './arb/vitePlugin.js';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), arbApiPlugin()],
  base: './', // Universal relative base: works on GitHub Pages, Render, Netlify, and Vercel
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('src/lib/arbitrage')) return 'arb-core';
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'https://predictions.thebryme.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
});

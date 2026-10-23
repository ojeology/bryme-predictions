import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Universal relative base: works on GitHub Pages, Render, Netlify, and Vercel
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('src/data/gzCore')) return 'gz-core';
          if (id.includes('src/data/gzClubsA')) return 'gz-clubs-a';
          if (id.includes('src/data/gzClubsB')) return 'gz-clubs-b';
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

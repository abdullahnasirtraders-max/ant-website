import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const api = 'http://localhost:5000';
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': api, '/sitemap.xml': api } },
  build: { target: 'es2020', rollupOptions: { output: { manualChunks: { react: ['react', 'react-dom', 'react-router-dom'] } } } },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  base: '/',
  build: {
    sourcemap: true,
    outDir: 'dist',
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'https://nekota-server-production.up.railway.app',
        changeOrigin: true,
      },
    },
  },
});

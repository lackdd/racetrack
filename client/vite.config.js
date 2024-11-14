import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // The backend server
        changeOrigin: true,            // Ensures the Host header matches the target
        rewrite: (path) => path.replace(/^\/api/, ''), // Optionally rewrite paths
      },
    },
  },
});

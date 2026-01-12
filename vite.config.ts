import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/WorkAvenger/', // Matches your repository name
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    // 'define' removed as GEMINI_API_KEY is no longer used
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});

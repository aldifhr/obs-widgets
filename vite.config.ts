import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  root: '.',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/llm-proxy': {
        target: process.env.LLM_PROXY_TARGET || 'http://43.133.32.206:20128',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/llm-proxy/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        hub: './index.html',
        valorant: './valorant.html',
        'customizer/valorant': './customizer/valorant.html',
        'widgets/prayer': './widgets/prayer.html',
        'widgets/countdown': './widgets/countdown.html',
        'widgets/weather': './widgets/weather.html',
        'widgets/crypto': './widgets/crypto.html',
        shoutout: './shoutout.html',
        'customizer/shoutout': './customizer/shoutout.html',
        'demo/shoutout': './demo/shoutout.html',
      }
    }
  }
});

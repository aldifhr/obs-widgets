import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  root: '.',
  plugins: [react(), tailwindcss()],
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
      }
    }
  }
});

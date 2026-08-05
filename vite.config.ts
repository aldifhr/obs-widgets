import { defineConfig } from 'vite';
export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        hub: './src/hub.ts',
        'widgets/valorant': './src/widgets/valorant.ts',
        'widgets/prayer': './src/widgets/prayer.ts',
        'widgets/countdown': './src/widgets/countdown.ts',
        'widgets/weather': './src/widgets/weather.ts',
        'widgets/crypto': './src/widgets/crypto.ts',
      }
    }
  }
});

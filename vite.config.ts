import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // works on GitHub Pages / any static host (the app uses hash routing)
  server: { port: 5173 },
});

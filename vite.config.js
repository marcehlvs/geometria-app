import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Publicada en GitHub Pages: https://marcehlvs.github.io/geometria-app/
// Por eso "base" lleva el nombre del repo. Si algún día la pasás a Vercel o a un
// dominio propio, cambiala a '/'.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/geometria-app/',
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{js,jsx}'],
    css: false,
  },
});
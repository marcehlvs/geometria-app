import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Si publicás en GitHub Pages, descomentá la línea "base".
// En Vercel no hace falta.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // base: '/geometria-app/',
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{js,jsx}'],
    css: false,
  },
});

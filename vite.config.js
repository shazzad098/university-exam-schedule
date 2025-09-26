import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// vite.config.js
export default defineConfig({
  plugins: [tailwindcss()],
  server: { port: 3000 },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['jspdf', 'xlsx'],
          'tailwind': ['tailwindcss']
        }
      }
    }
  }
})

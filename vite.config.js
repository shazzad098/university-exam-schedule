// vite.config.js
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './', // <--- এই লাইনটি যোগ করুন
  plugins: [tailwindcss()],
  server: { port: 3000 },
  build: {
    cssMinify: true, // Important for Tailwind v4
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['jspdf', 'xlsx']
        }
      }
    }
  },
  css: {
    postcss: {
      plugins: []
    }
  }
})
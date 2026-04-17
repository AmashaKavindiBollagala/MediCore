import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // API Gateway
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') // Strip /api prefix
      },
      '/uploads': {
        target: 'http://localhost:3010', // Doctor service (mapped from 3000)
        changeOrigin: true,
      }
    }
  }
})

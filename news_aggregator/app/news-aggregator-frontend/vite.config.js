import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/user': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/home': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/post': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/profile': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/comments': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/search': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
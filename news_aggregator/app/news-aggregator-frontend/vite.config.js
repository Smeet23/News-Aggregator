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
      '/home/posts': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/home/post': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/post/createpost': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/post/update': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/post/deletePost': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/post/upload': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/profile': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/api/profile': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
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
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        rewrite: (path) => path
      },
      '/health': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      }
    },
    fs: {
      allow: [path.resolve(__dirname, '.'), path.resolve(__dirname, 'public')]
    }
  },
  css: {
    lightningcss: {
      errorRecovery: true,
    }
  },
  build: {
    outDir: 'build',
    sourcemap: false,
  },
})

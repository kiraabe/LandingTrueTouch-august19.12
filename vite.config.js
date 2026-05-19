import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
    fs: {
      allow: [path.resolve(__dirname, '.'), path.resolve(__dirname, 'public')]
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  css: {
    lightningcss: {
      errorRecovery: true,
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})

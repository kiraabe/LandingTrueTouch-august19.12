import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    fs: {
      allow: [path.resolve(__dirname, '.'), path.resolve(__dirname, 'public')]
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
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

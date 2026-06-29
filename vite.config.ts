import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // Proxy /api/* and WebSocket to the Node.js backend
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/d3') || id.includes('node_modules/d3-')) return 'd3'
          if (id.includes('node_modules/recharts')) return 'recharts'
          if (id.includes('node_modules/react') || id.includes('node_modules/zustand') || id.includes('node_modules/framer-motion')) return 'vendor'
        },
      },
    },
  },
})

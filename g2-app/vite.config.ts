import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://this-day-jp.vercel.app',
        changeOrigin: true,
      },
    },
  },
  build: { target: 'esnext' },
})

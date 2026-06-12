import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:8080',
      '/api': 'http://localhost:8080',
      '/debts': 'http://localhost:8080',
      '/strategy': 'http://localhost:8080'
    }
  }
})

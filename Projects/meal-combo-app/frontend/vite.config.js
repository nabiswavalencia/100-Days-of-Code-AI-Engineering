import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Send /api requests to the FastAPI server, so the browser sees one origin (no CORS setup needed).
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})

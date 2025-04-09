import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],
  server: {
    allowedHosts: [
      'localhost', // Default, already allowed
      "201d-2401-4900-415c-4f88-9889-1fba-d095-e95a.ngrok-free.app", // Your ngrok host
    ],
  },

})

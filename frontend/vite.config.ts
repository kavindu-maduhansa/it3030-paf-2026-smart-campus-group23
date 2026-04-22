import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget = env.VITE_BACKEND_ORIGIN || 'http://127.0.0.1:8086'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': { target: backendTarget, changeOrigin: true },
        '/ws': { target: backendTarget, ws: true, changeOrigin: true },
      },
    },
  }
})

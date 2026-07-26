import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
    },
    allowedHosts: [
      'shawl-vertical-depravity.ngrok-free.dev',
      '192.168.1.53.nip.io'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
    // hmr: {
    //   clientPort: 5173, // บังคับให้วิ่งกลับมาสั่ง Refresh ที่พอร์ต 5173 ของเครื่องเรา
    // }
  }
})

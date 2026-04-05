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
    // hmr: {
    //   clientPort: 5173, // บังคับให้วิ่งกลับมาสั่ง Refresh ที่พอร์ต 5173 ของเครื่องเรา
    // }
    
  }
})

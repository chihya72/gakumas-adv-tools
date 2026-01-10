import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    host: '0.0.0.0', // 允许局域网访问
    allowedHosts: ['txt.gakumas.cn'], // 允许的域名
  },
})

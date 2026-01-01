import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@components': path.resolve(__dirname, './src/components'),
    },
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      // 允许访问上级目录的resource文件夹
      allow: ['..'],
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/app': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      // 注意：管理端 API 用 /adminapi 前缀，不能用 /admin ——
      // /admin/* 同时是前端路由（/admin/login 等），若代理 /admin 会把页面请求
      // 也转发给后端，导致管理页整片 404。
      '/adminapi': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/adminapi/, '/admin'),
      },
    },
  },
})

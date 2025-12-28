import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    // ✨ 配置路径别名，@ 代表 src 目录
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173, // 前端端口
    proxy: {
      // ✨ 关键配置：解决本地开发跨域问题
      '/api': {
        target: 'http://localhost:3000', // 转发给后端
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '') // 你的后端路由本身就带/api，所以不需要这行
      },
      '/uploads': {
        target: 'http://localhost:3000', // 转发上传文件
        changeOrigin: true,
      }
    }
  }
})
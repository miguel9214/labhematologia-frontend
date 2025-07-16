import { defineConfig } from 'vite'
import vue            from '@vitejs/plugin-vue'
import path           from 'path'

export default defineConfig({
  plugins: [ vue() ],  // ≤ Asegúrate de que está aquí
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: { '/api': { target: 'http://0.0.0.0:8000', changeOrigin: true } }
  }
})

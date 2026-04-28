import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/postcss'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const DIR_NAME = 'dataman'

// 自定义插件：打包时删除 dev.js 文件
function removeDevConfigPlugin() {
  return {
    name: 'remove-dev-config-plugin',
    apply: 'build',
    closeBundle() {
      const configDir = path.resolve(__dirname, DIR_NAME, 'config')
      if (fs.existsSync(configDir)) {
        fs.readdirSync(configDir).forEach((file) => {
          if (file.endsWith('.dev.js')) {
            fs.unlinkSync(path.join(configDir, file))
            console.log(`🧹 Removed dev config: ${file}`)
          }
        })
      }
    },
  }
}
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), removeDevConfigPlugin()],
  // Cesium 配置
  define: {
    // 定义全局变量，避免 Cesium 的 AMD 模块加载问题
    CESIUM_BASE_URL: JSON.stringify('/cesium/'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss],
    },
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `@use "@/theme/themes.scss" as *;`,
      },
    },
  },
  server: {
    port: 1609,
    proxy: {
      '^/(oauthtokenapigateway|authservice)': {
        target: 'http://222.190.118.45:18080',
        changeOrigin: true,
      },
      '/api': {
        target: 'https://opensky-network.org',
        changeOrigin: true,
      },
    },
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
  build: {
    outDir: DIR_NAME,
    sourcemap: process.env.NODE_ENV !== 'production',
    rollupOptions: {
      output: {
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: ({ name }) => {
          if (/\.(css|scss)$/.test(name ?? '')) return 'css/[name].[hash][extname]'
          if (/\.(png|jpe?g|webp|svg|gif)$/.test(name ?? '')) return 'img/[name].[hash][extname]'
          return 'assets/[name].[hash][extname]'
        },
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const parts = id.toString().split('node_modules/')[1].split('/')
            return parts[0] // 按包名拆分第三方库
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  base: './',
})

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

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  define: {
    CESIUM_BASE_URL: JSON.stringify('/cesium'),
  },
  envDir: 'env',
  css: {
    postcss: {
      plugins: [tailwindcss],
    },
  },
  server: {
    port: 1609,
    proxy: {
      '^/(oauthtokenapigateway|authservice)': {
        target: 'http://222.190.118.45:18080',
        // changeOrigin: true,
        configure: (_, options) => console.log('转发代理地址：', options.target),
      },
      '^/(data)': {
        target: 'https://zrzy.tianditu.gov.cn',
        // changeOrigin: true,
        configure: (_, options) => console.log('转发代理地址：', options.target),
      },
    },
  },
  build: {
    outDir: 'HKBI',
    // 启用图片压缩
    assetsInlineLimit: 4096, // 小于4KB的图片会被内联为base64
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
    // 启用压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 移除console
        drop_debugger: true, // 移除debugger
      },
    },
  },
  base: './',
})

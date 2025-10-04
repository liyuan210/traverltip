import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // 构建配置
  build: {
    // 输出目录
    outDir: 'dist',
    // 静态资源目录
    assetsDir: 'assets',
    // 代码分割
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        pricing: resolve(__dirname, 'pricing_en.html'),
        language: resolve(__dirname, 'language.html'),
        login: resolve(__dirname, 'login_register_en.html'),
        search: resolve(__dirname, 'search.html'),
        admin: resolve(__dirname, 'supabase-admin.html')
      },
      output: {
        // 代码分割策略
        manualChunks: {
          // 第三方库单独打包
          vendor: ['gtag'],
          // 工具类单独打包（i18n 已移除）
          // utils chunk removed
          // 主要功能
          main: ['js/main.js']
        },
        // 文件命名策略
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            return `assets/media/[name]-[hash].${ext}`
          }
          if (/\.(png|jpe?g|gif|svg|webp|avif)(\?.*)?$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash].${ext}`
          }
          if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash].${ext}`
          }
          return `assets/[ext]/[name]-[hash].${ext}`
        }
      }
    },
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // 生成 source map
    sourcemap: false,
    // 资源内联阈值
    assetsInlineLimit: 4096
  },

  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    cors: true,
    // 代理配置（如果需要）
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  // 预览服务器配置
  preview: {
    port: 4173,
    open: true
  },

  // CSS 配置
  css: {
    // CSS 模块化
    modules: {
      localsConvention: 'camelCase'
    },
    // PostCSS 配置
    postcss: {
      plugins: [
        // 自动添加浏览器前缀
        require('autoprefixer'),
        // CSS 压缩
        require('cssnano')({
          preset: 'default'
        })
      ]
    }
  },

  // 插件配置
  plugins: [
    // PWA 插件
    {
      name: 'pwa-manifest',
      generateBundle() {
        // 生成 PWA manifest
        this.emitFile({
          type: 'asset',
          fileName: 'manifest.json',
          source: JSON.stringify({
            name: 'Jiangnan Travel Blog',
            short_name: 'Jiangnan Travel',
            description: 'Discover the poetic water towns of Southern China',
            start_url: '/',
            display: 'standalone',
            background_color: '#2e7d32',
            theme_color: '#2e7d32',
            icons: [
              {
                src: 'assets/images/icon-192.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'assets/images/icon-512.png',
                sizes: '512x512',
                type: 'image/png'
              }
            ]
          }, null, 2)
        })
      }
    }
  ],

  // 优化配置
  optimizeDeps: {
    include: ['js/main.js']
  },

  // 环境变量
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
})
/*
 * [개념]
 * additionalData로 공통 SCSS 토큰과 믹스인을 각 SFC에 자동 주입하고,
 * 개발 프록시로 브라우저의 /api 요청을 별도 목업 서버에 연결한다.
 *
 * [Vue 2였다면]
 * // vue.config.js
 * module.exports = {
 *   css: {
 *     loaderOptions: {
 *       scss: {
 *         additionalData: '@use "@/styles/tokens" as *;\n@use "@/styles/mixins" as *;'
 *       }
 *     }
 *   },
 *   devServer: {
 *     proxy: { '/api': { target: 'http://localhost:3001', pathRewrite: { '^/api': '' } } }
 *   }
 * }
 */
import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `@use "@/styles/tokens" as *;
@use "@/styles/mixins" as *;`,
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})

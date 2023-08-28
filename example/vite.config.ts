/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'

export default defineConfig(viteConfigEnv => {
  console.log(viteConfigEnv)
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('src', import.meta.url)),
      },
    },
  }
})

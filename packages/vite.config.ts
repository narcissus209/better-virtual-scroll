import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    outDir: 'dist',
    minify: true,
    lib: {
      entry: './index.ts',
      name: 'better-virtual-scroll',
    },
    rollupOptions: {
      //忽略打包vue文件
      external: ['vue'],
      input: './index.ts',
      output: [
        {
          format: 'es',
          entryFileNames: '[name].js',
          dir: './dist/es',
          preserveModules: true,
          preserveModulesRoot: './components',
        },
        {
          format: 'cjs',
          entryFileNames: '[name].js',
          dir: './dist/lib',
          preserveModules: true,
          preserveModulesRoot: './components',
        },
      ],
    },
  },
  plugins: [
    vue(),
    dts({
      outputDir: './dist/typings',
      tsConfigFilePath: './tsconfig.json',
    }),
  ],
})
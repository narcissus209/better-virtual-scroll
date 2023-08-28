import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    outDir: 'dist',
    minify: true,
    lib: {
      entry: './src/index.ts',
      name: 'better-virtual-scroll',
    },
    rollupOptions: {
      external: ['vue'],
      input: './src/index.ts',
      output: [
        {
          format: 'es',
          entryFileNames: '[name].js',
          dir: './dist/es',
          preserveModules: true,
          preserveModulesRoot: './src',
        },
        {
          format: 'cjs',
          entryFileNames: '[name].js',
          dir: './dist/lib',
          preserveModules: true,
          preserveModulesRoot: './src',
        },
      ],
    },
  },
  plugins: [
    vue(),
    dts({
      outDir: './dist/typings',
      tsconfigPath: './tsconfig.json',
    }),
  ],
})

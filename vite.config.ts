import path from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), dts()],
  // root: path.join(__dirname, 'src', 'main'),
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: path.join(__dirname, 'src', 'index.ts'),
      },
    },
    lib: {
      entry: path.join(__dirname, 'src', 'index.ts'),
      name: 'main',
      formats: ['cjs'],
      // fileName: (format) => `main.${format}.js`,
      fileName: (format) => `index.js`,
    },
    outDir: path.join(__dirname, 'dist'),
    minify: true,
    // ssr: true,
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@root': path.resolve(__dirname),
    },
  },
})

import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      outDir: 'dist',
      insertTypesEntry: true,
    }),
    visualizer({
      filename: 'dist/bundle-analysis.html',
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'three/index': resolve(__dirname, 'src/three/index.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        format === 'cjs' ? `${entryName}.cjs` : `${entryName}.js`,
    },
    rollupOptions: {
      external: ['three'],
      output: {
        globals: { three: 'THREE' },
      },
    },
    sourcemap: 'hidden',
    minify: 'esbuild',
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'cosmos-lib': path.resolve(__dirname, '../../src'),
      'cosmos-lib/three': path.resolve(__dirname, '../../src/three'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'cosmos-lib/react': path.resolve(__dirname, '../../src/react'),
      'cosmos-lib': path.resolve(__dirname, '../../src'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
})

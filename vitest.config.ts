import { defineConfig } from 'vitest/config'
import path from 'path'

const cfg = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@lib': path.resolve(__dirname, './lib'),
      '@features': path.resolve(__dirname, './features'),
      '@components': path.resolve(__dirname, './components'),
      '@hooks': path.resolve(__dirname, './hooks'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  // disable worker threads to avoid transient ENOENT on Windows temp files
  threads: false,
  test: {
    environment: 'node',
    globals: true,
    include: ['**/__tests__/**/*.test.{ts,tsx,js}'],
  },
} as unknown as Parameters<typeof defineConfig>[0]

export default defineConfig(cfg)

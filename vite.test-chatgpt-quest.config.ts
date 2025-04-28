import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist-test',
    lib: {
      entry: 'scripts/test-chatgpt-quest.ts',
      formats: ['es'],
      fileName: 'test-chatgpt-quest'
    }
  }
}) 
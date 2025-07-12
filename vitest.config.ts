import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    includeSource: ['src/**/*.ts'],
    coverage: {
      reporter: ['text', 'json', 'html']
    }
  }
}); 
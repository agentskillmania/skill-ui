import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';
import path from 'path';

// Load env from root .env
dotenv.config({ path: '.env' });

export default defineConfig({
  resolve: {
    alias: {
      '@agentskillmania/agenui': path.resolve(
        __dirname,
        'packages/chat/test/__mocks__/agenui.tsx',
      ),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['packages/*/test/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        branches: 90,
        functions: 90,
        lines: 90,
        statements: 90,
      },
      include: ['packages/*/src/**/*.{ts,tsx}'],
      exclude: ['packages/*/src/**/*.d.ts', 'packages/*/src/**/index.ts'],
    },
  },
});

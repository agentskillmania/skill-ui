import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    server: {
      deps: {
        /**
         * Same as the workspace root config: file:-linked skill-ui packages are
         * materialized as .pnpm store copies; externalizing them would (a) load
         * @emotion/react twice (ESM vs CJS) splitting the ThemeContext and
         * (b) bypass the genui alias, loading the real genui with its bundled
         * lottie that needs a canvas at import time. Inline keeps one identity.
         */
        inline: [/@agentskillmania\/skill-ui-/],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/**/index.ts', 'src/**/*.stories.tsx'],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
  },
  resolve: {
    alias: {
      '@agentskillmania/genui': path.resolve(__dirname, '../chat/test/__mocks__/genui.tsx'),
      '@agentskillmania/skill-ui-shared': path.resolve(__dirname, '../shared/src/index.ts'),
    },
  },
});

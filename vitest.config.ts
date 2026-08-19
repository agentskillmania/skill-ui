import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@agentskillmania/genui': path.resolve(__dirname, 'packages/chat/test/__mocks__/genui.tsx'),
    },
    /**
     * Skill-ui packages link to each other via `file:` (see package.json) —
     * pnpm materializes those targets as store copies under node_modules/.pnpm.
     * With symlink paths kept (vitest default), @emotion/react loads under two
     * module identities (source vs store copy) and the emotion ThemeContext
     * splits, so useTheme() returns the empty default theme. Resolving
     * realpaths yields one module instance → one context.
     */
    preserveSymlinks: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    server: {
      deps: {
        /**
         * Skill-ui packages link to each other via `file:`. When pnpm
         * materializes those targets as .pnpm store copies, vitest externalizes
         * them to Node while the workspace originals are vite-inlined — so
         * @emotion/react then loads twice (ESM for inlined, CJS for external)
         * and the emotion ThemeContext splits. Inline every skill-ui package
         * so the whole graph shares one vite-resolved emotion instance.
         */
        inline: [/@agentskillmania\/skill-ui-/],
      },
    },
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
      exclude: ['packages/*/src/**/*.d.ts', 'packages/*/src/**/index.ts', 'packages/*/src/**/*.stories.tsx'],
    },
  },
});

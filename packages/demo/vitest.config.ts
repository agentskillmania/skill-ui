import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.test.ts', 'test/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      include: ['server/**/*.ts', 'src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'server/index.ts',
        'server/types.ts',
        'server/agent.ts',
        'server/session-manager.ts',
        'server/routes/agent-state.ts',
        'server/routes/chat.ts',
        'server/routes/files.ts',
        'src/main.tsx',
        'src/types.ts',
        'src/pages/*.tsx',
        '**/*.d.ts',
      ],
      thresholds: {
        branches: 90,
        functions: 90,
        lines: 90,
        statements: 90,
      },
    },
  },
  resolve: {
    alias: {
      '@agentskillmania/skill-ui-chat': path.resolve(__dirname, '../chat/src/index.ts'),
      '@agentskillmania/skill-ui-cockpit': path.resolve(__dirname, '../cockpit/src/index.ts'),
      '@agentskillmania/skill-ui-editor': path.resolve(__dirname, '../editor/src/index.ts'),
      '@agentskillmania/skill-ui-theme': path.resolve(__dirname, '../theme/src/index.ts'),
      '@agentskillmania/skill-ui-frame': path.resolve(__dirname, '../frame/src/index.ts'),
      '@agentskillmania/agenui': path.resolve(__dirname, '../chat/test/__mocks__/agenui.tsx'),
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
    }),
  ],
  root: 'src',
  server: {
    port: 3200,
    proxy: {
      '/api': 'http://localhost:3100',
    },
  },
  resolve: {
    alias: {
      '@agentskillmania/skill-ui-chat': path.resolve(__dirname, '../chat/src/index.ts'),
      '@agentskillmania/skill-ui-cockpit': path.resolve(__dirname, '../cockpit/src/index.ts'),
      '@agentskillmania/skill-ui-editor': path.resolve(__dirname, '../editor/src/index.ts'),
      '@agentskillmania/skill-ui-frame': path.resolve(__dirname, '../frame/src/index.ts'),
      '@agentskillmania/skill-ui-theme': path.resolve(__dirname, '../theme/src/index.ts'),
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
    }),
  ],
  root: '.',
  resolve: {
    alias: {
      '@agentskillmania/skill-ui-theme': '../src/index.ts',
    },
  },
});

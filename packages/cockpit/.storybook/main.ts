import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@chromatic-com/storybook', '@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: '@storybook/react-vite',
  viteFinal: async (config) => {
    // Sub-path deployment (e.g. GitHub Pages). Local dev keeps the default '/'.
    config.base = process.env.STORYBOOK_BASE_PATH ?? '/';
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      // Resolve workspace packages to source for HMR during development
      '@agentskillmania/skill-ui-theme': path.resolve(__dirname, '../../theme/src/index.ts'),
      '@agentskillmania/skill-ui-chat': path.resolve(__dirname, '../../chat/src/index.ts'),
    };
    return config;
  },
};

export default config;

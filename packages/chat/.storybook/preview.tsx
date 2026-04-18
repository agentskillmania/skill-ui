/** @jsxImportSource @emotion/react */
import type { Preview } from '@storybook/react-vite';
import { ThemeProvider } from '@emotion/react';
import { ConfigProvider } from 'antd';
import {
  lightTheme,
  lightAntdConfig,
  lightAntdXTokens,
  GlobalStyles,
} from '@agentskillmania/skill-ui-theme';
import { ChatContext } from '../src/context.js';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: lightTheme.color.bgBase },
        { name: 'dark', value: '#0f172a' },
      ],
    },
  },
  decorators: [
    (Story) => (
      <ConfigProvider theme={lightAntdConfig}>
        <ThemeProvider theme={lightTheme}>
          <ChatContext.Provider value={{ renderers: {} }}>
            <GlobalStyles />
            <Story />
          </ChatContext.Provider>
        </ThemeProvider>
      </ConfigProvider>
    ),
  ],
};

export default preview;

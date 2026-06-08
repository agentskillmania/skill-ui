import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '@emotion/react';
import { ConfigProvider } from 'antd';
import { lightTheme, lightAntdConfig } from '@agentskillmania/skill-ui-theme';
import { WindowControls } from './WindowControls.js';

const meta: Meta<typeof WindowControls> = {
  title: 'Frame/WindowControls',
  component: WindowControls,
  decorators: [
    (Story) => (
      <ConfigProvider theme={lightAntdConfig}>
        <ThemeProvider theme={lightTheme}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              background: '#f5f5f5',
              borderBottom: '1px solid #d9d9d9',
            }}
          >
            <Story />
          </div>
        </ThemeProvider>
      </ConfigProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof WindowControls>;

export const Default: Story = {};

export const Maximized: Story = {
  args: { isMaximized: true },
};

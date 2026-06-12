import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '@emotion/react';
import { ConfigProvider } from 'antd';
import { lightTheme, lightAntdConfig } from '@agentskillmania/skill-ui-theme';
import { SessionSection } from './SessionSection.js';

const meta: Meta<typeof SessionSection> = {
  title: 'Portal/SessionSection',
  component: SessionSection,
  decorators: [
    (Story) => (
      <ConfigProvider theme={lightAntdConfig}>
        <ThemeProvider theme={lightTheme}>
          <Story />
        </ThemeProvider>
      </ConfigProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof SessionSection>;

const mockSessions = Array.from({ length: 5 }, (_, i) => ({
  id: `session-${i}`,
  agentId: `agent-${i}`,
  agentName: `Agent ${i + 1}`,
  workspacePath: `/tmp/workspace-${i}`,
  lastActive: `${i + 1}h ago`,
  tokenCount: (i + 1) * 1000,
}));

export const Default: Story = {
  args: {
    sessions: mockSessions,
    page: 1,
    total: mockSessions.length,
    filterWorkspace: undefined,
    onFilterWorkspaceChange: () => {},
    onPageChange: () => {},
    onResume: () => {},
    onDelete: () => {},
    onFork: () => {},
    onClear: () => {},
  },
};

export const Empty: Story = {
  args: {
    sessions: [],
    page: 1,
    total: 0,
    filterWorkspace: undefined,
    onFilterWorkspaceChange: () => {},
    onPageChange: () => {},
    onResume: () => {},
    onDelete: () => {},
  },
};

export const WithPagination: Story = {
  args: {
    sessions: mockSessions.slice(0, 3),
    page: 1,
    pageSize: 3,
    total: 20,
    filterWorkspace: undefined,
    onFilterWorkspaceChange: () => {},
    onPageChange: () => {},
    onResume: () => {},
    onDelete: () => {},
    onClear: () => {},
  },
};

export const WithoutClearButton: Story = {
  args: {
    sessions: mockSessions,
    page: 1,
    total: mockSessions.length,
    filterWorkspace: undefined,
    onFilterWorkspaceChange: () => {},
    onPageChange: () => {},
    onResume: () => {},
    onDelete: () => {},
  },
};

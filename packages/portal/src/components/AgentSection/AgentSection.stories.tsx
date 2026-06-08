import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '@emotion/react';
import { ConfigProvider } from 'antd';
import { lightTheme, lightAntdConfig } from '@agentskillmania/skill-ui-theme';
import { AgentSection } from './AgentSection.js';

const meta: Meta<typeof AgentSection> = {
  title: 'Portal/AgentSection',
  component: AgentSection,
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

type Story = StoryObj<typeof AgentSection>;

const mockAgents = Array.from({ length: 5 }, (_, i) => ({
  id: `agent-${i}`,
  name: `Agent ${i + 1}`,
  description: `Description for agent ${i + 1}`,
  source: i % 2 === 0 ? ('builtin' as const) : ('custom' as const),
  skillCount: i,
}));

export const Default: Story = {
  args: {
    agents: mockAgents,
    page: 1,
    total: mockAgents.length,
    onPageChange: () => {},
    onChat: () => {},
    onEdit: () => {},
    onDelete: () => {},
    onCreate: () => {},
  },
};

export const Empty: Story = {
  args: {
    agents: [],
    page: 1,
    total: 0,
    onPageChange: () => {},
    onChat: () => {},
    onEdit: () => {},
    onDelete: () => {},
    onCreate: () => {},
  },
};

export const WithPagination: Story = {
  args: {
    agents: mockAgents.slice(0, 3),
    page: 1,
    pageSize: 3,
    total: 20,
    onPageChange: () => {},
    onChat: () => {},
    onEdit: () => {},
    onDelete: () => {},
    onCreate: () => {},
  },
};

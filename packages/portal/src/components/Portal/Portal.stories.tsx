import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '@emotion/react';
import { ConfigProvider } from 'antd';
import { lightTheme, lightAntdConfig } from '@agentskillmania/skill-ui-theme';
import { Portal } from './Portal.js';
import type { PortalProps } from '../../types.js';

const meta: Meta<typeof Portal> = {
  title: 'Portal/Portal',
  component: Portal,
  decorators: [
    (Story) => (
      <ConfigProvider theme={lightAntdConfig}>
        <ThemeProvider theme={lightTheme}>
          <div style={{ height: '100vh' }}>
            <Story />
          </div>
        </ThemeProvider>
      </ConfigProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Portal>;

const mockAgents = Array.from({ length: 5 }, (_, i) => ({
  id: `agent-${i}`,
  name: `Agent ${i + 1}`,
  description: `Description for agent ${i + 1}`,
  source: i % 2 === 0 ? ('builtin' as const) : ('custom' as const),
  skillCount: i,
}));

const mockSkills = Array.from({ length: 6 }, (_, i) => ({
  id: `skill-${i}`,
  name: `Skill ${i + 1}`,
  description: `Description for skill ${i + 1}`,
}));

const mockSessions = Array.from({ length: 4 }, (_, i) => ({
  id: `session-${i}`,
  agentId: `agent-${i}`,
  agentName: `Agent ${i + 1}`,
  workspacePath: `/tmp/workspace-${i}`,
  lastActive: `${i + 1}h ago`,
  tokenCount: (i + 1) * 1000,
}));

const baseArgs: PortalProps = {
  searchResults: { agents: [], skills: [], sessions: [] },
  onSearch: () => {},
  onSearchSelect: () => {},
  onSearchEdit: () => {},
  agents: mockAgents,
  agentsPage: 1,
  agentsTotal: mockAgents.length,
  onAgentsPageChange: () => {},
  skills: mockSkills,
  skillsPage: 1,
  skillsTotal: mockSkills.length,
  onSkillsPageChange: () => {},
  sessions: mockSessions,
  sessionsPage: 1,
  sessionsTotal: mockSessions.length,
  onSessionsPageChange: () => {},
  onAgentChat: () => {},
  onAgentEdit: () => {},
  onAgentCreate: (_name: string) => {},
  onAgentDelete: () => {},
  onSkillChat: () => {},
  onSkillEdit: () => {},
  onSkillCreate: (_name: string) => {},
  onSkillDelete: () => {},
  onSessionResume: () => {},
  onSessionDelete: () => {},
  onSessionFork: () => {},
  onSessionClear: () => {},
};

export const Default: Story = {
  args: baseArgs,
};

export const AgentsTab: Story = {
  args: { ...baseArgs, activeTab: 'agents' },
};

export const SessionsTab: Story = {
  args: { ...baseArgs, activeTab: 'sessions' },
};

export const Empty: Story = {
  args: {
    ...baseArgs,
    agents: [],
    agentsTotal: 0,
    skills: [],
    skillsTotal: 0,
    sessions: [],
    sessionsTotal: 0,
  },
};

export const WithSearch: Story = {
  args: {
    ...baseArgs,
    searchResults: {
      skills: [{ type: 'skill', id: 'skill-0', title: 'Web Search', subtitle: 'Search the web' }],
      agents: [],
      sessions: [],
    },
  },
};

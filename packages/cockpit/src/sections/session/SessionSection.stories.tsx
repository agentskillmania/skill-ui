import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { SessionSection } from './SessionSection.js';
import type { SessionOverviewData, SessionInfoData } from './types.js';

const overviewData: SessionOverviewData = {
  title: 'Fix auth test failure',
  agentName: 'debug-agent',
  model: 'claude-sonnet-4-6',
  stepCount: 12,
  messageCount: 47,
  tokensIn: 8241,
  tokensOut: 1527,
  tokensTotal: 9768,
  estimatedContextSize: 9770,
  contextWindow: 16000,
  status: 'running',
  createdAt: '2026-06-05T14:32:00Z',
  updatedAt: '2026-06-05T14:33:00Z',
};

const infoData: SessionInfoData = {
  sessionId: '1717488800-a3f2b1',
  agentName: 'debug-agent',
  agentConfigPath: '~/.agentskillmania/agents/debug.md',
  model: 'claude-sonnet-4-6',
  tokensIn: 8241,
  tokensOut: 1527,
  tokensTotal: 9768,
  workspacePath: '/Users/dev/project',
  sessionPath: '~/.agentskillmania/sessions/abc/a3f2b1',
  skillDirs: ['/Users/dev/project/.skills', '/Users/dev/.agentskillmania/skills'],
  mcpConfigPaths: ['/Users/dev/project/.mcp/github.json', '/Users/dev/project/.mcp/postgres.json'],
};

const meta: Meta<typeof SessionSection> = {
  title: 'Cockpit/Session/SessionSection',
  component: SessionSection,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider theme={lightTheme}>
        <div style={{ width: 340, padding: 16 }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SessionSection>;

/** Default state with a running session and full data. */
export const Default: Story = {
  args: {
    overview: overviewData,
    info: infoData,
  },
};

/** Session in idle state. */
export const IdleStatus: Story = {
  args: {
    overview: { ...overviewData, status: 'idle' },
    info: infoData,
  },
};

/** Session with no title — should display "Untitled". */
export const NoTitle: Story = {
  args: {
    overview: { ...overviewData, title: undefined },
    info: infoData,
  },
};

/** Minimal data — only required fields provided. */
export const Minimal: Story = {
  args: {
    overview: {
      agentName: 'test-agent',
      model: 'gpt-4',
      stepCount: 0,
      messageCount: 1,
      status: 'idle',
      createdAt: '2026-06-05T10:00:00Z',
      updatedAt: '2026-06-05T10:00:00Z',
    },
    info: {
      sessionId: '123-abc',
      agentName: 'test-agent',
      model: 'gpt-4',
      workspacePath: '/tmp',
      skillDirs: [],
      mcpConfigPaths: [],
    },
  },
};

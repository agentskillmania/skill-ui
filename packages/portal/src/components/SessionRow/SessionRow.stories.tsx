import type { Meta, StoryObj } from '@storybook/react-vite';
import { SessionRow } from './SessionRow.js';

const meta: Meta<typeof SessionRow> = {
  title: 'Portal/SessionRow',
  component: SessionRow,
};

export default meta;

type Story = StoryObj<typeof SessionRow>;

const baseSession = {
  id: 'sess-1',
  agentId: 'agent-1',
  agentName: 'Code Reviewer',
  workspacePath: '/Users/demo/project-a',
  lastActive: '2h ago',
  tokenCount: 12400,
};

export const Default: Story = {
  args: {
    session: baseSession,
    onResume: () => {},
    onDelete: () => {},
  },
};

export const WithFork: Story = {
  args: {
    session: baseSession,
    onResume: () => {},
    onDelete: () => {},
    onFork: () => {},
  },
};

export const LongPath: Story = {
  args: {
    session: {
      ...baseSession,
      workspacePath: '/very/long/path/to/the/workspace/that/might/overflow',
    },
    onResume: () => {},
    onDelete: () => {},
  },
};

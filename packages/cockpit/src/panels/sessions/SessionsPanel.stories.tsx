import type { Meta, StoryObj } from '@storybook/react-vite';
import { SessionsPanel } from './SessionsPanel.js';
import type { SessionInfo } from '../../types.js';

const mockSessions: SessionInfo[] = [
  { id: '1', name: 'debug-session-7', model: 'Claude', status: 'running', stepCount: 3, tokenCount: 9500 },
  { id: '2', name: 'code-review-3', model: 'GPT-4', status: 'paused', stepCount: 12, tokenCount: 23000 },
  { id: '3', name: 'data-pipeline', model: 'Claude', status: 'idle', stepCount: 0, tokenCount: 0 },
];

const meta: Meta<typeof SessionsPanel> = {
  title: 'Cockpit/Panels/SessionsPanel',
  component: SessionsPanel,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '400px', width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SessionsPanel>;

export const WithSessions: Story = {
  args: {
    sessions: mockSessions,
    activeId: '1',
  },
};

export const Empty: Story = {
  args: {
    sessions: [],
  },
};

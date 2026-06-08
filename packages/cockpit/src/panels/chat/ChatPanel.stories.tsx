import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChatPanel } from './ChatPanel.js';
import type { Message } from '@agentskillmania/skill-ui-chat';

const mockMessages: Message[] = [
  { id: '1', role: 'user', content: 'Help me debug the test failure', status: 'completed' },
  { id: '2', role: 'assistant', content: 'I see the issue. The test expects antd Progress.', status: 'completed' },
  { id: '3', role: 'user', content: 'Can you fix it?', status: 'completed' },
];

const meta: Meta<typeof ChatPanel> = {
  title: 'Cockpit/Panels/ChatPanel',
  component: ChatPanel,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '500px', width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChatPanel>;

export const Default: Story = {
  args: {
    messages: mockMessages,
    status: 'streaming',
  },
};

export const Empty: Story = {
  args: {
    messages: [],
    status: 'idle',
  },
};

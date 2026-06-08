import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentCard } from './AgentCard.js';

const meta: Meta<typeof AgentCard> = {
  title: 'Portal/AgentCard',
  component: AgentCard,
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof AgentCard>;

const baseAgent = {
  id: 'agent-1',
  name: 'Code Reviewer',
  description: 'Automatically reviews pull requests and suggests improvements.',
  source: 'custom' as const,
  skillCount: 3,
};

export const Default: Story = {
  args: {
    agent: baseAgent,
    onChat: () => {},
    onEdit: () => {},
    onDelete: () => {},
  },
};

export const Builtin: Story = {
  args: {
    agent: { ...baseAgent, source: 'builtin' as const, name: 'Translator' },
    onChat: () => {},
    onEdit: () => {},
    onDelete: () => {},
  },
};

export const LongDescription: Story = {
  args: {
    agent: {
      ...baseAgent,
      description:
        'This is a very long description that should wrap across multiple lines to demonstrate how the card handles overflow gracefully.',
    },
    onChat: () => {},
    onEdit: () => {},
    onDelete: () => {},
  },
};

export const Ellipsis: Story = {
  args: {
    agent: {
      ...baseAgent,
      name: 'Super Long Agent Name That Will Definitely Overflow The Card Width',
      description:
        'This is an extremely long description that will definitely exceed the available width and trigger the ellipsis overflow behavior with a tooltip on hover.',
    },
    onChat: () => {},
    onEdit: () => {},
    onDelete: () => {},
  },
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResourceAvatar } from './ResourceAvatar.js';

const meta: Meta<typeof ResourceAvatar> = {
  title: 'Portal/ResourceAvatar',
  component: ResourceAvatar,
};

export default meta;

type Story = StoryObj<typeof ResourceAvatar>;

export const Default: Story = {
  args: {
    id: 'agent-1',
    name: 'Code Reviewer',
  },
};

export const Small: Story = {
  args: {
    id: 'skill-1',
    name: 'Web Search',
    size: 28,
  },
};

export const Large: Story = {
  args: {
    id: 'agent-2',
    name: 'Translator',
    size: 48,
  },
};

export const DifferentSeed: Story = {
  args: {
    id: 'zzz-999',
    name: 'ZZZ Agent',
    size: 40,
  },
};

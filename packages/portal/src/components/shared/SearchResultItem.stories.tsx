import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchResultItem } from './SearchResultItem.js';

const meta: Meta<typeof SearchResultItem> = {
  title: 'Portal/SearchResultItem',
  component: SearchResultItem,
};

export default meta;

type Story = StoryObj<typeof SearchResultItem>;

export const SkillResult: Story = {
  args: {
    item: {
      type: 'skill',
      id: 'skill-1',
      title: 'Web Search',
      subtitle: 'Search the web for real-time information',
    },
    query: 'web',
  },
};

export const AgentResult: Story = {
  args: {
    item: {
      type: 'agent',
      id: 'agent-1',
      title: 'Code Reviewer',
      subtitle: 'Reviews pull requests',
    },
    query: 'code',
  },
};

export const SessionResult: Story = {
  args: {
    item: {
      type: 'session',
      id: 'sess-1',
      title: 'Code Reviewer',
      subtitle: '/Users/demo/project-a',
    },
    query: '',
  },
};

export const NoSubtitle: Story = {
  args: {
    item: {
      type: 'skill',
      id: 'skill-2',
      title: 'File Reader',
    },
    query: 'file',
  },
};

export const WithEditButton: Story = {
  args: {
    item: {
      type: 'agent',
      id: 'agent-1',
      title: 'Code Reviewer',
      subtitle: 'Reviews pull requests',
    },
    query: 'code',
    onEdit: () => {},
  },
};

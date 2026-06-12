import type { Meta, StoryObj } from '@storybook/react-vite';
import { PortalHeader } from './PortalHeader.js';

const meta: Meta<typeof PortalHeader> = {
  title: 'Portal/PortalHeader',
  component: PortalHeader,
};

export default meta;

type Story = StoryObj<typeof PortalHeader>;

export const Default: Story = {
  args: {
    results: { agents: [], skills: [], sessions: [] },
    query: '',
    onQueryChange: () => {},
    onSearch: () => {},
    onSelect: () => {},
    onEdit: () => {},
    githubUrl: 'https://github.com/agentskillmania',
  },
};

export const WithResults: Story = {
  args: {
    results: {
      skills: [
        { type: 'skill', id: 's1', title: 'Web Search', subtitle: 'Search the web' },
        { type: 'skill', id: 's2', title: 'Web Scraping', subtitle: 'Extract data from pages' },
      ],
      agents: [
        { type: 'agent', id: 'a1', title: 'Web Dev Agent', subtitle: 'Frontend specialist' },
      ],
      sessions: [],
    },
    query: 'web',
    onQueryChange: () => {},
    onSearch: () => {},
    onSelect: () => {},
    onEdit: () => {},
  },
};

export const ManyResults: Story = {
  args: {
    query: 'skill',
    onQueryChange: () => {},
    results: {
      skills: Array.from({ length: 5 }, (_, i) => ({
        type: 'skill' as const,
        id: `s${i}`,
        title: `Skill ${i + 1}`,
        subtitle: `Description ${i + 1}`,
      })),
      agents: Array.from({ length: 5 }, (_, i) => ({
        type: 'agent' as const,
        id: `a${i}`,
        title: `Agent ${i + 1}`,
        subtitle: `Description ${i + 1}`,
      })),
      sessions: Array.from({ length: 3 }, (_, i) => ({
        type: 'session' as const,
        id: `se${i}`,
        title: `Session ${i + 1}`,
        subtitle: `/tmp/workspace-${i}`,
      })),
    },
    onSearch: () => {},
    onSelect: () => {},
    onEdit: () => {},
  },
};

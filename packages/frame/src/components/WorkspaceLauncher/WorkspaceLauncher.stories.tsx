/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react';
import { FolderOpen, Bot } from 'lucide-react';
import { WorkspaceLauncher } from './WorkspaceLauncher.js';

const sampleWorkspaces = [
  {
    id: '1',
    name: 'my-agent',
    description: 'A multi-agent swarm project',
    lastOpened: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'hello-skill',
    description: 'First skill project',
    lastOpened: new Date(Date.now() - 86400_000).toISOString(),
  },
  {
    id: '3',
    name: 'data-pipeline',
    lastOpened: new Date(Date.now() - 7 * 86400_000).toISOString(),
  },
  {
    id: '4',
    name: 'legacy-bot',
    description: 'Old project',
    lastOpened: new Date(Date.now() - 365 * 86400_000).toISOString(),
  },
];

/** Automatically shows search box when there are more than 5 workspaces */
const manyWorkspaces = Array.from({ length: 8 }, (_, i) => ({
  id: `ws-${i + 1}`,
  name: `workspace-${i + 1}`,
  description: `第 ${i + 1} 个项目`,
  lastOpened: new Date(Date.now() - i * 86400_000).toISOString(),
}));

/** Workspaces with icons */
const iconWorkspaces = [
  { id: 'bot', name: 'my-agent', icon: <Bot size={16} />, lastOpened: new Date().toISOString() },
  {
    id: 'folder',
    name: 'data-files',
    icon: <FolderOpen size={16} />,
    lastOpened: new Date(Date.now() - 3600_000).toISOString(),
  },
];

const meta: Meta<typeof WorkspaceLauncher> = {
  title: 'Frame/WorkspaceLauncher',
  component: WorkspaceLauncher,
  argTypes: {
    onSelect: { action: 'select' },
    onCreate: { action: 'create' },
    layoutMode: { control: 'radio', options: ['list', 'mondrian'] },
  },
};

export default meta;
type Story = StoryObj<typeof WorkspaceLauncher>;

export const Default: Story = {
  args: { workspaces: sampleWorkspaces },
};

export const WithIcons: Story = {
  args: { workspaces: iconWorkspaces },
};

export const Empty: Story = {
  args: { workspaces: [] },
};

export const ManyWorkspaces: Story = {
  args: { workspaces: manyWorkspaces, onCreate: () => {} },
};

export const Mondrian: Story = {
  args: { workspaces: manyWorkspaces, layoutMode: 'mondrian', onCreate: () => {} },
};

export const MondrianFew: Story = {
  args: { workspaces: sampleWorkspaces, layoutMode: 'mondrian' },
};

export const MondrianWithIcons: Story = {
  args: {
    workspaces: [...iconWorkspaces, ...manyWorkspaces.slice(2, 8)],
    layoutMode: 'mondrian',
  },
};

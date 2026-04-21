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

const meta: Meta<typeof WorkspaceLauncher> = {
  title: 'Frame/WorkspaceLauncher',
  component: WorkspaceLauncher,
  argTypes: {
    onSelect: { action: 'select' },
    onCreate: { action: 'create' },
  },
};

export default meta;
type Story = StoryObj<typeof WorkspaceLauncher>;

export const Default: Story = {
  args: { workspaces: sampleWorkspaces },
};

export const WithIcons: Story = {
  args: {
    workspaces: [
      { id: '1', name: 'my-agent', icon: <Bot size={16} />, lastOpened: new Date().toISOString() },
      {
        id: '2',
        name: 'data-files',
        icon: <FolderOpen size={16} />,
        lastOpened: new Date(Date.now() - 3600_000).toISOString(),
      },
    ],
  },
};

export const Empty: Story = {
  args: { workspaces: [] },
};

export const WithoutCreate: Story = {
  args: { workspaces: sampleWorkspaces },
  // onCreate 不传，不显示新建按钮
};

/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react';
import { Settings, User, Zap } from 'lucide-react';
import { AppFrame } from './AppFrame.js';
import { WorkspaceLauncher } from '../WorkspaceLauncher/index.js';

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
];

const meta: Meta<typeof AppFrame> = {
  title: 'Frame/AppFrame',
  component: AppFrame,
  argTypes: {
    title: { control: 'text' },
    isMaximized: { control: 'boolean' },
    onClose: { action: 'close' },
    onMinimize: { action: 'minimize' },
    onMaximize: { action: 'maximize' },
  },
};

export default meta;
type Story = StoryObj<typeof AppFrame>;

export const EmptyPortal: Story = {
  args: {
    title: 'Agent IDE',
    icon: <Zap size={16} />,
    children: <div style={{ padding: 24 }}>Empty content area</div>,
  },
};

export const WithWorkspaceLauncher: Story = {
  args: {
    title: 'Agent IDE',
    icon: <Zap size={16} />,
    titlebarEnd: (
      <div style={{ display: 'flex', gap: 8 }}>
        <Settings size={16} style={{ cursor: 'pointer' }} />
        <User size={16} style={{ cursor: 'pointer' }} />
      </div>
    ),
    children: (
      <WorkspaceLauncher
        workspaces={sampleWorkspaces}
        onSelect={(id) => console.log('select', id)}
        onCreate={() => console.log('create')}
      />
    ),
  },
};

export const WithCenterAndEnd: Story = {
  args: {
    title: 'Agent IDE',
    icon: <Zap size={16} />,
    titlebarCenter: <span style={{ fontSize: 13, color: '#94a3b8' }}>my-agent</span>,
    titlebarEnd: (
      <div style={{ display: 'flex', gap: 8 }}>
        <Settings size={16} style={{ cursor: 'pointer' }} />
      </div>
    ),
    children: <div style={{ padding: 24 }}>Editor content here</div>,
  },
};

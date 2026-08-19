/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Settings, Zap } from 'lucide-react';
import { AppFrame } from './AppFrame.js';

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

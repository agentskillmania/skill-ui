/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react';
import { Settings, User, Zap } from 'lucide-react';
import { Titlebar } from './Titlebar.js';

const meta: Meta<typeof Titlebar> = {
  title: 'Frame/Titlebar',
  component: Titlebar,
  argTypes: {
    title: { control: 'text' },
    isMaximized: { control: 'boolean' },
    onClose: { action: 'close' },
    onMinimize: { action: 'minimize' },
    onMaximize: { action: 'maximize' },
  },
};

export default meta;
type Story = StoryObj<typeof Titlebar>;

export const Default: Story = {};

export const WithBrand: Story = {
  args: { title: 'Agent IDE', icon: <Zap size={16} /> },
};

export const WithCenterSlot: Story = {
  args: {
    title: 'Agent IDE',
    center: <span style={{ fontSize: 13, color: '#94a3b8' }}>workspace-1</span>,
  },
};

export const WithEndSlot: Story = {
  args: {
    title: 'Agent IDE',
    end: (
      <div style={{ display: 'flex', gap: 8 }}>
        <Settings size={16} style={{ cursor: 'pointer' }} />
        <User size={16} style={{ cursor: 'pointer' }} />
      </div>
    ),
  },
};

export const Full: Story = {
  args: {
    title: 'Agent IDE',
    icon: <Zap size={16} />,
    center: <span style={{ fontSize: 13, color: '#94a3b8' }}>workspace-1</span>,
    end: (
      <div style={{ display: 'flex', gap: 8 }}>
        <Settings size={16} style={{ cursor: 'pointer' }} />
        <User size={16} style={{ cursor: 'pointer' }} />
      </div>
    ),
  },
};

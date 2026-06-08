import type { Meta, StoryObj } from '@storybook/react-vite';
import { SidebarPanel } from './SidebarPanel.js';
import { ClipboardList } from 'lucide-react';

const meta: Meta<typeof SidebarPanel> = {
  title: 'Cockpit/SidebarPanel',
  component: SidebarPanel,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '300px', width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SidebarPanel>;

export const Default: Story = {
  args: {
    title: 'Event Log',
    icon: ClipboardList,
    children: <div style={{ padding: 12 }}>Panel content goes here</div>,
  },
};

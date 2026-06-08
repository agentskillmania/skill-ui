import type { Meta, StoryObj } from '@storybook/react-vite';
import { SidebarIcons } from './SidebarIcons.js';

const meta: Meta<typeof SidebarIcons> = {
  title: 'Cockpit/SidebarIcons',
  component: SidebarIcons,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SidebarIcons>;

export const Expanded: Story = {
  args: {
    activeId: 'event-log',
    isCollapsed: false,
    onToggleCollapse: () => {},
    onSwitchPanel: () => {},
  },
};

export const Collapsed: Story = {
  args: {
    activeId: 'event-log',
    isCollapsed: true,
    onToggleCollapse: () => {},
    onSwitchPanel: () => {},
  },
};

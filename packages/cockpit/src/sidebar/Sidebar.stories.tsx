import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sidebar } from './index.js';
import { EventLogPanel } from '../panels/event-log/EventLogPanel.js';
import type { CockpitEvent } from '../panels/event-log/types.js';

const mockEvents: CockpitEvent[] = [
  { id: '1', timestamp: 1000, type: 'lifecycle', subtype: 'start', label: 'Agent started' },
  { id: '2', timestamp: 2500, type: 'tool', subtype: 'execute', label: 'Executed ReadFile' },
  { id: '3', timestamp: 4000, type: 'thinking', subtype: 'reasoning', label: 'Analyzing test output' },
];

const meta: Meta<typeof Sidebar> = {
  title: 'Cockpit/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '500px', display: 'flex', justifyContent: 'flex-end' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Expanded: Story = {
  args: {
    width: 320,
    isCollapsed: false,
    activePanel: 'event-log',
    onToggleCollapse: () => {},
    onSwitchPanel: () => {},
    children: <EventLogPanel events={mockEvents} />,
  },
};

export const Collapsed: Story = {
  args: {
    width: 42,
    isCollapsed: true,
    activePanel: 'event-log',
    onToggleCollapse: () => {},
    onSwitchPanel: () => {},
    children: null,
  },
};

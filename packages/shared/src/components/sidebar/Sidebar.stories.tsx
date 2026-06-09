/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { css, useTheme } from '@emotion/react';
import { useState } from 'react';
import { Activity, Terminal, Wrench, FileText } from 'lucide-react';
import { Sidebar } from './Sidebar.js';
import { SidebarPanel } from './SidebarPanel.js';
import type { SidebarProps } from './Sidebar.js';
import type { SidebarIconItem } from './SidebarIcons.js';
import { SplitDivider } from '../SplitDivider.js';

const meta: Meta<typeof Sidebar> = {
  title: 'Shared/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  argTypes: {
    items: { control: false },
    onToggleCollapse: { control: false },
    onSwitchPanel: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ height: '500px', display: 'flex', justifyContent: 'flex-end' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<SidebarProps>;

const sidebarItems: SidebarIconItem[] = [
  { id: 'event-log', icon: Activity, label: 'Event Log' },
  { id: 'terminal', icon: Terminal, label: 'Terminal' },
  { id: 'skills', icon: Wrench, label: 'Skills' },
  { id: 'files', icon: FileText, label: 'Files' },
];

/** Mock event log rows for panel content. */
function MockEventLogContent() {
  const theme = useTheme();
  const events = [
    { id: '1', label: 'Agent started', time: '10:01:23', status: 'ok' },
    { id: '2', label: 'Executed ReadFile', time: '10:01:25', status: 'ok' },
    { id: '3', label: 'Retry attempt 2/3', time: '10:01:30', status: 'warn' },
    { id: '4', label: 'Tool execution failed', time: '10:01:35', status: 'error' },
    { id: '5', label: 'Session completed', time: '10:02:01', status: 'ok' },
  ];

  return (
    <div>
      {events.map((event) => (
        <div
          key={event.id}
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[2]};
            padding: ${theme.spacing[1]} ${theme.spacing[3]};
            font-size: ${theme.font.size.xs};
          `}
        >
          <span
            css={css`
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: ${event.status === 'ok'
                ? theme.color.success
                : event.status === 'warn'
                  ? theme.color.warning
                  : theme.color.error
              };
              flex-shrink: 0;
            `}
          />
          <span css={css`flex: 1; color: ${theme.color.text};`}>{event.label}</span>
          <span css={css`color: ${theme.color.textTertiary};`}>{event.time}</span>
        </div>
      ))}
    </div>
  );
}

/** Fully expanded sidebar with panel content and icon bar. */
export const Expanded: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activePanel, setActivePanel] = useState('event-log');

    return (
      <Sidebar
        width={320}
        isCollapsed={false}
        activePanel={activePanel}
        items={sidebarItems}
        onToggleCollapse={() => {}}
        onSwitchPanel={(id) => setActivePanel(id)}
      >
        <SidebarPanel title="Event Log" icon={Activity}>
          <MockEventLogContent />
        </SidebarPanel>
      </Sidebar>
    );
  },
};

/** Collapsed sidebar — only icon bar visible, panel content hidden. */
export const Collapsed: Story = {
  render: () => (
    <Sidebar
      width={320}
      isCollapsed
      activePanel="event-log"
      items={sidebarItems}
      onToggleCollapse={() => {}}
      onSwitchPanel={() => {}}
    >
      <SidebarPanel title="Event Log" icon={Activity}>
        <MockEventLogContent />
      </SidebarPanel>
    </Sidebar>
  ),
};

/** Fully interactive sidebar with collapse toggle, panel switching, and a split layout. */
export const Interactive: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activePanel, setActivePanel] = useState('event-log');
    const [sidebarWidth, setSidebarWidth] = useState(380);
    const theme = useTheme();

    return (
      <div
        css={css`
          height: 500px;
          display: flex;
          border: 1px solid ${theme.color.border};
          border-radius: ${theme.radius.md};
          overflow: hidden;
        `}
      >
        {/* Left content area */}
        <div
          css={css`
            flex: 1;
            background: ${theme.color.fillSecondary};
            padding: ${theme.spacing[4]};
            display: flex;
            flex-direction: column;
            gap: ${theme.spacing[2]};
          `}
        >
          <span css={css`font-size: ${theme.font.size.base}; font-weight: ${theme.font.weight.semibold};`}>
            Main Content
          </span>
          <span css={css`font-size: ${theme.font.size.sm}; color: ${theme.color.textSecondary};`}>
            Use the divider to resize. Click icons to switch panels.
          </span>
          <span css={css`font-size: ${theme.font.size.xs}; color: ${theme.color.textTertiary};`}>
            Active panel: {activePanel} | Sidebar width: {sidebarWidth}px | Collapsed: {isCollapsed ? 'yes' : 'no'}
          </span>
        </div>

        <SplitDivider
          onResize={setSidebarWidth}
          disabled={isCollapsed}
        />

        <Sidebar
          width={sidebarWidth}
          isCollapsed={isCollapsed}
          activePanel={activePanel}
          items={sidebarItems}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
          onSwitchPanel={(id) => setActivePanel(id)}
        >
          <SidebarPanel title="Event Log" icon={Activity}>
            <MockEventLogContent />
          </SidebarPanel>
        </Sidebar>
      </div>
    );
  },
};

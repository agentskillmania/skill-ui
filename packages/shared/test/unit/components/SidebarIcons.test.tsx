import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarIcons } from '../../../src/components/sidebar/SidebarIcons.js';
import { ClipboardList, BarChart3 } from 'lucide-react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

describe('SidebarIcons', () => {
  const items = [
    { id: 'event-log', icon: ClipboardList, label: 'Event Log' },
    { id: 'board', icon: BarChart3, label: 'Session Board' },
  ];

  it('renders collapse button plus all icon items', () => {
    render(
      <SidebarIcons
        items={items}
        activeId="event-log"
        isCollapsed={false}
        onToggleCollapse={vi.fn()}
        onSwitchPanel={vi.fn()}
      />,
      { wrapper },
    );
    // 1 collapse button + 2 panel buttons = 3 total
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(3);
  });

  it('calls onToggleCollapse when collapse button clicked', () => {
    const onToggleCollapse = vi.fn();
    render(
      <SidebarIcons
        items={items}
        activeId="event-log"
        isCollapsed={false}
        onToggleCollapse={onToggleCollapse}
        onSwitchPanel={vi.fn()}
      />,
      { wrapper },
    );
    // First button is the collapse toggle
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(onToggleCollapse).toHaveBeenCalledOnce();
  });

  it('calls onSwitchPanel with correct id when panel icon clicked', () => {
    const onSwitchPanel = vi.fn();
    render(
      <SidebarIcons
        items={items}
        activeId="event-log"
        isCollapsed={false}
        onToggleCollapse={vi.fn()}
        onSwitchPanel={onSwitchPanel}
      />,
      { wrapper },
    );
    // Second button is the first panel item (event-log)
    fireEvent.click(screen.getAllByRole('button')[1]);
    expect(onSwitchPanel).toHaveBeenCalledWith('event-log');
  });

  it('calls onSwitchPanel for second panel item', () => {
    const onSwitchPanel = vi.fn();
    render(
      <SidebarIcons
        items={items}
        activeId="event-log"
        isCollapsed={false}
        onToggleCollapse={vi.fn()}
        onSwitchPanel={onSwitchPanel}
      />,
      { wrapper },
    );
    // Third button is the second panel item (board)
    fireEvent.click(screen.getAllByRole('button')[2]);
    expect(onSwitchPanel).toHaveBeenCalledWith('board');
  });

  it('renders with empty items array', () => {
    render(
      <SidebarIcons
        items={[]}
        activeId=""
        isCollapsed={true}
        onToggleCollapse={vi.fn()}
        onSwitchPanel={vi.fn()}
      />,
      { wrapper },
    );
    // Only the collapse button should be present
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(1);
  });

  it('renders SVG icons in each button', () => {
    const { container } = render(
      <SidebarIcons
        items={items}
        activeId="event-log"
        isCollapsed={false}
        onToggleCollapse={vi.fn()}
        onSwitchPanel={vi.fn()}
      />,
      { wrapper },
    );
    // 1 collapse icon + 2 panel icons = 3 SVGs
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(3);
  });
});

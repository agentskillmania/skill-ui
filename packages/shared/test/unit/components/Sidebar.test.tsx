import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '../../../src/components/sidebar/Sidebar.js';
import { ClipboardList, BarChart3 } from 'lucide-react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

describe('Sidebar', () => {
  const items = [
    { id: 'event-log', icon: ClipboardList, label: 'Event Log' },
    { id: 'board', icon: BarChart3, label: 'Session Board' },
  ];

  it('renders children when expanded', () => {
    render(
      <Sidebar
        width={380}
        isCollapsed={false}
        activePanel="event-log"
        items={items}
        onToggleCollapse={vi.fn()}
        onSwitchPanel={vi.fn()}
      >
        <span>Panel Content</span>
      </Sidebar>,
      { wrapper },
    );
    expect(screen.getByText('Panel Content')).toBeInTheDocument();
  });

  it('renders children (hidden) when collapsed', () => {
    render(
      <Sidebar
        width={42}
        isCollapsed={true}
        activePanel="event-log"
        items={items}
        onToggleCollapse={vi.fn()}
        onSwitchPanel={vi.fn()}
      >
        <span>Hidden Content</span>
      </Sidebar>,
      { wrapper },
    );
    // Content is rendered in DOM but hidden via opacity/pointer-events
    expect(screen.queryByText('Hidden Content')).toBeInTheDocument();
  });

  it('applies correct width when expanded', () => {
    const { container } = render(
      <Sidebar
        width={380}
        isCollapsed={false}
        activePanel="event-log"
        onToggleCollapse={vi.fn()}
        onSwitchPanel={vi.fn()}
      >
        <span>Content</span>
      </Sidebar>,
      { wrapper },
    );
    const sidebar = container.firstChild as HTMLElement;
    expect(sidebar).toHaveStyle({ width: '380px' });
  });

  it('applies collapsed width when collapsed', () => {
    const { container } = render(
      <Sidebar
        width={380}
        isCollapsed={true}
        activePanel="event-log"
        onToggleCollapse={vi.fn()}
        onSwitchPanel={vi.fn()}
      >
        <span>Content</span>
      </Sidebar>,
      { wrapper },
    );
    const sidebar = container.firstChild as HTMLElement;
    expect(sidebar).toHaveStyle({ width: '42px' });
  });

  it('adds collapsed class when collapsed', () => {
    const { container } = render(
      <Sidebar
        width={42}
        isCollapsed={true}
        activePanel="event-log"
        onToggleCollapse={vi.fn()}
        onSwitchPanel={vi.fn()}
      >
        <span>Content</span>
      </Sidebar>,
      { wrapper },
    );
    const sidebar = container.firstChild as HTMLElement;
    expect(sidebar.classList.contains('collapsed')).toBe(true);
  });

  it('does not add collapsed class when expanded', () => {
    const { container } = render(
      <Sidebar
        width={380}
        isCollapsed={false}
        activePanel="event-log"
        onToggleCollapse={vi.fn()}
        onSwitchPanel={vi.fn()}
      >
        <span>Content</span>
      </Sidebar>,
      { wrapper },
    );
    const sidebar = container.firstChild as HTMLElement;
    expect(sidebar.classList.contains('collapsed')).toBe(false);
  });

  it('renders icon bar with panel buttons', () => {
    render(
      <Sidebar
        width={380}
        isCollapsed={false}
        activePanel="event-log"
        items={items}
        onToggleCollapse={vi.fn()}
        onSwitchPanel={vi.fn()}
      >
        <span>Content</span>
      </Sidebar>,
      { wrapper },
    );
    // Collapse button + 2 panel buttons = 3
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(3);
  });

  it('renders without items prop (defaults to empty)', () => {
    render(
      <Sidebar
        width={380}
        isCollapsed={false}
        activePanel="event-log"
        onToggleCollapse={vi.fn()}
        onSwitchPanel={vi.fn()}
      >
        <span>Content</span>
      </Sidebar>,
      { wrapper },
    );
    // Only the collapse button, no panel items
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(1);
  });
});

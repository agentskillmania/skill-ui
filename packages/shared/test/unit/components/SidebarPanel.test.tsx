import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SidebarPanel } from '../../../src/components/sidebar/SidebarPanel.js';
import { ClipboardList } from 'lucide-react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

describe('SidebarPanel', () => {
  it('renders title as-is (CSS handles uppercase)', () => {
    render(
      <SidebarPanel title="Event Log" icon={ClipboardList}>
        <span>Panel Content</span>
      </SidebarPanel>,
      { wrapper },
    );
    expect(screen.getByText('Event Log')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <SidebarPanel title="Test" icon={ClipboardList}>
        <span>Panel Content</span>
      </SidebarPanel>,
      { wrapper },
    );
    expect(screen.getByText('Panel Content')).toBeInTheDocument();
  });

  it('renders the icon element', () => {
    const { container } = render(
      <SidebarPanel title="Test" icon={ClipboardList}>
        <div />
      </SidebarPanel>,
      { wrapper },
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has a scrollable body area with overflow auto', () => {
    render(
      <SidebarPanel title="Test" icon={ClipboardList}>
        <span>Content</span>
      </SidebarPanel>,
      { wrapper },
    );
    const contentArea = screen.getByText('Content').parentElement;
    expect(contentArea).toHaveStyle({ overflow: 'auto' });
  });

  it('uses height 100% on outer container', () => {
    const { container } = render(
      <SidebarPanel title="Test" icon={ClipboardList}>
        <div />
      </SidebarPanel>,
      { wrapper },
    );
    const outer = container.firstChild as HTMLElement;
    expect(outer).toHaveStyle({ height: '100%' });
  });
});

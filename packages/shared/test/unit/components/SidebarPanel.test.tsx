import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SidebarPanel } from '../../../src/components/sidebar/SidebarPanel.js';
import { ClipboardList } from 'lucide-react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

describe('SidebarPanel', () => {
  it('renders title in uppercase', () => {
    render(
      <SidebarPanel title="Event Log" icon={ClipboardList}>
        <span>Panel Content</span>
      </SidebarPanel>,
      { wrapper },
    );
    expect(screen.getByText('EVENT LOG')).toBeInTheDocument();
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
    // ClipboardList renders an SVG element
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has a scrollable body area', () => {
    render(
      <SidebarPanel title="Test" icon={ClipboardList}>
        <span>Content</span>
      </SidebarPanel>,
      { wrapper },
    );
    // The scrollable body is the second inner div (after the header)
    const contentArea = screen.getByText('Content').parentElement;
    expect(contentArea).toHaveStyle({ overflowY: 'auto' });
  });
});

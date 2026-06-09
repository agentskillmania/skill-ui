import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CollapsibleCard } from '../../../src/components/CollapsibleCard.js';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

describe('CollapsibleCard', () => {
  it('renders title', () => {
    render(<CollapsibleCard title="Session">Content</CollapsibleCard>, { wrapper });
    expect(screen.getByText('Session')).toBeInTheDocument();
  });

  it('shows children when expanded (default)', () => {
    render(<CollapsibleCard title="Card">Body Content</CollapsibleCard>, { wrapper });
    expect(screen.getByText('Body Content')).toBeInTheDocument();
  });

  it('hides children when defaultCollapsed=true', () => {
    render(
      <CollapsibleCard title="Card" defaultCollapsed>
        Hidden Content
      </CollapsibleCard>,
      { wrapper },
    );
    expect(screen.queryByText('Hidden Content')).toBeNull();
  });

  it('toggles on click in uncontrolled mode', () => {
    render(
      <CollapsibleCard title="Card" defaultCollapsed>
        Toggle Content
      </CollapsibleCard>,
      { wrapper },
    );
    expect(screen.queryByText('Toggle Content')).toBeNull();

    fireEvent.click(screen.getByTestId('collapse-toggle'));
    expect(screen.getByText('Toggle Content')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('collapse-toggle'));
    expect(screen.queryByText('Toggle Content')).toBeNull();
  });

  it('respects controlled collapsed prop', () => {
    const { rerender } = render(
      <CollapsibleCard title="Card" collapsed={true}>
        Controlled Content
      </CollapsibleCard>,
      { wrapper },
    );
    expect(screen.queryByText('Controlled Content')).toBeNull();

    rerender(
      <ThemeProvider theme={lightTheme}>
        <CollapsibleCard title="Card" collapsed={false}>
          Controlled Content
        </CollapsibleCard>
      </ThemeProvider>,
    );
    expect(screen.getByText('Controlled Content')).toBeInTheDocument();
  });

  it('calls onCollapseChange', () => {
    const onCollapseChange = vi.fn();
    render(
      <CollapsibleCard title="Card" defaultCollapsed onCollapseChange={onCollapseChange}>
        Content
      </CollapsibleCard>,
      { wrapper },
    );
    // defaultCollapsed=true, so first toggle flips to false (expanded)
    fireEvent.click(screen.getByTestId('collapse-toggle'));
    expect(onCollapseChange).toHaveBeenCalledWith(false);
  });

  it('renders badge', () => {
    render(
      <CollapsibleCard title="Card" badge={<span>Running</span>}>
        Content
      </CollapsibleCard>,
      { wrapper },
    );
    expect(screen.getByText('Running')).toBeInTheDocument();
  });
});

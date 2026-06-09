import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { SplitDivider } from '../../../src/components/SplitDivider.js';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

describe('SplitDivider', () => {
  it('renders a 4px wide divider', () => {
    const { container } = render(<SplitDivider onResize={vi.fn()} />, { wrapper });
    const divider = container.firstChild as HTMLElement;
    expect(divider).toHaveStyle({ width: '4px' });
  });

  it('shows col-resize cursor when enabled', () => {
    const { container } = render(<SplitDivider onResize={vi.fn()} />, { wrapper });
    const divider = container.firstChild as HTMLElement;
    expect(divider).toHaveStyle({ cursor: 'col-resize' });
  });

  it('shows default cursor when disabled', () => {
    const { container } = render(<SplitDivider onResize={vi.fn()} disabled />, { wrapper });
    const divider = container.firstChild as HTMLElement;
    expect(divider).toHaveStyle({ cursor: 'default' });
  });

  it('renders without crash when onResize provided', () => {
    const onResize = vi.fn();
    const { container } = render(<SplitDivider onResize={onResize} />, { wrapper });
    expect(container.firstChild).toBeInTheDocument();
  });
});

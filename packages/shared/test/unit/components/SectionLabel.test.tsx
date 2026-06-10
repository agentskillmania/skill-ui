import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { SectionLabel } from '../../../src/components/SectionLabel.js';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

describe('SectionLabel', () => {
  it('renders children as text', () => {
    render(<SectionLabel>Stack</SectionLabel>, { wrapper });
    expect(screen.getByText('Stack')).toBeInTheDocument();
  });

  it('applies uppercase text-transform via CSS', () => {
    const { container } = render(<SectionLabel>Label</SectionLabel>, { wrapper });
    expect(container.firstChild).toHaveStyle({ textTransform: 'uppercase' });
  });

  it('applies secondary color', () => {
    const { container } = render(<SectionLabel>Label</SectionLabel>, { wrapper });
    expect(container.firstChild).toHaveStyle({ color: lightTheme.color.textSecondary });
  });
});

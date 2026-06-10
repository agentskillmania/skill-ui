import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { StatusDot } from '../../../src/components/StatusDot.js';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

describe('StatusDot', () => {
  it('renders a 5px circle with success color when enabled', () => {
    const { container } = render(<StatusDot enabled />, { wrapper });
    const dot = container.firstChild as HTMLElement;
    expect(dot).toHaveStyle({ width: '5px' });
    expect(dot).toHaveStyle({ height: '5px' });
    expect(dot).toHaveStyle({ background: lightTheme.color.success });
  });

  it('renders with muted color when disabled', () => {
    const { container } = render(<StatusDot enabled={false} />, { wrapper });
    const dot = container.firstChild as HTMLElement;
    expect(dot).toHaveStyle({ background: lightTheme.color.textQuaternary });
  });

  it('defaults to enabled', () => {
    const { container } = render(<StatusDot />, { wrapper });
    const dot = container.firstChild as HTMLElement;
    expect(dot).toHaveStyle({ background: lightTheme.color.success });
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { CopyValue } from '../../../src/components/CopyValue.js';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

describe('CopyValue', () => {
  it('renders children text', () => {
    render(<CopyValue text="copy-me">copy-me</CopyValue>, { wrapper });
    expect(screen.getByText('copy-me')).toBeInTheDocument();
  });

  it('calls clipboard.writeText on click', { timeout: 30000 }, async () => {
    const writeSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeSpy },
      writable: true,
      configurable: true,
    });

    render(<CopyValue text="copy-me">copy-me</CopyValue>, { wrapper });
    await userEvent.click(screen.getByText('copy-me'));
    expect(writeSpy).toHaveBeenCalledWith('copy-me');
  });

  it('has pointer cursor', () => {
    const { container } = render(<CopyValue text="x">x</CopyValue>, { wrapper });
    const span = container.querySelector('span');
    expect(span).toHaveStyle({ cursor: 'pointer' });
  });
});

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { TypingIndicator } from '../../src/messages/TypingIndicator.js';

function Wrap({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

describe('TypingIndicator', () => {
  it('renders three dots with status role', () => {
    const { container } = render(<Wrap><TypingIndicator /></Wrap>);
    const status = container.querySelector('[role="status"]');
    expect(status).toBeTruthy();
    const dots = status?.querySelectorAll('span');
    expect(dots?.length).toBe(3);
  });

  it('has aria-label for accessibility', () => {
    const { container } = render(<Wrap><TypingIndicator /></Wrap>);
    const labeled = container.querySelector('[aria-label="AI is typing"]');
    expect(labeled).toBeTruthy();
  });
});

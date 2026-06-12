/** @jsxImportSource @emotion/react */
/**
 * ChatPanel tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@agentskillmania/skill-ui-theme';
import { ChatPanel } from '../../../../src/panels/chat/ChatPanel.js';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe('ChatPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<ChatPanel messages={[]} />, { wrapper });
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders a header with buttons', () => {
    const { container } = render(<ChatPanel messages={[]} />, { wrapper });
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });
});

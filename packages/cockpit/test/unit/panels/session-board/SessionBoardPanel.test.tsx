/** @jsxImportSource @emotion/react */
/**
 * SessionBoardPanel tests
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@agentskillmania/skill-ui-theme';
import { SessionBoardPanel } from '../../../../src/panels/session-board/SessionBoardPanel.js';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe('SessionBoardPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<SessionBoardPanel />, { wrapper });
    expect(container.firstChild).toBeInTheDocument();
  });
});

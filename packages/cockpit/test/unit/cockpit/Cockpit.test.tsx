/** @jsxImportSource @emotion/react */
/**
 * Cockpit component tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@agentskillmania/skill-ui-theme';
import { Cockpit } from '../../../src/cockpit/index.js';
import type { CockpitProps } from '../../../src/types.js';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

const defaultProps: CockpitProps = {
  chatMessages: [],
  eventLogEvents: [],
};

describe('Cockpit', () => {
  it('renders chat panel area', () => {
    const { container } = render(<Cockpit {...defaultProps} />, { wrapper });
    // ChatPanel renders with i18n title
    expect(container.textContent).toContain('聊天');
    // Root element exists
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders sidebar with buttons', () => {
    const { container } = render(<Cockpit {...defaultProps} />, { wrapper });
    // Should have at least 4 buttons: collapse-toggle, sessions, event-log, session-board
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });

  it('renders event log panel by default (shows empty state)', () => {
    const { container } = render(<Cockpit {...defaultProps} />, { wrapper });
    // Event log empty state in the DOM
    expect(container.textContent).toContain('暂无事件');
  });

  it('renders sessions panel content in DOM when switched', () => {
    const { container } = render(
      <Cockpit
        {...defaultProps}
        sessionsSessions={[]}
      />,
      { wrapper }
    );
    const buttons = container.querySelectorAll('button');
    // buttons: [0=ChatPanel+, 1=collapse, 2=sessions, 3=event-log, 4=session-board]
    expect(buttons.length).toBeGreaterThanOrEqual(5);
    fireEvent.click(buttons[2]);
    // After switching, sessions panel content should be in DOM
    expect(container.textContent).toContain('暂无会话');
  });

  it('renders session board panel content in DOM when switched', () => {
    const { container } = render(<Cockpit {...defaultProps} />, { wrapper });
    const buttons = container.querySelectorAll('button');
    // There are 5 buttons: ChatPanel "+" + sidebar collapse/sessions/event-log/session-board
    // Index 4 (0-based) = session-board button
    expect(buttons.length).toBeGreaterThanOrEqual(5);
    fireEvent.click(buttons[4]);
    // Session board content should be in DOM
    expect(container.textContent).toContain('会话看板');
  });

  it('renders with custom class name', () => {
    const { container } = render(<Cockpit {...defaultProps} className="my-cockpit" />, { wrapper });
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('my-cockpit');
  });
});

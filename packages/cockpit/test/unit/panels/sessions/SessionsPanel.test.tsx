/** @jsxImportSource @emotion/react */
/**
 * SessionsPanel tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@agentskillmania/skill-ui-theme';
import { SessionsPanel } from '../../../../src/panels/sessions/SessionsPanel.js';
import type { SessionInfo } from '../../../../src/panels/sessions/types.js';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

const mockSessions: SessionInfo[] = [
  { id: 's1', agentName: 'Agent A', model: 'gpt-4o', updatedAt: new Date().toISOString() },
  { id: 's2', agentName: 'Agent B', model: 'claude-4', updatedAt: new Date(Date.now() - 3600000).toISOString() },
];

describe('SessionsPanel', () => {
  it('renders empty state when sessions is empty', () => {
    render(<SessionsPanel sessions={[]} />, { wrapper });
    expect(screen.getByText('暂无会话')).toBeInTheDocument();
  });

  it('renders session list', () => {
    render(<SessionsPanel sessions={mockSessions} />, { wrapper });
    expect(screen.getByText('Agent A')).toBeInTheDocument();
    expect(screen.getByText('Agent B')).toBeInTheDocument();
  });

  it('calls onSelect when a session is clicked', () => {
    const onSelect = vi.fn();
    render(<SessionsPanel sessions={mockSessions} onSelect={onSelect} />, { wrapper });
    fireEvent.click(screen.getByText('Agent B'));
    expect(onSelect).toHaveBeenCalledWith('s2');
  });

  it('renders model info for each session', () => {
    render(<SessionsPanel sessions={mockSessions} />, { wrapper });
    expect(screen.getByText('gpt-4o')).toBeInTheDocument();
    expect(screen.getByText('claude-4')).toBeInTheDocument();
  });

  it('renders panel title', () => {
    render(<SessionsPanel sessions={mockSessions} />, { wrapper });
    expect(screen.getByText('会话')).toBeInTheDocument();
  });

  it('handles undefined sessions gracefully', () => {
    render(<SessionsPanel />, { wrapper });
    expect(screen.getByText('暂无会话')).toBeInTheDocument();
  });

  it('handles missing onSelect gracefully', () => {
    render(<SessionsPanel sessions={mockSessions} />, { wrapper });
    fireEvent.click(screen.getByText('Agent A'));
    // Should not throw
  });
});

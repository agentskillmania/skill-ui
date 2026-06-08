/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { ConfigProvider } from 'antd';
import { lightTheme, lightAntdConfig } from '@agentskillmania/skill-ui-theme';
import { SessionRow } from '../../src/components/SessionRow/SessionRow.js';

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={lightAntdConfig}>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </ConfigProvider>
  );
}

const mockSession = {
  id: 'sess-1',
  agentId: 'agent-1',
  agentName: 'Code Reviewer',
  workspacePath: '/tmp/review-42',
  lastActive: '2 hours ago',
  tokenCount: 1200,
};

describe('SessionRow', () => {
  it('renders session info', () => {
    render(<SessionRow session={mockSession} onResume={vi.fn()} onDelete={vi.fn()} />, { wrapper });
    expect(screen.getByText('Code Reviewer')).toBeInTheDocument();
    expect(screen.getByText('/tmp/review-42')).toBeInTheDocument();
  });

  it('calls onResume when row clicked', () => {
    const onResume = vi.fn();
    render(<SessionRow session={mockSession} onResume={onResume} onDelete={vi.fn()} />, {
      wrapper,
    });
    fireEvent.click(screen.getByText('Code Reviewer'));
    expect(onResume).toHaveBeenCalledTimes(1);
  });
});

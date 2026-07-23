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

  it('renders last active time and token count', () => {
    render(<SessionRow session={mockSession} onResume={vi.fn()} onDelete={vi.fn()} />, { wrapper });
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    expect(screen.getByText('1200 TOK')).toBeInTheDocument();
  });

  it('calls onResume when row clicked', () => {
    const onResume = vi.fn();
    render(<SessionRow session={mockSession} onResume={onResume} onDelete={vi.fn()} />, {
      wrapper,
    });
    fireEvent.click(screen.getByText('Code Reviewer'));
    expect(onResume).toHaveBeenCalledTimes(1);
  });

  it('calls onResume when resume button clicked', () => {
    const onResume = vi.fn();
    render(<SessionRow session={mockSession} onResume={onResume} onDelete={vi.fn()} />, {
      wrapper,
    });

    // Find the resume button (first within the actions area)
    const space = document.querySelector('.ant-space');
    const buttons = space?.querySelectorAll('button');
    expect(buttons).toBeTruthy();
    expect(buttons!.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(buttons![0]);
    expect(onResume).toHaveBeenCalledTimes(1);
  });

  it('calls onFork when fork button clicked and onFork is provided', () => {
    const onFork = vi.fn();
    render(
      <SessionRow session={mockSession} onResume={vi.fn()} onDelete={vi.fn()} onFork={onFork} />,
      { wrapper }
    );

    // Find the fork button (second within the actions area)
    const space = document.querySelector('.ant-space');
    const buttons = space?.querySelectorAll('button');
    expect(buttons).toBeTruthy();
    expect(buttons!.length).toBeGreaterThanOrEqual(2);
    fireEvent.click(buttons![1]);
    expect(onFork).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete is confirmed', async () => {
    const onDelete = vi.fn();
    render(<SessionRow session={mockSession} onResume={vi.fn()} onDelete={onDelete} />, {
      wrapper,
    });

    // Use native click to trigger Popconfirm
    const deleteBtn = document.querySelector('.ant-btn-dangerous') as HTMLElement;
    expect(deleteBtn).toBeTruthy();
    deleteBtn.click();

    // Confirm the popconfirm with fuzzy text match
    const confirmBtn = await screen.findByText((content) => content.replace(/\s+/g, '') === '删除');
    confirmBtn.click();

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('handles mouse enter and leave events', () => {
    const { container } = render(
      <SessionRow session={mockSession} onResume={vi.fn()} onDelete={vi.fn()} />,
      { wrapper }
    );
    // The session row is the first child div of the rendered container
    const row = container.querySelector('[class*="css"]');
    expect(row).toBeTruthy();
    if (row) {
      fireEvent.mouseEnter(row);
      fireEvent.mouseLeave(row);
    }
  });
});

/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { ConfigProvider } from 'antd';
import { lightTheme, lightAntdConfig } from '@agentskillmania/skill-ui-theme';

// Track filterOption calls to exercise antd Select's filterOption inline callback
let capturedFilterOption: ((input: string, option: any) => boolean) | null = null;

vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  const React = require('react');
  return {
    ...actual,
    Select: (props: any) => {
      const { filterOption, ...rest } = props;
      capturedFilterOption = filterOption;
      const ActualSelect = (actual as any).Select;
      return React.createElement(ActualSelect, { ...rest, filterOption: (input: string, option: any) => {
        capturedFilterOption = filterOption;
        return filterOption(input, option);
      } });
    },
  };
});

import { SessionSection } from '../../src/components/SessionSection/SessionSection.js';
import type { SessionItem } from '../../src/types.js';

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={lightAntdConfig}>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </ConfigProvider>
  );
}

const mockSessions: SessionItem[] = [
  {
    id: 'sess-1',
    agentId: 'agent-1',
    agentName: 'Code Reviewer',
    workspacePath: '/tmp/review-42',
    lastActive: '2 hours ago',
    tokenCount: 1200,
  },
  {
    id: 'sess-2',
    agentId: 'agent-2',
    agentName: 'Skill Builder',
    workspacePath: '/tmp/builder-99',
    lastActive: '1 day ago',
    tokenCount: 3400,
  },
];

describe('SessionSection', () => {
  const baseProps = {
    page: 1,
    total: 2,
    onPageChange: vi.fn(),
    onResume: vi.fn(),
    onDelete: vi.fn(),
    filterWorkspace: undefined as string | undefined,
    onFilterWorkspaceChange: vi.fn(),
  };

  it('renders section header', () => {
    render(<SessionSection sessions={mockSessions} {...baseProps} />, { wrapper });
    expect(screen.getByText('最近会话')).toBeInTheDocument();
  });

  it('shows empty state when sessions array is empty', () => {
    render(<SessionSection sessions={[]} {...baseProps} total={0} />, { wrapper });
    expect(screen.getByText('暂无会话')).toBeInTheDocument();
    expect(screen.queryByText('Code Reviewer')).not.toBeInTheDocument();
  });

  it('shows empty state when all sessions are filtered out', () => {
    render(
      <SessionSection
        sessions={mockSessions}
        {...baseProps}
        filterWorkspace="/nonexistent"
      />,
      { wrapper },
    );
    expect(screen.getByText('暂无会话')).toBeInTheDocument();
    expect(screen.queryByText('Code Reviewer')).not.toBeInTheDocument();
  });

  it('renders session rows when sessions exist', () => {
    render(<SessionSection sessions={mockSessions} {...baseProps} />, { wrapper });
    expect(screen.getByText('Code Reviewer')).toBeInTheDocument();
    expect(screen.getByText('Skill Builder')).toBeInTheDocument();
  });

  it('renders pagination when total > pageSize', () => {
    render(
      <SessionSection sessions={mockSessions} {...baseProps} total={24} pageSize={12} />,
      { wrapper },
    );
    expect(screen.getByTitle('2')).toBeInTheDocument();
  });

  it('does not render pagination when total <= pageSize', () => {
    render(
      <SessionSection sessions={mockSessions} {...baseProps} total={12} pageSize={12} />,
      { wrapper },
    );
    expect(screen.queryByTitle('2')).not.toBeInTheDocument();
  });

  it('calls onPageChange when pagination changes', () => {
    const onPageChange = vi.fn();
    render(
      <SessionSection
        sessions={mockSessions}
        {...baseProps}
        total={24}
        pageSize={12}
        onPageChange={onPageChange}
      />,
      { wrapper },
    );
    // Click the <a> element inside the pagination item (native click needed for antd)
    const pageLink = document.querySelector('.ant-pagination-item-2 a') as HTMLElement;
    expect(pageLink).toBeTruthy();
    pageLink.click();
    expect(onPageChange).toHaveBeenCalledWith(2, 12);
  });

  it('calls onResume with session id when resume button is clicked', () => {
    const onResume = vi.fn();
    render(
      <SessionSection sessions={[mockSessions[0]]} {...baseProps} total={1} onResume={onResume} />,
      { wrapper },
    );

    // Find the resume button (first button in the Space)
    const space = document.querySelector('.ant-space');
    const buttons = space?.querySelectorAll('button');
    expect(buttons).toBeTruthy();
    expect(buttons!.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(buttons![0]);
    expect(onResume).toHaveBeenCalledWith('sess-1');
  });

  it('calls onDelete with session id when delete is confirmed', async () => {
    const onDelete = vi.fn();
    render(
      <SessionSection sessions={[mockSessions[0]]} {...baseProps} total={1} onDelete={onDelete} />,
      { wrapper },
    );

    // Use native click to trigger Popconfirm
    const deleteBtn = document.querySelector('.ant-btn-dangerous') as HTMLElement;
    expect(deleteBtn).toBeTruthy();
    deleteBtn.click();

    // Confirm the popconfirm with fuzzy text match
    const confirmBtn = await screen.findByText((content) => content.replace(/\s+/g, '') === '删除');
    confirmBtn.click();

    expect(onDelete).toHaveBeenCalledWith('sess-1');
  });

  it('calls onFork with session id when fork button is clicked and onFork is provided', () => {
    const onFork = vi.fn();
    render(
      <SessionSection
        sessions={[mockSessions[0]]}
        {...baseProps}
        total={1}
        onFork={onFork}
      />,
      { wrapper },
    );

    // Find the fork button (second button in the Space)
    const space = document.querySelector('.ant-space');
    const buttons = space?.querySelectorAll('button');
    expect(buttons).toBeTruthy();
    expect(buttons!.length).toBeGreaterThanOrEqual(2);
    fireEvent.click(buttons![1]);
    expect(onFork).toHaveBeenCalledWith('sess-1');
  });

  it('shows clear all button when onClear is provided and total > 0', () => {
    render(
      <SessionSection sessions={mockSessions} {...baseProps} total={2} onClear={vi.fn()} />,
      { wrapper },
    );
    expect(screen.getByText('清除全部')).toBeInTheDocument();
  });

  it('does not show clear all button when onClear is not provided', () => {
    render(<SessionSection sessions={mockSessions} {...baseProps} total={2} />, { wrapper });
    expect(screen.queryByText('清除全部')).not.toBeInTheDocument();
  });

  it('does not show clear all button when total is 0', () => {
    render(
      <SessionSection sessions={[]} {...baseProps} total={0} onClear={vi.fn()} />,
      { wrapper },
    );
    expect(screen.queryByText('清除全部')).not.toBeInTheDocument();
  });

  it('calls onClear when clear all is confirmed', async () => {
    const onClear = vi.fn();
    render(
      <SessionSection sessions={mockSessions} {...baseProps} total={2} onClear={onClear} />,
      { wrapper },
    );

    // Click the clear all button
    fireEvent.click(screen.getByText('清除全部'));

    // Confirm the popconfirm with fuzzy text match
    const confirmBtn = await screen.findByText((content) => content.replace(/\s+/g, '') === '删除');
    confirmBtn.click();

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('filters sessions by workspace', () => {
    render(
      <SessionSection
        sessions={mockSessions}
        {...baseProps}
        filterWorkspace="/tmp/review-42"
      />,
      { wrapper },
    );
    expect(screen.getByText('Code Reviewer')).toBeInTheDocument();
    expect(screen.queryByText('Skill Builder')).not.toBeInTheDocument();
  });

  it('renders workspace filter select', () => {
    render(<SessionSection sessions={mockSessions} {...baseProps} />, { wrapper });
    // antd Select renders placeholder text inside .ant-select-selection-placeholder
    expect(screen.getByText('筛选工作区')).toBeInTheDocument();
  });

  it('supports custom pageSize', () => {
    render(
      <SessionSection sessions={mockSessions} {...baseProps} total={5} pageSize={5} />,
      { wrapper },
    );
    expect(screen.queryByTitle('2')).not.toBeInTheDocument();
  });

  it('filterOption matches label against input', () => {
    expect(capturedFilterOption).toBeTruthy();
    if (capturedFilterOption) {
      expect(capturedFilterOption('test', { label: 'Test Label' })).toBe(true);
      expect(capturedFilterOption('xyz', { label: 'Test Label' })).toBe(false);
      expect(capturedFilterOption('test', null)).toBe(false);
      expect(capturedFilterOption('test', { label: 'TEST LABEL' })).toBe(true);
    }
  });
});

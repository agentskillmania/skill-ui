/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { ConfigProvider } from 'antd';
import { lightTheme, lightAntdConfig } from '@agentskillmania/skill-ui-theme';
import { Portal } from '../../src/components/Portal/Portal.js';

// Track onSelect/onEdit callbacks passed to PortalHeader for testing
let capturedOnSelect: ((type: string, id: string) => void) | null = null;
let capturedOnEdit: ((type: string, id: string) => void) | null = null;

vi.mock('../../src/components/PortalHeader/PortalHeader.js', () => ({
  PortalHeader: (props: any) => {
    const React = require('react');
    // Capture the callbacks for test triggering
    React.useEffect(() => {
      capturedOnSelect = props.onSelect;
      capturedOnEdit = props.onEdit;
    });
    return React.createElement('div', { 'data-testid': 'mock-portal-header' },
      React.createElement('input', {
        'data-testid': 'search-input',
        placeholder: '搜索技能、智能体或会话记录…',
        onKeyDown: (e: any) => { if (e.key === 'Enter') props.onSearch?.(props.query); },
      })
    );
  },
}));

beforeAll(() => {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
});

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={lightAntdConfig}>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </ConfigProvider>
  );
}

const defaultProps = {
  activeTab: 'skills' as const,
  onTabChange: vi.fn(),
  searchQuery: '',
  onSearchQueryChange: vi.fn(),
  searchResults: { agents: [], skills: [], sessions: [] },
  onSearch: vi.fn(),
  onSearchSelect: vi.fn(),
  agents: [],
  agentsPage: 1,
  agentsTotal: 0,
  onAgentsPageChange: vi.fn(),
  skills: [{ id: 's1', name: 'Web Search', description: 'Search' }],
  skillsPage: 1,
  skillsTotal: 1,
  onSkillsPageChange: vi.fn(),
  sessions: [],
  sessionsPage: 1,
  sessionsTotal: 0,
  onSessionsPageChange: vi.fn(),
  sessionFilterWorkspace: undefined,
  onSessionFilterWorkspaceChange: vi.fn(),
  onAgentChat: vi.fn(),
  onAgentEdit: vi.fn(),
  onAgentCreate: vi.fn(),
  onAgentDelete: vi.fn(),
  onSkillChat: vi.fn(),
  onSkillEdit: vi.fn(),
  onSkillCreate: vi.fn(),
  onSkillDelete: vi.fn(),
  onSessionResume: vi.fn(),
  onSessionDelete: vi.fn(),
  onSessionClear: vi.fn(),
};

describe('Portal', () => {
  it('renders with skills tab active by default', () => {
    render(<Portal {...defaultProps} />, { wrapper });
    expect(screen.getByText('Web Search')).toBeInTheDocument();
  });

  it('calls onTabChange when tab clicked', () => {
    const onTabChange = vi.fn();
    render(<Portal {...defaultProps} onTabChange={onTabChange} />, { wrapper });
    fireEvent.click(screen.getByRole('tab', { name: /智能体/ }));
    expect(onTabChange).toHaveBeenCalledWith('agents');
  });

  it('calls onSearch when Enter pressed in search input', () => {
    const onSearch = vi.fn();
    const onSearchQueryChange = vi.fn();
    render(
      <Portal
        {...defaultProps}
        searchQuery="test"
        onSearchQueryChange={onSearchQueryChange}
        onSearch={onSearch}
      />,
      { wrapper }
    );
    const input = screen.getByPlaceholderText('搜索技能、智能体或会话记录…');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(onSearch).toHaveBeenCalledWith('test');
  });

  it('calls onSkillCreate with name when modal submitted', async () => {
    const onSkillCreate = vi.fn();
    render(<Portal {...defaultProps} onSkillCreate={onSkillCreate} />, { wrapper });
    fireEvent.click(screen.getAllByText('新建技能')[0]);
    const input = await screen.findByPlaceholderText('请输入名称');
    fireEvent.change(input, { target: { value: 'My New Skill' } });
    // antd Modal renders buttons via portal; find by primary button class
    const primaryBtn = document.querySelector('.ant-modal-wrap .ant-btn-primary') as HTMLElement;
    expect(primaryBtn).toBeTruthy();
    primaryBtn.click();
    // wait for async form validation + callback
    await new Promise((r) => setTimeout(r, 50));
    expect(onSkillCreate).toHaveBeenCalledWith('My New Skill');
  });

  it('shows empty state when no skills', () => {
    render(<Portal {...defaultProps} skills={[]} skillsTotal={0} />, { wrapper });
    expect(screen.getByText('暂无技能')).toBeInTheDocument();
  });

  it('calls onSearchSelect when onSelect triggered', () => {
    const onSearchSelect = vi.fn();
    render(<Portal {...defaultProps} onSearchSelect={onSearchSelect} />, { wrapper });
    capturedOnSelect?.('agent', 'a1');
    expect(onSearchSelect).toHaveBeenCalledWith('agent', 'a1');
  });

  it('fallback calls onAgentChat when onSearchSelect is not provided', () => {
    const onAgentChat = vi.fn();
    const onSkillChat = vi.fn();
    const onSessionResume = vi.fn();
    render(
      <Portal
        {...defaultProps}
        onSearchSelect={undefined}
        onAgentChat={onAgentChat}
        onSkillChat={onSkillChat}
        onSessionResume={onSessionResume}
      />,
      { wrapper }
    );
    capturedOnSelect?.('agent', 'a1');
    expect(onAgentChat).toHaveBeenCalledWith('a1');
    capturedOnSelect?.('skill', 's1');
    expect(onSkillChat).toHaveBeenCalledWith('s1');
    capturedOnSelect?.('session', 'se1');
    expect(onSessionResume).toHaveBeenCalledWith('se1');
  });

  it('calls onSearchEdit when onEdit triggered', () => {
    const onSearchEdit = vi.fn();
    render(<Portal {...defaultProps} onSearchEdit={onSearchEdit} />, { wrapper });
    capturedOnEdit?.('agent', 'a1');
    expect(onSearchEdit).toHaveBeenCalledWith('agent', 'a1');
  });

  it('fallback calls onAgentEdit when onSearchEdit is not provided', () => {
    const onAgentEdit = vi.fn();
    const onSkillEdit = vi.fn();
    const onSessionDelete = vi.fn();
    render(
      <Portal
        {...defaultProps}
        onSearchEdit={undefined}
        onAgentEdit={onAgentEdit}
        onSkillEdit={onSkillEdit}
        onSessionDelete={onSessionDelete}
      />,
      { wrapper }
    );
    capturedOnEdit?.('agent', 'a1');
    expect(onAgentEdit).toHaveBeenCalledWith('a1');
    capturedOnEdit?.('skill', 's1');
    expect(onSkillEdit).toHaveBeenCalledWith('s1');
    capturedOnEdit?.('session', 'se1');
    expect(onSessionDelete).toHaveBeenCalledWith('se1');
  });
});

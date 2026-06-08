/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { ConfigProvider } from 'antd';
import { lightTheme, lightAntdConfig } from '@agentskillmania/skill-ui-theme';
import { Portal } from '../../src/components/Portal/Portal.js';

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
    render(<Portal {...defaultProps} onSearch={onSearch} />, { wrapper });
    const input = screen.getByPlaceholderText('搜索技能、智能体或会话记录…');
    fireEvent.change(input, { target: { value: 'test' } });
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
    fireEvent.click(primaryBtn!);
    // wait for async form validation + callback
    await new Promise((r) => setTimeout(r, 50));
    expect(onSkillCreate).toHaveBeenCalledWith('My New Skill');
  });

  it('shows empty state when no skills', () => {
    render(<Portal {...defaultProps} skills={[]} skillsTotal={0} />, { wrapper });
    expect(screen.getByText('暂无技能')).toBeInTheDocument();
  });
});

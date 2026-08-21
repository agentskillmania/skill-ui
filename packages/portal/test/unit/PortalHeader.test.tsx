/**
 * PortalHeader tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { ConfigProvider } from 'antd';
import { lightTheme, lightAntdConfig } from '@agentskillmania/skill-ui-theme';
import { PortalHeader } from '../../src/components/PortalHeader/PortalHeader.js';
import type { SearchResults } from '../../src/types.js';

// Wrapper component for theme and antd context
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={lightAntdConfig}>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </ConfigProvider>
  );
}

const emptyResults: SearchResults = {
  agents: [],
  skills: [],
  sessions: [],
};

const mockResults: SearchResults = {
  agents: [],
  skills: [{ id: 'skill-1', title: 'Test Skill', subtitle: 'A test skill' }],
  sessions: [],
};

const multiResults: SearchResults = {
  agents: [{ id: 'agent-1', title: 'Agent One', subtitle: 'An agent' }],
  skills: [{ id: 'skill-1', title: 'Test Skill', subtitle: 'A test skill' }],
  sessions: [{ id: 'session-1', title: 'Session One', subtitle: 'A session' }],
};

const defaultProps = {
  query: '',
  onQueryChange: vi.fn(),
  results: emptyResults,
  onSearch: vi.fn(),
  onSelect: vi.fn(),
  onEdit: vi.fn(),
};

describe('PortalHeader', () => {
  it('renders search input with placeholder', () => {
    render(<PortalHeader {...defaultProps} />, { wrapper });
    expect(screen.getByPlaceholderText('搜索技能、智能体或会话记录…')).toBeInTheDocument();
  });

  it('displays controlled query value', () => {
    render(<PortalHeader {...defaultProps} query="test query" />, { wrapper });
    expect(screen.getByDisplayValue('test query')).toBeInTheDocument();
  });

  it('calls onQueryChange when input changes', () => {
    const onQueryChange = vi.fn();
    render(<PortalHeader {...defaultProps} onQueryChange={onQueryChange} />, { wrapper });
    const input = screen.getByPlaceholderText('搜索技能、智能体或会话记录…');
    fireEvent.change(input, { target: { value: 'new query' } });
    expect(onQueryChange).toHaveBeenCalledWith('new query');
  });

  it('calls onSearch when Enter is pressed with non-empty query', () => {
    const onSearch = vi.fn();
    render(<PortalHeader {...defaultProps} query="search term" onSearch={onSearch} />, { wrapper });
    const input = screen.getByPlaceholderText('搜索技能、智能体或会话记录…');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(onSearch).toHaveBeenCalledWith('search term');
  });

  it('does not call onSearch when query is empty', () => {
    const onSearch = vi.fn();
    render(<PortalHeader {...defaultProps} query="" onSearch={onSearch} />, { wrapper });
    const input = screen.getByPlaceholderText('搜索技能、智能体或会话记录…');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('does not call onSearch when query is only whitespace', () => {
    const onSearch = vi.fn();
    render(<PortalHeader {...defaultProps} query="   " onSearch={onSearch} />, { wrapper });
    const input = screen.getByPlaceholderText('搜索技能、智能体或会话记录…');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('renders the title text', () => {
    render(<PortalHeader {...defaultProps} />, { wrapper });
    expect(screen.getByText('Skill')).toBeInTheDocument();
    expect(screen.getByText('Studio')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<PortalHeader {...defaultProps} />, { wrapper });
    expect(screen.getByText('创建智能体 · 编排技能 · 开启你的 AI 工作流')).toBeInTheDocument();
  });

  it('shows github button when githubUrl is provided', () => {
    render(<PortalHeader {...defaultProps} githubUrl="https://github.com/test" />, { wrapper });

    // Find GitHub link by href
    const githubLink = document.querySelector('a[href="https://github.com/test"]');
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not show github link when githubUrl is not provided', () => {
    render(<PortalHeader {...defaultProps} />, { wrapper });
    expect(document.querySelector('a[href*="github"]')).toBeNull();
  });

  it('renders with search results without crashing', () => {
    // Just verify the component doesn't crash when results have items
    // The AutoComplete dropdown is not rendered in jsdom by default
    expect(() => {
      render(<PortalHeader {...defaultProps} results={mockResults} />, { wrapper });
    }).not.toThrow();
  });

  it('renders with multiple search result categories without crashing', () => {
    expect(() => {
      render(<PortalHeader {...defaultProps} results={multiResults} />, { wrapper });
    }).not.toThrow();
  });

  it('handles AutoComplete onChange with empty value', () => {
    const onQueryChange = vi.fn();
    render(<PortalHeader {...defaultProps} query="test" onQueryChange={onQueryChange} />, {
      wrapper,
    });
    const input = screen.getByPlaceholderText('搜索技能、智能体或会话记录…');
    // AutoComplete's onChange fires onQueryChange with the value
    fireEvent.change(input, { target: { value: '' } });
    expect(onQueryChange).toHaveBeenCalledWith('');
  });

  it('handles AutoComplete onChange with non-empty value', () => {
    const onQueryChange = vi.fn();
    render(<PortalHeader {...defaultProps} query="" onQueryChange={onQueryChange} />, { wrapper });
    const input = screen.getByPlaceholderText('搜索技能、智能体或会话记录…');
    fireEvent.change(input, { target: { value: 'new term' } });
    expect(onQueryChange).toHaveBeenCalledWith('new term');
  });

  it('forwards typed query via onQueryChange', () => {
    // jsdom 中 antd AutoComplete 的下拉不开,无法驱动 onSelect/onEdit 的
    // 选项点击(此前两个同名测试的 mock 从未被触发——虚假覆盖,已删)。
    // 可真实驱动的是受控输入:onQueryChange 必须带上输入值。
    const onQueryChange = vi.fn();
    render(
      <PortalHeader
        {...defaultProps}
        query=""
        results={mockResults}
        onQueryChange={onQueryChange}
      />,
      { wrapper }
    );
    const input = screen.getByPlaceholderText('搜索技能、智能体或会话记录…');
    fireEvent.change(input, { target: { value: '搜索词' } });
    expect(onQueryChange).toHaveBeenCalledWith('搜索词');
  });

  it('submits query via Enter key', () => {
    const onSearch = vi.fn();
    render(
      <PortalHeader {...defaultProps} query="关键词" results={mockResults} onSearch={onSearch} />,
      { wrapper }
    );
    const input = screen.getByPlaceholderText('搜索技能、智能体或会话记录…');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSearch).toHaveBeenCalledWith('关键词');
  });
});

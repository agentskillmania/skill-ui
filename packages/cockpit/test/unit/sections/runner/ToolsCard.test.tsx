/** @jsxImportSource @emotion/react */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { ToolsCard } from '../../../../src/sections/runner/ToolsCard.js';
import type { RunnerToolInfo } from '../../../../src/sections/runner/types.js';

/** Helper: wrap component with ThemeProvider. */
function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

describe('ToolsCard', () => {
  it('renders empty state when tools is null', () => {
    renderWithTheme(<ToolsCard tools={null} />);
    expect(screen.getByText('暂无工具')).toBeInTheDocument();
  });

  it('renders empty state when tools is undefined', () => {
    renderWithTheme(<ToolsCard />);
    expect(screen.getByText('暂无工具')).toBeInTheDocument();
  });

  it('renders empty state when tools is empty array', () => {
    renderWithTheme(<ToolsCard tools={[]} />);
    expect(screen.getByText('暂无工具')).toBeInTheDocument();
  });

  it('renders tool items in tab layout', () => {
    const tools: RunnerToolInfo[] = [
      { name: 'file_read', description: 'Read a file', type: 'builtin', enabled: true },
      { name: 'file_write', description: 'Write a file', type: 'builtin', enabled: true },
      { name: 'mcp_search', description: 'MCP search', type: 'mcp', enabled: true },
    ];
    renderWithTheme(<ToolsCard tools={tools} />);
    // Default tab is builtin — should see builtin tools
    expect(screen.getByTestId('tool-item-file_read')).toBeInTheDocument();
    expect(screen.getByTestId('tool-item-file_write')).toBeInTheDocument();
  });

  it('renders tabs for builtin, mcp, and custom categories', () => {
    const tools: RunnerToolInfo[] = [
      { name: 'file_read', type: 'builtin', enabled: true },
      { name: 'mcp_search', type: 'mcp', enabled: true },
      { name: 'ask_human', type: 'session', enabled: true },
    ];
    renderWithTheme(<ToolsCard tools={tools} />);

    // Three category tabs: 内置, MCP, 自定义
    expect(screen.getByText('内置')).toBeInTheDocument();
    expect(screen.getByText('MCP')).toBeInTheDocument();
    expect(screen.getByText('自定义')).toBeInTheDocument();
  });

  it('does not render tab for category with no tools', () => {
    const tools: RunnerToolInfo[] = [{ name: 'file_read', type: 'builtin', enabled: true }];
    renderWithTheme(<ToolsCard tools={tools} />);

    // Only builtin tab should exist
    expect(screen.getByText('内置')).toBeInTheDocument();
    expect(screen.queryByText('MCP')).not.toBeInTheDocument();
    expect(screen.queryByText('自定义')).not.toBeInTheDocument();
  });

  it('renders StatusDot component for enabled tools', () => {
    const tools: RunnerToolInfo[] = [{ name: 'file_read', type: 'builtin', enabled: true }];
    renderWithTheme(<ToolsCard tools={tools} />);
    // StatusDot renders a small circle — verify tool name is present (dot is adjacent)
    expect(screen.getByTestId('tool-name-file_read')).toBeInTheDocument();
  });

  it('renders tool name with strikethrough when disabled', () => {
    const tools: RunnerToolInfo[] = [{ name: 'shell', type: 'builtin', enabled: false }];
    renderWithTheme(<ToolsCard tools={tools} />);
    const name = screen.getByTestId('tool-name-shell');
    expect(name).toHaveStyle('text-decoration: line-through');
  });

  it('shows description always truncated (no expand behavior)', () => {
    const tools: RunnerToolInfo[] = [
      { name: 'file_read', description: 'Read a file from disk', type: 'builtin', enabled: true },
    ];
    renderWithTheme(<ToolsCard tools={tools} />);

    // Description is visible but always truncated (single-line ellipsis)
    const desc = screen.getByTestId('tool-desc-file_read');
    expect(desc).toBeInTheDocument();
    expect(desc).toHaveTextContent('Read a file from disk');
    expect(desc).toHaveStyle('white-space: nowrap');
  });

  it('does not render description element when tool has no description', () => {
    const tools: RunnerToolInfo[] = [{ name: 'file_read', type: 'builtin', enabled: true }];
    renderWithTheme(<ToolsCard tools={tools} />);
    expect(screen.queryByTestId('tool-desc-file_read')).not.toBeInTheDocument();
  });

  it('renders card title from i18n', () => {
    renderWithTheme(<ToolsCard tools={[{ name: 't1', type: 'builtin', enabled: true }]} />);
    // zh-CN: runner.tools.title → "工具"
    expect(screen.getByText('工具')).toBeInTheDocument();
  });

  it('filters tools when switching tabs', () => {
    const tools: RunnerToolInfo[] = [
      { name: 'file_read', type: 'builtin', enabled: true },
      { name: 'mcp_search', type: 'mcp', enabled: true },
    ];
    renderWithTheme(<ToolsCard tools={tools} />);

    // Default tab is builtin — only builtin tool visible
    expect(screen.getByTestId('tool-item-file_read')).toBeInTheDocument();
    expect(screen.queryByTestId('tool-item-mcp_search')).not.toBeInTheDocument();

    // Switch to MCP tab
    fireEvent.click(screen.getByText('MCP'));
    expect(screen.getByTestId('tool-item-mcp_search')).toBeInTheDocument();
    expect(screen.queryByTestId('tool-item-file_read')).not.toBeInTheDocument();
  });

  it('maps non-builtin/non-mcp types to custom category', () => {
    const tools: RunnerToolInfo[] = [
      { name: 'ask_human', type: 'session', enabled: true },
      { name: 'todo_add', type: 'todolist', enabled: true },
      { name: 'custom_tool', type: 'extra', enabled: true },
    ];
    renderWithTheme(<ToolsCard tools={tools} />);

    // All three are "custom" category — tab should exist
    expect(screen.getByText('自定义')).toBeInTheDocument();

    // Switch to custom tab
    fireEvent.click(screen.getByText('自定义'));
    expect(screen.getByTestId('tool-item-ask_human')).toBeInTheDocument();
    expect(screen.getByTestId('tool-item-todo_add')).toBeInTheDocument();
    expect(screen.getByTestId('tool-item-custom_tool')).toBeInTheDocument();
  });

  it('collapses card body when toggle button is clicked', () => {
    const tools: RunnerToolInfo[] = [{ name: 'file_read', type: 'builtin', enabled: true }];
    renderWithTheme(<ToolsCard tools={tools} />);

    // Tool is visible
    expect(screen.getByTestId('tool-item-file_read')).toBeInTheDocument();

    // Click collapse toggle
    fireEvent.click(screen.getByTestId('collapse-toggle'));
    expect(screen.queryByTestId('tool-item-file_read')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tools-type-tabs')).not.toBeInTheDocument();
  });
});

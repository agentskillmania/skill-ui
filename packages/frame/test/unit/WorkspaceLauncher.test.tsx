/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '@agentskillmania/skill-ui-theme';
import { WorkspaceLauncher } from '../../src/components/WorkspaceLauncher/WorkspaceLauncher.js';
import { FolderOpen } from 'lucide-react';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

const now = Date.now();

const sampleWorkspaces = [
  {
    id: '1',
    name: 'my-agent',
    description: 'A swarm project',
    lastOpened: new Date(now).toISOString(),
  },
  { id: '2', name: 'hello-skill', lastOpened: new Date(now - 86400_000).toISOString() },
  { id: '3', name: 'old-project', lastOpened: new Date(now - 365 * 86400_000).toISOString() },
];

describe('WorkspaceLauncher', () => {
  it('渲染标题和副标题', () => {
    render(<WorkspaceLauncher workspaces={[]} onSelect={vi.fn()} />, { wrapper });
    expect(screen.getByText('打开 Workspace')).toBeInTheDocument();
    expect(screen.getByText('选择一个已有的 workspace，或创建新的')).toBeInTheDocument();
  });

  it('渲染 workspace 卡片列表', () => {
    render(<WorkspaceLauncher workspaces={sampleWorkspaces} onSelect={vi.fn()} />, { wrapper });
    expect(screen.getByText('my-agent')).toBeInTheDocument();
    expect(screen.getByText('hello-skill')).toBeInTheDocument();
    expect(screen.getByText('old-project')).toBeInTheDocument();
  });

  it('渲染描述信息', () => {
    render(<WorkspaceLauncher workspaces={sampleWorkspaces} onSelect={vi.fn()} />, { wrapper });
    expect(screen.getByText('A swarm project')).toBeInTheDocument();
  });

  it('点击卡片触发 onSelect', () => {
    const onSelect = vi.fn();
    render(<WorkspaceLauncher workspaces={sampleWorkspaces} onSelect={onSelect} />, { wrapper });
    fireEvent.click(screen.getByText('my-agent'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });

  it('传入 onCreate 时渲染新建按钮', () => {
    render(<WorkspaceLauncher workspaces={[]} onSelect={vi.fn()} onCreate={vi.fn()} />, {
      wrapper,
    });
    expect(screen.getByText('新建 Workspace')).toBeInTheDocument();
  });

  it('不传 onCreate 时不渲染新建按钮', () => {
    render(<WorkspaceLauncher workspaces={[]} onSelect={vi.fn()} />, { wrapper });
    expect(screen.queryByText('新建 Workspace')).not.toBeInTheDocument();
  });

  it('点击新建按钮触发 onCreate', () => {
    const onCreate = vi.fn();
    render(<WorkspaceLauncher workspaces={[]} onSelect={vi.fn()} onCreate={onCreate} />, {
      wrapper,
    });
    fireEvent.click(screen.getByText('新建 Workspace'));
    expect(onCreate).toHaveBeenCalledOnce();
  });

  it('渲染带图标的卡片', () => {
    const workspaces = [
      { id: '1', name: 'test', icon: <FolderOpen size={16} data-testid="ws-icon" /> },
    ];
    render(<WorkspaceLauncher workspaces={workspaces} onSelect={vi.fn()} />, { wrapper });
    expect(screen.getByTestId('ws-icon')).toBeInTheDocument();
  });

  it('相对时间格式化 — 刚刚', () => {
    const workspaces = [
      { id: '1', name: 'test', lastOpened: new Date(now - 30_000).toISOString() },
    ];
    render(<WorkspaceLauncher workspaces={workspaces} onSelect={vi.fn()} />, { wrapper });
    expect(screen.getByText('刚刚')).toBeInTheDocument();
  });

  it('相对时间格式化 — 分钟前', () => {
    const workspaces = [
      { id: '1', name: 'test', lastOpened: new Date(now - 5 * 60_000).toISOString() },
    ];
    render(<WorkspaceLauncher workspaces={workspaces} onSelect={vi.fn()} />, { wrapper });
    expect(screen.getByText('5 分钟前')).toBeInTheDocument();
  });

  it('相对时间格式化 — 小时前', () => {
    const workspaces = [
      { id: '1', name: 'test', lastOpened: new Date(now - 3 * 3600_000).toISOString() },
    ];
    render(<WorkspaceLauncher workspaces={workspaces} onSelect={vi.fn()} />, { wrapper });
    expect(screen.getByText('3 小时前')).toBeInTheDocument();
  });

  it('相对时间格式化 — 天前', () => {
    const workspaces = [
      { id: '1', name: 'test', lastOpened: new Date(now - 5 * 86400_000).toISOString() },
    ];
    render(<WorkspaceLauncher workspaces={workspaces} onSelect={vi.fn()} />, { wrapper });
    expect(screen.getByText('5 天前')).toBeInTheDocument();
  });

  it('相对时间格式化 — 个月前', () => {
    const workspaces = [
      { id: '1', name: 'test', lastOpened: new Date(now - 60 * 86400_000).toISOString() },
    ];
    render(<WorkspaceLauncher workspaces={workspaces} onSelect={vi.fn()} />, { wrapper });
    expect(screen.getByText('2 个月前')).toBeInTheDocument();
  });

  it('相对时间格式化 — 年前', () => {
    const workspaces = [
      { id: '1', name: 'test', lastOpened: new Date(now - 400 * 86400_000).toISOString() },
    ];
    render(<WorkspaceLauncher workspaces={workspaces} onSelect={vi.fn()} />, { wrapper });
    expect(screen.getByText('1 年前')).toBeInTheDocument();
  });

  it('相对时间格式化 — 未来时间显示"刚刚"', () => {
    const workspaces = [
      { id: '1', name: 'test', lastOpened: new Date(now + 60_000).toISOString() },
    ];
    render(<WorkspaceLauncher workspaces={workspaces} onSelect={vi.fn()} />, { wrapper });
    expect(screen.getByText('刚刚')).toBeInTheDocument();
  });

  it('无 lastOpened 时不显示时间', () => {
    const workspaces = [{ id: '1', name: 'test' }];
    const { container } = render(<WorkspaceLauncher workspaces={workspaces} onSelect={vi.fn()} />, {
      wrapper,
    });
    // Clock 图标不应出现（只在没有 lastOpened 时）
    expect(container.querySelector('svg')).toBeNull();
  });
});

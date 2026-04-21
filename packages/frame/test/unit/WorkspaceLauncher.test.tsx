/** @jsxImportSource @emotion/react */
import { beforeAll, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { ConfigProvider } from 'antd';
import { lightTheme, lightAntdConfig } from '@agentskillmania/skill-ui-theme';
import { WorkspaceLauncher } from '../../src/components/WorkspaceLauncher/WorkspaceLauncher.js';
import { FolderOpen } from 'lucide-react';
import { formatRelativeTime } from '../../src/components/WorkspaceLauncher/time.js';

// antd 依赖 ResizeObserver
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

describe('WorkspaceLauncher — list 模式', () => {
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

  it('workspace 数量 > 5 时显示搜索框', () => {
    const many = Array.from({ length: 6 }, (_, i) => ({
      id: String(i),
      name: `ws-${i}`,
    }));
    render(<WorkspaceLauncher workspaces={many} onSelect={vi.fn()} />, { wrapper });
    expect(screen.getByPlaceholderText('搜索 workspace...')).toBeInTheDocument();
  });

  it('workspace 数量 <= 5 时不显示搜索框', () => {
    const few = [{ id: '1', name: 'ws-1' }];
    render(<WorkspaceLauncher workspaces={few} onSelect={vi.fn()} />, { wrapper });
    expect(screen.queryByPlaceholderText('搜索 workspace...')).not.toBeInTheDocument();
  });

  it('搜索过滤 workspace', () => {
    const many = Array.from({ length: 6 }, (_, i) => ({
      id: String(i),
      name: `workspace-${i}`,
      description: `描述 ${i}`,
    }));
    render(<WorkspaceLauncher workspaces={many} onSelect={vi.fn()} />, { wrapper });

    const input = screen.getByPlaceholderText('搜索 workspace...');
    fireEvent.change(input, { target: { value: 'workspace-3' } });
    expect(screen.getByText('workspace-3')).toBeInTheDocument();
    expect(screen.queryByText('workspace-1')).not.toBeInTheDocument();
  });

  it('搜索无匹配显示空状态', () => {
    const many = Array.from({ length: 6 }, (_, i) => ({
      id: String(i),
      name: `workspace-${i}`,
    }));
    render(<WorkspaceLauncher workspaces={many} onSelect={vi.fn()} />, { wrapper });

    const input = screen.getByPlaceholderText('搜索 workspace...');
    fireEvent.change(input, { target: { value: '不存在' } });
    expect(screen.getByText('没有匹配的 workspace')).toBeInTheDocument();
  });

  it('空列表显示空状态', () => {
    render(<WorkspaceLauncher workspaces={[]} onSelect={vi.fn()} />, { wrapper });
    expect(screen.getByText('暂无 workspace')).toBeInTheDocument();
  });
});

describe('WorkspaceLauncher — mondrian 模式', () => {
  it('渲染蒙德里安网格中的 workspace', () => {
    render(
      <WorkspaceLauncher workspaces={sampleWorkspaces} onSelect={vi.fn()} layoutMode="mondrian" />,
      { wrapper }
    );
    expect(screen.getByText('my-agent')).toBeInTheDocument();
    expect(screen.getByText('hello-skill')).toBeInTheDocument();
    expect(screen.getByText('old-project')).toBeInTheDocument();
  });

  it('点击色块触发 onSelect', () => {
    const onSelect = vi.fn();
    render(
      <WorkspaceLauncher workspaces={sampleWorkspaces} onSelect={onSelect} layoutMode="mondrian" />,
      { wrapper }
    );
    fireEvent.click(screen.getByText('my-agent'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });

  it('空列表显示空状态', () => {
    render(<WorkspaceLauncher workspaces={[]} onSelect={vi.fn()} layoutMode="mondrian" />, {
      wrapper,
    });
    expect(screen.getByText('暂无 workspace')).toBeInTheDocument();
  });

  it('色块有 aria-label', () => {
    render(
      <WorkspaceLauncher workspaces={sampleWorkspaces} onSelect={vi.fn()} layoutMode="mondrian" />,
      { wrapper }
    );
    expect(screen.getByLabelText('打开 my-agent')).toBeInTheDocument();
  });

  it('渲染带图标的色块', () => {
    const workspaces = [
      { id: 'icon-1', name: 'test', icon: <FolderOpen size={16} data-testid="ws-icon" /> },
    ];
    render(<WorkspaceLauncher workspaces={workspaces} onSelect={vi.fn()} layoutMode="mondrian" />, {
      wrapper,
    });
    expect(screen.getByTestId('ws-icon')).toBeInTheDocument();
  });

  it('带描述的宽色块显示描述', () => {
    // 构造多种 id 覆盖不同 span 和颜色组合
    const workspaces = Array.from({ length: 30 }, (_, i) => ({
      id: `mondrian-test-${i}`,
      name: `ws-${i}`,
      description: `描述 ${i}`,
      lastOpened: new Date(now - i * 3600_000).toISOString(),
      icon: i % 3 === 0 ? <FolderOpen size={16} data-testid={`icon-${i}`} /> : undefined,
    }));
    const { container } = render(
      <WorkspaceLauncher workspaces={workspaces} onSelect={vi.fn()} layoutMode="mondrian" />,
      { wrapper }
    );
    // 验证名称渲染了
    expect(screen.getByText('ws-0')).toBeInTheDocument();
    // 验证部分描述渲染了（宽/大块才显示，不保证每个 id 都有，所以检查 DOM 中是否存在任何描述）
    const descriptionTexts = container.querySelectorAll('button');
    let foundDescription = false;
    descriptionTexts.forEach((btn) => {
      if (btn.textContent?.includes('描述')) foundDescription = true;
    });
    expect(foundDescription).toBe(true);
    // 验证时间格式化（至少部分块会显示时间）
    expect(screen.getByText('刚刚')).toBeInTheDocument();
    // 验证图标
    expect(screen.getByTestId('icon-0')).toBeInTheDocument();
  });

  it('无描述无时间的色块只显示名称', () => {
    const workspaces = [
      { id: 'simple-1', name: 'simple' },
      { id: 'simple-2', name: 'another' },
    ];
    render(<WorkspaceLauncher workspaces={workspaces} onSelect={vi.fn()} layoutMode="mondrian" />, {
      wrapper,
    });
    expect(screen.getByText('simple')).toBeInTheDocument();
    expect(screen.getByText('another')).toBeInTheDocument();
  });
});

describe('formatRelativeTime', () => {
  it('刚刚', () => {
    expect(formatRelativeTime(new Date(now - 30_000).toISOString())).toBe('刚刚');
  });

  it('分钟前', () => {
    expect(formatRelativeTime(new Date(now - 5 * 60_000).toISOString())).toBe('5 分钟前');
  });

  it('小时前', () => {
    expect(formatRelativeTime(new Date(now - 3 * 3600_000).toISOString())).toBe('3 小时前');
  });

  it('天前', () => {
    expect(formatRelativeTime(new Date(now - 5 * 86400_000).toISOString())).toBe('5 天前');
  });

  it('个月前', () => {
    expect(formatRelativeTime(new Date(now - 60 * 86400_000).toISOString())).toBe('2 个月前');
  });

  it('年前', () => {
    expect(formatRelativeTime(new Date(now - 400 * 86400_000).toISOString())).toBe('1 年前');
  });

  it('未来时间显示"刚刚"', () => {
    expect(formatRelativeTime(new Date(now + 60_000).toISOString())).toBe('刚刚');
  });
});

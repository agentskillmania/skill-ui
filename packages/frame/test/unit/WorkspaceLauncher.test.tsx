/** @jsxImportSource @emotion/react */
import { beforeAll, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { ConfigProvider } from 'antd';
import { lightTheme, lightAntdConfig } from '@agentskillmania/skill-ui-theme';
import { WorkspaceLauncher } from '../../src/components/WorkspaceLauncher/WorkspaceLauncher.js';
import { FolderOpen } from 'lucide-react';
import { formatRelativeTime } from '../../src/components/WorkspaceLauncher/time.js';

// antd depends on ResizeObserver
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

describe('WorkspaceLauncher — list mode', () => {
  it('renders title and subtitle', () => {
    render(<WorkspaceLauncher workspaces={[]} onSelect={vi.fn()} />, { wrapper });
    expect(screen.getByText('打开工作区')).toBeInTheDocument();
    expect(screen.getByText('选择一个已有的 workspace，或创建新的')).toBeInTheDocument();
  });

  it('renders workspace card list', () => {
    render(<WorkspaceLauncher workspaces={sampleWorkspaces} onSelect={vi.fn()} />, { wrapper });
    expect(screen.getByText('my-agent')).toBeInTheDocument();
    expect(screen.getByText('hello-skill')).toBeInTheDocument();
    expect(screen.getByText('old-project')).toBeInTheDocument();
  });

  it('renders description info', () => {
    render(<WorkspaceLauncher workspaces={sampleWorkspaces} onSelect={vi.fn()} />, { wrapper });
    expect(screen.getByText('A swarm project')).toBeInTheDocument();
  });

  it('clicking card triggers onSelect', () => {
    const onSelect = vi.fn();
    render(<WorkspaceLauncher workspaces={sampleWorkspaces} onSelect={onSelect} />, { wrapper });
    fireEvent.click(screen.getByText('my-agent'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });

  it('renders create button when onCreate is passed', () => {
    render(<WorkspaceLauncher workspaces={[]} onSelect={vi.fn()} onCreate={vi.fn()} />, {
      wrapper,
    });
    expect(screen.getByText('新建 Workspace')).toBeInTheDocument();
  });

  it('does not render create button when onCreate is not passed', () => {
    render(<WorkspaceLauncher workspaces={[]} onSelect={vi.fn()} />, { wrapper });
    expect(screen.queryByText('新建 Workspace')).not.toBeInTheDocument();
  });

  it('clicking create button triggers onCreate', () => {
    const onCreate = vi.fn();
    render(<WorkspaceLauncher workspaces={[]} onSelect={vi.fn()} onCreate={onCreate} />, {
      wrapper,
    });
    fireEvent.click(screen.getByText('新建 Workspace'));
    expect(onCreate).toHaveBeenCalledOnce();
  });

  it('renders card with icon', () => {
    const workspaces = [
      { id: '1', name: 'test', icon: <FolderOpen size={16} data-testid="ws-icon" /> },
    ];
    render(<WorkspaceLauncher workspaces={workspaces} onSelect={vi.fn()} />, { wrapper });
    expect(screen.getByTestId('ws-icon')).toBeInTheDocument();
  });

  it('shows search box when workspace count > 5', () => {
    const many = Array.from({ length: 6 }, (_, i) => ({
      id: String(i),
      name: `ws-${i}`,
    }));
    render(<WorkspaceLauncher workspaces={many} onSelect={vi.fn()} />, { wrapper });
    expect(screen.getByPlaceholderText('搜索 workspace...')).toBeInTheDocument();
  });

  it('does not show search box when workspace count <= 5', () => {
    const few = [{ id: '1', name: 'ws-1' }];
    render(<WorkspaceLauncher workspaces={few} onSelect={vi.fn()} />, { wrapper });
    expect(screen.queryByPlaceholderText('搜索 workspace...')).not.toBeInTheDocument();
  });

  it('search filters workspaces', () => {
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

  it('search with no matches shows empty state', () => {
    const many = Array.from({ length: 6 }, (_, i) => ({
      id: String(i),
      name: `workspace-${i}`,
    }));
    render(<WorkspaceLauncher workspaces={many} onSelect={vi.fn()} />, { wrapper });

    const input = screen.getByPlaceholderText('搜索 workspace...');
    fireEvent.change(input, { target: { value: '不存在' } });
    expect(screen.getByText('没有匹配的 workspace')).toBeInTheDocument();
  });

  it('empty list shows empty state', () => {
    render(<WorkspaceLauncher workspaces={[]} onSelect={vi.fn()} />, { wrapper });
    expect(screen.getByText('暂无 workspace')).toBeInTheDocument();
  });
});

describe('WorkspaceLauncher — mondrian mode', () => {
  it('renders workspaces in Mondrian grid', () => {
    render(
      <WorkspaceLauncher workspaces={sampleWorkspaces} onSelect={vi.fn()} layoutMode="mondrian" />,
      { wrapper }
    );
    expect(screen.getByText('my-agent')).toBeInTheDocument();
    expect(screen.getByText('hello-skill')).toBeInTheDocument();
    expect(screen.getByText('old-project')).toBeInTheDocument();
  });

  it('clicking color block triggers onSelect', () => {
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

  it('color block has aria-label', () => {
    render(
      <WorkspaceLauncher workspaces={sampleWorkspaces} onSelect={vi.fn()} layoutMode="mondrian" />,
      { wrapper }
    );
    expect(screen.getByLabelText('打开 my-agent')).toBeInTheDocument();
  });

  it('renders color block with icon', () => {
    const workspaces = [
      { id: 'icon-1', name: 'test', icon: <FolderOpen size={16} data-testid="ws-icon" /> },
    ];
    render(<WorkspaceLauncher workspaces={workspaces} onSelect={vi.fn()} layoutMode="mondrian" />, {
      wrapper,
    });
    expect(screen.getByTestId('ws-icon')).toBeInTheDocument();
  });

  it('wide color block with description shows description', () => {
    // construct multiple ids to cover different span and color combinations
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
    // verify name is rendered
    expect(screen.getByText('ws-0')).toBeInTheDocument();
    // verify some descriptions are rendered (only wide/large blocks show them, not guaranteed for every id, so check if any description exists in DOM)
    const descriptionTexts = container.querySelectorAll('button');
    let foundDescription = false;
    descriptionTexts.forEach((btn) => {
      if (btn.textContent?.includes('描述')) foundDescription = true;
    });
    expect(foundDescription).toBe(true);
    // verify time formatting (at least some blocks will show time)
    expect(screen.getByText('刚刚')).toBeInTheDocument();
    // verify icon
    expect(screen.getByTestId('icon-0')).toBeInTheDocument();
  });

  it('color block without description or time only shows name', () => {
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
  it('just now', () => {
    expect(formatRelativeTime(new Date(now - 30_000).toISOString())).toBe('刚刚');
  });

  it('minutes ago', () => {
    expect(formatRelativeTime(new Date(now - 5 * 60_000).toISOString())).toBe('5 分钟前');
  });

  it('hours ago', () => {
    expect(formatRelativeTime(new Date(now - 3 * 3600_000).toISOString())).toBe('3 小时前');
  });

  it('days ago', () => {
    expect(formatRelativeTime(new Date(now - 5 * 86400_000).toISOString())).toBe('5 天前');
  });

  it('months ago', () => {
    expect(formatRelativeTime(new Date(now - 60 * 86400_000).toISOString())).toBe('2 个月前');
  });

  it('years ago', () => {
    expect(formatRelativeTime(new Date(now - 400 * 86400_000).toISOString())).toBe('1 年前');
  });

  it('future time shows "just now"', () => {
    expect(formatRelativeTime(new Date(now + 60_000).toISOString())).toBe('刚刚');
  });
});

/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './testUtils.js';
import React from 'react';
import { FileBrowser, FILE_BROWSER_BREAKPOINT } from '../../src/panels/file-browser/index.js';
import { ArtifactList } from '../../src/panels/file-browser/ArtifactList.js';
import { FileDetail } from '../../src/panels/file-browser/FileDetail.js';
import type { ArtifactEntry, ProjectFile } from '../../src/types.js';

// ── Monaco mock(FileDetail 的文本预览懒加载引擎)──
vi.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="monaco-editor">
      <span data-testid="monaco-value">{props.value ?? props.defaultValue}</span>
      <span data-testid="monaco-readonly">{String(props.options?.readOnly)}</span>
    </div>
  ),
  loader: { config: vi.fn() },
}));
vi.mock('monaco-editor', () => ({}));

// ── ResizeObserver mock:observe 即同步回报指定宽度,驱动断点切换 ──
let reportedWidth = 800;
class MockResizeObserver {
  callback: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) {
    this.callback = cb;
  }
  observe() {
    this.callback([{ contentRect: { width: reportedWidth } } as ResizeObserverEntry], this);
  }
  disconnect() {}
  unobserve() {}
}
vi.stubGlobal('ResizeObserver', MockResizeObserver);

const artifacts: ArtifactEntry[] = [
  { path: 'src/main.rs', status: 'modified', lastTouch: 3, ops: ['file_write', 'file_edit'] },
  { path: 'design/plan.md', status: 'created', lastTouch: 1, ops: ['file_write'] },
  { path: 'poster.png', status: 'created', lastTouch: 2, ops: ['file_write'] },
];

const workspaceFiles: ProjectFile[] = [
  { path: 'README.md' },
  { path: 'src', isDirectory: true, children: [{ path: 'src/index.ts' }] },
];

describe('FileBrowser', () => {
  beforeEach(() => {
    reportedWidth = 800;
  });

  function renderBrowser(overrides: Partial<Parameters<typeof FileBrowser>[0]> = {}) {
    const props = {
      workspaceFiles,
      artifacts,
      activePath: null,
      onActivePathChange: vi.fn(),
      ...overrides,
    };
    return renderWithProviders(<FileBrowser {...props} />);
  }

  it('renders the built-in source switcher when source is uncontrolled', () => {
    renderBrowser();
    expect(screen.getByText('产物')).toBeInTheDocument();
    expect(screen.getByText('Workspace')).toBeInTheDocument();
  });

  it('hides the built-in switcher when source is controlled (host owns it)', () => {
    renderBrowser({ source: 'artifacts', onSourceChange: vi.fn() });
    expect(screen.queryByText('产物')).not.toBeInTheDocument();
  });

  it('shows the artifact list by default and fires onSourceChange on switch', () => {
    const onSourceChange = vi.fn();
    renderBrowser({ onSourceChange });
    // 产物默认源:能看到产物条目
    expect(screen.getAllByTestId('artifact-item').length).toBe(artifacts.length);
    fireEvent.click(screen.getByText('Workspace'));
    expect(onSourceChange).toHaveBeenCalledWith('workspace');
    // 切到 Workspace 后渲染文件树(目录名可见)
    expect(screen.getByText('src')).toBeInTheDocument();
  });

  it('shows an empty hint when nothing is selected', () => {
    renderBrowser();
    expect(screen.getByText('选择左侧文件查看详情')).toBeInTheDocument();
  });

  it('selecting an artifact fires onActivePathChange and shows the detail header', async () => {
    renderBrowser({ activePath: 'design/plan.md', activeContent: '# plan' });
    // 列表条目与详情标题同名,断言至少出现两处
    expect(screen.getAllByText('plan.md').length).toBeGreaterThanOrEqual(2);
    expect(await screen.findByTestId('monaco-value')).toHaveTextContent('# plan');
  });

  it('collapses and restores the list pane', () => {
    renderBrowser();
    expect(screen.getByTestId('file-list-pane')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('list-collapse-btn'));
    expect(screen.queryByTestId('file-list-pane')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('list-collapse-btn'));
    expect(screen.getByTestId('file-list-pane')).toBeInTheDocument();
  });

  it('stacks below the breakpoint and goes row layout above it', () => {
    reportedWidth = FILE_BROWSER_BREAKPOINT - 1;
    const { rerender } = renderBrowser();
    expect(screen.getByTestId('file-browser-root')).toHaveAttribute('data-stacked', 'true');

    reportedWidth = FILE_BROWSER_BREAKPOINT;
    rerender(<FileBrowserDefault />);
    expect(screen.getByTestId('file-browser-root')).toHaveAttribute('data-stacked', 'false');
  });
});

/** rerender 用的等价默认 props(与 renderBrowser 一致) */
function FileBrowserDefault() {
  return (
    <FileBrowser
      workspaceFiles={workspaceFiles}
      artifacts={artifacts}
      activePath={null}
      onActivePathChange={() => {}}
    />
  );
}

describe('ArtifactList', () => {
  it('renders entries with created/modified badges', () => {
    renderWithProviders(
      <ArtifactList artifacts={artifacts} activePath="src/main.rs" onSelect={() => {}} />
    );
    const items = screen.getAllByTestId('artifact-item');
    expect(items).toHaveLength(3);
    const badges = screen.getAllByTestId('artifact-status').map((b) => b.textContent);
    expect(badges).toEqual(['修改', '新建', '新建']);
    // 选中行带 data-active
    expect(items[0]).toHaveAttribute('data-active', 'true');
    expect(items[1]).toHaveAttribute('data-active', 'false');
  });

  it('fires onSelect with the path on click', () => {
    const onSelect = vi.fn();
    renderWithProviders(
      <ArtifactList artifacts={artifacts} activePath={null} onSelect={onSelect} />
    );
    fireEvent.click(screen.getByText('plan.md'));
    expect(onSelect).toHaveBeenCalledWith('design/plan.md');
  });

  it('renders an empty state when there are no artifacts', () => {
    renderWithProviders(<ArtifactList artifacts={[]} activePath={null} onSelect={() => {}} />);
    expect(screen.getByText('本会话还没有新建或修改过的文件')).toBeInTheDocument();
  });
});

describe('FileDetail', () => {
  it('renders a text file in the read-only EditorArea with a StatusBar', async () => {
    renderWithProviders(<FileDetail path="src/index.ts" content="export {};" />);
    expect(await screen.findByTestId('monaco-value')).toHaveTextContent('export {};');
    expect(screen.getByTestId('monaco-readonly').textContent).toBe('true');
  });

  it('shows the md preview/code toggle from StatusBar (single-way label)', () => {
    renderWithProviders(<FileDetail path="README.md" content="# hi" />);
    // code 模式下切换按钮显示"预览"(切到预览);非 md 文件不显示切换
    expect(screen.getByText('预览')).toBeInTheDocument();
  });

  it('previews an image via imageSrcResolver', () => {
    renderWithProviders(
      <FileDetail path="poster.png" imageSrcResolver={() => 'http://x/poster.png'} />
    );
    expect(screen.getByRole('img')).toHaveAttribute('src', 'http://x/poster.png');
  });

  it('degrades an image to a placeholder when no resolver is wired', () => {
    renderWithProviders(<FileDetail path="poster.png" onOpenInFolder={() => {}} />);
    expect(screen.getByText('图片预览通道未接入，可打开所在目录查看')).toBeInTheDocument();
    expect(screen.getByText('打开所在目录')).toBeInTheDocument();
  });

  it('shows unsupported state for binary files', () => {
    renderWithProviders(<FileDetail path="data.db" content={undefined} unsupported />);
    expect(screen.getByText('该文件不支持预览')).toBeInTheDocument();
  });

  it('shows a spinner while content is loading', () => {
    const { container } = renderWithProviders(<FileDetail path="a.ts" content={undefined} />);
    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('hides the reveal-in-folder button when onOpenInFolder is not provided', () => {
    renderWithProviders(<FileDetail path="a.ts" content="x" />);
    expect(screen.queryByRole('button', { name: '打开所在目录' })).not.toBeInTheDocument();
  });

  it('fires onOpenInFolder with the path', () => {
    const onOpenInFolder = vi.fn();
    renderWithProviders(<FileDetail path="a.ts" content="x" onOpenInFolder={onOpenInFolder} />);
    fireEvent.click(screen.getByRole('button', { name: '打开所在目录' }));
    expect(onOpenInFolder).toHaveBeenCalledWith('a.ts');
  });

  it('shows the full path in the path strip', () => {
    renderWithProviders(<FileDetail path="design/plan.md" content="x" />);
    expect(screen.getAllByText('design/plan.md').length).toBeGreaterThanOrEqual(1);
  });

  it('opens an image in a new window from the external button', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    renderWithProviders(<FileDetail path="poster.png" imageSrcResolver={() => 'http://x/p.png'} />);
    fireEvent.click(screen.getByRole('button', { name: '新窗口打开' }));
    expect(openSpy).toHaveBeenCalledWith('http://x/p.png', '_blank');
    openSpy.mockRestore();
  });
});

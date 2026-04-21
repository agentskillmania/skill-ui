/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '@agentskillmania/skill-ui-theme';

// ── Mock @milkdown/utils（replaceAll） ──────────────────
const mockReplaceAll = vi.fn((markdown: string) => (_ctx: unknown) => markdown);
vi.mock('@milkdown/utils', () => ({
  replaceAll: (...args: unknown[]) => mockReplaceAll(...args),
  __esModule: true,
}));

// ── Mock @milkdown/crepe ──────────────────────────
let markdownUpdatedCallback: ((ctx: unknown, markdown: string, prev: string) => void) | null = null;

const mockEditor = {
  status: 'Created',
  action: vi.fn(),
  view: { setProps: vi.fn() },
  ctx: { get: vi.fn() },
};

const mockCrepeInstance = {
  create: vi.fn().mockResolvedValue(mockEditor),
  destroy: vi.fn().mockResolvedValue(mockEditor),
  on: vi.fn((_fn: (api: unknown) => void) => {
    const mockListener = {
      markdownUpdated: (cb: (ctx: unknown, md: string, prev: string) => void) => {
        markdownUpdatedCallback = cb;
        return mockListener;
      },
    };
    _fn(mockListener);
    return mockCrepeInstance;
  }),
  getMarkdown: vi.fn(() => '# 初始内容'),
  setReadonly: vi.fn(),
  get editor() { return mockEditor; },
  get readonly() { return false; },
};

vi.mock('@milkdown/crepe', () => ({
  Crepe: vi.fn().mockImplementation(() => mockCrepeInstance),
}));

vi.mock('@milkdown/crepe/theme/frame.css', () => ({}));

import { VisualEditor } from '../../src/components/EditorArea/VisualEditor.js';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

const defaultProps = {
  content: '# 初始标题\n\n初始段落',
  filePath: 'SKILL.md',
  mode: 'wysiwyg' as const,
  onChange: vi.fn(),
};

describe('VisualEditor (Crepe 实现)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    markdownUpdatedCallback = null;
    mockCrepeInstance.getMarkdown.mockReturnValue('# 初始内容');
    mockEditor.action.mockReset();
  });

  it('初始化时创建 Crepe 实例并传入 content 作为 defaultValue', async () => {
    renderWithTheme(<VisualEditor {...defaultProps} />);

    await waitFor(() => expect(mockCrepeInstance.create).toHaveBeenCalled());

    const { Crepe } = vi.mocked(await import('@milkdown/crepe'));
    const call = Crepe.mock.calls[0] as [Record<string, unknown>];
    expect(call[0].root).toBeTruthy();
    expect(call[0].defaultValue).toBe('# 初始标题\n\n初始段落');
  });

  it('配置 Placeholder feature', async () => {
    renderWithTheme(<VisualEditor {...defaultProps} />);

    await waitFor(() => expect(mockCrepeInstance.create).toHaveBeenCalled());

    const { Crepe } = vi.mocked(await import('@milkdown/crepe'));
    const call = Crepe.mock.calls[0] as [Record<string, unknown>];
    expect(call[0].featureConfigs).toEqual({
      placeholder: { text: '输入 / 唤起菜单，或直接开始写作...' },
    });
  });

  it('渲染 Crepe 挂载点容器', async () => {
    const { container } = renderWithTheme(<VisualEditor {...defaultProps} />);

    await waitFor(() => expect(mockCrepeInstance.create).toHaveBeenCalled());

    expect(container.querySelector('[data-crepe-root]')).toBeTruthy();
  });

  it('用户编辑触发 onChange 回调', async () => {
    // getMarkdown 返回值与初始 content 一致，避免初始化时触发 content sync
    mockCrepeInstance.getMarkdown.mockReturnValue('# 初始标题\n\n初始段落');

    renderWithTheme(<VisualEditor {...defaultProps} />);

    await waitFor(() => expect(mockCrepeInstance.on).toHaveBeenCalled());

    // 模拟用户编辑
    expect(markdownUpdatedCallback).toBeTruthy();
    markdownUpdatedCallback!({}, '# 新内容', '# 初始标题\n\n初始段落');

    expect(defaultProps.onChange).toHaveBeenCalledWith('# 新内容');
  });

  it('内部变更时不触发 onChange（防循环）', async () => {
    const onChange = vi.fn();
    mockCrepeInstance.getMarkdown.mockReturnValue('# 旧内容');

    const { rerender } = renderWithTheme(
      <VisualEditor {...defaultProps} onChange={onChange} />
    );

    await waitFor(() => expect(mockCrepeInstance.create).toHaveBeenCalled());

    // 模拟 content prop 变化触发 replaceAll（内部变更）
    rerender(
      <ThemeProvider theme={lightTheme}>
        <VisualEditor {...defaultProps} content="# 新内容" onChange={onChange} />
      </ThemeProvider>
    );

    // 此时 isInternalChange 应为 true，markdownUpdatedCallback 不应调用 onChange
    if (markdownUpdatedCallback) {
      markdownUpdatedCallback({}, '# 新内容', '# 旧内容');
    }

    // 不应调用，因为 isInternalChange 标记生效
    expect(onChange).not.toHaveBeenCalled();
  });

  it('content prop 变化时调用 replaceAll 同步内容（文件切换）', async () => {
    mockCrepeInstance.getMarkdown.mockReturnValue('# 旧内容');

    const { rerender } = renderWithTheme(<VisualEditor {...defaultProps} />);

    await waitFor(() => expect(mockCrepeInstance.create).toHaveBeenCalled());

    // 模拟文件切换
    rerender(
      <ThemeProvider theme={lightTheme}>
        <VisualEditor {...defaultProps} content="# 切换后的内容" />
      </ThemeProvider>
    );

    // 动态 import 是异步的，需要 waitFor
    await waitFor(() => {
      expect(mockReplaceAll).toHaveBeenCalledWith('# 切换后的内容');
      expect(mockEditor.action).toHaveBeenCalled();
    });
  });

  it('readOnly=true 时调用 setReadonly(true)', async () => {
    renderWithTheme(<VisualEditor {...defaultProps} readOnly={true} />);

    await waitFor(() => expect(mockCrepeInstance.create).toHaveBeenCalled());

    expect(mockCrepeInstance.setReadonly).toHaveBeenCalledWith(true);
  });

  it('readOnly 变化时更新 setReadonly', async () => {
    const { rerender } = renderWithTheme(<VisualEditor {...defaultProps} readOnly={false} />);

    await waitFor(() => expect(mockCrepeInstance.create).toHaveBeenCalled());

    mockCrepeInstance.setReadonly.mockClear();

    // 切换为只读
    rerender(
      <ThemeProvider theme={lightTheme}>
        <VisualEditor {...defaultProps} readOnly={true} />
      </ThemeProvider>
    );

    expect(mockCrepeInstance.setReadonly).toHaveBeenCalledWith(true);
  });

  it('卸载时调用 crepe.destroy()', async () => {
    const { unmount } = renderWithTheme(<VisualEditor {...defaultProps} />);

    await waitFor(() => expect(mockCrepeInstance.create).toHaveBeenCalled());

    unmount();

    expect(mockCrepeInstance.destroy).toHaveBeenCalled();
  });

  it('空内容正常初始化', async () => {
    renderWithTheme(<VisualEditor {...defaultProps} content="" />);

    await waitFor(() => expect(mockCrepeInstance.create).toHaveBeenCalled());

    const { Crepe } = vi.mocked(await import('@milkdown/crepe'));
    const call = Crepe.mock.calls[0] as [Record<string, unknown>];
    expect(call[0].defaultValue).toBe('');
  });
});

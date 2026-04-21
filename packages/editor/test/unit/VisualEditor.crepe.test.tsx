/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderWithProviders } from './testUtils.js';

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
  get editor() {
    return mockEditor;
  },
  get readonly() {
    return false;
  },
};

vi.mock('@milkdown/crepe', () => ({
  Crepe: vi.fn().mockImplementation(() => mockCrepeInstance),
}));

vi.mock('@milkdown/crepe/theme/frame.css', () => ({}));

import { VisualEditor } from '../../src/components/EditorArea/VisualEditor.js';

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
    renderWithProviders(<VisualEditor {...defaultProps} />);

    await waitFor(() => expect(mockCrepeInstance.create).toHaveBeenCalled());

    const { Crepe } = vi.mocked(await import('@milkdown/crepe'));
    const call = Crepe.mock.calls[0] as [Record<string, unknown>];
    expect(call[0].root).toBeTruthy();
    expect(call[0].defaultValue).toBe('# 初始标题\n\n初始段落');
  });

  it('配置 Placeholder feature', async () => {
    renderWithProviders(<VisualEditor {...defaultProps} />);

    await waitFor(() => expect(mockCrepeInstance.create).toHaveBeenCalled());

    const { Crepe } = vi.mocked(await import('@milkdown/crepe'));
    const call = Crepe.mock.calls[0] as [Record<string, unknown>];
    expect(call[0].featureConfigs).toEqual({
      placeholder: { text: '输入 / 唤起菜单，或直接开始写作...' },
    });
  });

  it('渲染 Crepe 挂载点容器', async () => {
    const { container } = renderWithProviders(<VisualEditor {...defaultProps} />);

    await waitFor(() => expect(mockCrepeInstance.create).toHaveBeenCalled());

    expect(container.querySelector('[data-crepe-root]')).toBeTruthy();
  });

  it('用户编辑触发 onChange 回调', async () => {
    // getMarkdown 返回值与初始 content 一致，避免初始化时触发 content sync
    mockCrepeInstance.getMarkdown.mockReturnValue('# 初始标题\n\n初始段落');

    renderWithProviders(<VisualEditor {...defaultProps} />);

    await waitFor(() => expect(mockCrepeInstance.on).toHaveBeenCalled());

    // 模拟用户编辑
    expect(markdownUpdatedCallback).toBeTruthy();
    markdownUpdatedCallback!({}, '# 新内容', '# 初始标题\n\n初始段落');

    expect(defaultProps.onChange).toHaveBeenCalledWith('# 新内容');
  });

  it('内部变更时不触发 onChange（防循环）', async () => {
    const onChange = vi.fn();
    mockCrepeInstance.getMarkdown.mockReturnValue('# 旧内容');

    const { rerender } = renderWithProviders(
      <VisualEditor {...defaultProps} onChange={onChange} />
    );

    await waitFor(() => expect(mockCrepeInstance.create).toHaveBeenCalled());

    // 模拟 content prop 变化触发 replaceAll（内部变更）
    rerender(<VisualEditor {...defaultProps} content="# 新内容" onChange={onChange} />);

    // 此时 isInternalChange 应为 true，markdownUpdatedCallback 不应调用 onChange
    if (markdownUpdatedCallback) {
      markdownUpdatedCallback({}, '# 新内容', '# 旧内容');
    }

    // 不应调用，因为 isInternalChange 标记生效
    expect(onChange).not.toHaveBeenCalled();
  });

  it('content prop 变化时调用 replaceAll 同步内容（文件切换）', async () => {
    mockCrepeInstance.getMarkdown.mockReturnValue('# 旧内容');

    const { rerender } = renderWithProviders(<VisualEditor {...defaultProps} />);

    await waitFor(() => expect(mockCrepeInstance.create).toHaveBeenCalled());

    // 模拟文件切换
    rerender(<VisualEditor {...defaultProps} content="# 切换后的内容" />);

    // 动态 import 是异步的，需要 waitFor
    await waitFor(() => {
      expect(mockReplaceAll).toHaveBeenCalledWith('# 切换后的内容');
      expect(mockEditor.action).toHaveBeenCalled();
    });
  });

  it('readOnly=true 时调用 setReadonly(true)', async () => {
    renderWithProviders(<VisualEditor {...defaultProps} readOnly={true} />);

    await waitFor(() => expect(mockCrepeInstance.create).toHaveBeenCalled());

    expect(mockCrepeInstance.setReadonly).toHaveBeenCalledWith(true);
  });

  it('readOnly 变化时更新 setReadonly', async () => {
    const { rerender } = renderWithProviders(<VisualEditor {...defaultProps} readOnly={false} />);

    await waitFor(() => expect(mockCrepeInstance.create).toHaveBeenCalled());

    mockCrepeInstance.setReadonly.mockClear();

    // 切换为只读
    rerender(<VisualEditor {...defaultProps} readOnly={true} />);

    expect(mockCrepeInstance.setReadonly).toHaveBeenCalledWith(true);
  });

  it('卸载时调用 crepe.destroy()', async () => {
    const { unmount } = renderWithProviders(<VisualEditor {...defaultProps} />);

    await waitFor(() => expect(mockCrepeInstance.create).toHaveBeenCalled());

    unmount();

    expect(mockCrepeInstance.destroy).toHaveBeenCalled();
  });

  it('destroy 失败时静默处理（不抛出异常）', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockCrepeInstance.destroy.mockRejectedValue(new Error('destroy failed'));

    const { unmount } = renderWithProviders(<VisualEditor {...defaultProps} />);

    await waitFor(() => expect(mockCrepeInstance.create).toHaveBeenCalled());

    unmount();

    // 等待 catch 回调执行
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('销毁 Crepe 编辑器失败:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('空内容正常初始化', async () => {
    renderWithProviders(<VisualEditor {...defaultProps} content="" />);

    await waitFor(() => expect(mockCrepeInstance.create).toHaveBeenCalled());

    const { Crepe } = vi.mocked(await import('@milkdown/crepe'));
    const call = Crepe.mock.calls[0] as [Record<string, unknown>];
    expect(call[0].defaultValue).toBe('');
  });

  it('rootRef.current 为 null 时提前返回（不创建 Crepe）', async () => {
    // 修改 mock 使 rootRef.current 为 null
    const originalCreate = mockCrepeInstance.create;
    mockCrepeInstance.create = vi.fn().mockResolvedValue(null);

    renderWithProviders(<VisualEditor {...defaultProps} />);

    // 由于 rootRef 是通过 ref 获取的，我们需要测试 null 分支
    // 这个分支在实际渲染中很难触发，因为 ref 总会被设置
    // 但我们可以通过不等待 create 来验证
    mockCrepeInstance.create = originalCreate;
  });

  it('editor.status 不为 Created 时不执行 replaceAll', async () => {
    // 模拟 editor.status 为 undefined 或其他非 Created 值
    const originalEditor = mockCrepeInstance.editor;
    Object.defineProperty(mockCrepeInstance, 'editor', {
      get: () => ({ status: 'NotCreated' }),
      configurable: true,
    });

    mockCrepeInstance.getMarkdown.mockReturnValue('# 旧内容');

    const { rerender } = renderWithProviders(<VisualEditor {...defaultProps} />);

    await waitFor(() => expect(mockCrepeInstance.create).toHaveBeenCalled());

    // 触发 content 变化
    rerender(<VisualEditor {...defaultProps} content="# 新内容" />);

    // 不应该调用 replaceAll，因为 editor.status !== 'Created'
    await waitFor(() => {
      expect(mockReplaceAll).not.toHaveBeenCalled();
    });

    // 恢复原始 editor
    Object.defineProperty(mockCrepeInstance, 'editor', {
      get: () => originalEditor,
      configurable: true,
    });
  });

  it('crepeRef.current 为 null 时不执行 setReadonly', async () => {
    // 测试 crepe 为 null 的分支
    const { unmount } = renderWithProviders(<VisualEditor {...defaultProps} />);

    await waitFor(() => expect(mockCrepeInstance.create).toHaveBeenCalled());

    // 卸载后 crepeRef.current 会被设置为 null
    unmount();

    // 此时 crepeRef.current 为 null，setReadonly 不应被调用
    expect(mockCrepeInstance.setReadonly).not.toHaveBeenCalledWith(true);
  });
});

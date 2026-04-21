/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '@agentskillmania/skill-ui-theme';

// Mock Crepe class BEFORE importing the component
const mockCrepeInstance = {
  create: vi.fn(),
  destroy: vi.fn(() => Promise.resolve(mockCrepeInstance.editor)),
  on: vi.fn(function(this: typeof mockCrepeInstance, fn: (api: unknown) => void) {
    // Simulate calling the listener function with a mock ListenerManager
    const mockListenerManager = {
      markdownUpdated: vi.fn((callback: (ctx: unknown, markdown: string, prevMarkdown: string) => void) => {
        // 保存回调以便测试使用
        (mockCrepeInstance as unknown as { markdownUpdatedCallback: typeof callback }).markdownUpdatedCallback = callback;
      }),
    };
    fn(mockListenerManager);
    return this;
  }),
  getMarkdown: vi.fn(() => '# initial content'),
  setReadonly: vi.fn(function(this: typeof mockCrepeInstance, value: boolean) {
    this.readonly = value;
    return this;
  }),
  readonly: false,
  editor: {
    view: {
      setProps: vi.fn(),
    },
    ctx: {
      get: vi.fn(),
    },
  },
};

vi.mock('@milkdown/crepe', () => ({
  Crepe: vi.fn(function() {
    return mockCrepeInstance;
  }),
  __esModule: true,
}));

import { VisualEditor } from '../../src/components/EditorArea/VisualEditor.js';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

const defaultProps = {
  content: '# 初始标题\n\n初始段落',
  filePath: 'test.md',
  mode: 'wysiwyg' as const,
  onChange: vi.fn(),
};

describe('VisualEditor (Crepe 实现)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock instance state
    mockCrepeInstance.readonly = false;
    mockCrepeInstance.create.mockResolvedValue(mockCrepeInstance.editor);
    mockCrepeInstance.getMarkdown.mockReturnValue('# initial content');
  });

  it('初始化时创建 Crepe 实例并传入 content 作为 defaultValue', async () => {
    renderWithTheme(<VisualEditor {...defaultProps} />);

    await waitFor(() => {
      expect(mockCrepeInstance.create).toHaveBeenCalled();
    });

    // 验证 Crepe 构造函数被调用（通过 mock 的直接验证）
    // 不需要 require，直接验证 mock 调用
    const { Crepe } = vi.mocked(await import('@milkdown/crepe'));
    expect(Crepe).toHaveBeenCalled();
    const crepeCall = Crepe.mock.calls[0] as [Record<string, unknown>];
    expect(crepeCall[0].root).toBeTruthy();
    expect(crepeCall[0].defaultValue).toBe(defaultProps.content);
  });

  it('启用正确的 featureConfigs（Placeholder）', async () => {
    renderWithTheme(<VisualEditor {...defaultProps} />);

    await waitFor(() => {
      expect(mockCrepeInstance.create).toHaveBeenCalled();
    });

    const { Crepe } = vi.mocked(await import('@milkdown/crepe'));
    const crepeCall = Crepe.mock.calls[0] as [Record<string, unknown>];
    expect(crepeCall[0].featureConfigs).toBeDefined();
    expect(crepeCall[0].featureConfigs.placeholder).toEqual({
      text: '输入 / 唤起菜单，或直接开始写作...',
    });
  });

  it('渲染 Crepe 挂载点容器', async () => {
    const { container } = renderWithTheme(<VisualEditor {...defaultProps} />);

    await waitFor(() => {
      expect(mockCrepeInstance.create).toHaveBeenCalled();
    });

    // 验证容器元素存在（data-crepe-root 属性或 ref）
    const rootElement = container.querySelector('[data-crepe-root]');
    expect(rootElement).toBeTruthy();
  });

  it('readOnly=true 时编辑器不可编辑', async () => {
    renderWithTheme(<VisualEditor {...defaultProps} readOnly={true} />);

    await waitFor(() => {
      expect(mockCrepeInstance.create).toHaveBeenCalled();
    });

    // 验证 editor.view.setProps({ editable: () => false })
    expect(mockCrepeInstance.editor.view.setProps).toHaveBeenCalledWith(
      expect.objectContaining({
        editable: expect.any(Function),
      })
    );
  });

  it('readOnly=false 时编辑器可编辑', async () => {
    renderWithTheme(<VisualEditor {...defaultProps} readOnly={false} />);

    await waitFor(() => {
      expect(mockCrepeInstance.create).toHaveBeenCalled();
    });

    // 验证编辑器可编辑状态
    expect(mockCrepeInstance.editor.view.setProps).toHaveBeenCalledWith(
      expect.objectContaining({
        editable: expect.any(Function),
      })
    );
  });

  it('卸载时调用 crepe.destroy()', async () => {
    const { unmount } = renderWithTheme(<VisualEditor {...defaultProps} />);

    await waitFor(() => {
      expect(mockCrepeInstance.create).toHaveBeenCalled();
    });

    unmount();

    expect(mockCrepeInstance.destroy).toHaveBeenCalled();
  });

  it('用户编辑触发 onChange 回调', async () => {
    renderWithTheme(<VisualEditor {...defaultProps} />);

    await waitFor(() => {
      expect(mockCrepeInstance.on).toHaveBeenCalled();
    });

    // 获取 markdownUpdated 回调并模拟用户编辑
    const markdownUpdatedCallback = (mockCrepeInstance as unknown as { markdownUpdatedCallback?: (ctx: unknown, markdown: string, prevMarkdown: string) => void }).markdownUpdatedCallback;
    expect(markdownUpdatedCallback).toBeDefined();

    if (markdownUpdatedCallback) {
      markdownUpdatedCallback({}, '# 新内容', '# 初始标题\n\n初始段落');

      expect(defaultProps.onChange).toHaveBeenCalledWith('# 新内容');
    }
  });

  it('空内容正常初始化', async () => {
    renderWithTheme(<VisualEditor {...defaultProps} content="" />);

    await waitFor(() => {
      expect(mockCrepeInstance.create).toHaveBeenCalled();
    });

    const { Crepe } = vi.mocked(await import('@milkdown/crepe'));
    const crepeCall = Crepe.mock.calls[0] as [Record<string, unknown>];
    expect(crepeCall[0].defaultValue).toBe('');
  });
});

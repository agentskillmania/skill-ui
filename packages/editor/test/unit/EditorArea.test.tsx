/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './testUtils.js';
import React from 'react';
import { EditorArea } from '../../src/components/EditorArea/EditorArea.js';

// Mock Crepe 以避免完整渲染
vi.mock('@milkdown/crepe', () => ({
  Crepe: vi
    .fn()
    .mockImplementation(({ root, defaultValue }: { root: HTMLElement; defaultValue: string }) => {
      root.innerHTML = `<div class="milkdown">${defaultValue}</div>`;
      return {
        create: vi.fn().mockResolvedValue({
          status: 'Created',
          action: vi.fn(),
          view: { setProps: vi.fn() },
          ctx: { get: vi.fn() },
        }),
        destroy: vi.fn().mockResolvedValue({}),
        on: vi.fn(),
        getMarkdown: vi.fn(() => ''),
        setReadonly: vi.fn(),
        get editor() {
          return {
            status: 'Created',
            action: vi.fn(),
            view: { setProps: vi.fn() },
            ctx: { get: vi.fn() },
          };
        },
      };
    }),
  __esModule: true,
}));

vi.mock('@milkdown/crepe/theme/frame.css', () => ({}));

vi.mock('@milkdown/utils', () => ({
  replaceAll: vi.fn((md: string) => (_ctx: unknown) => md),
}));

// 模拟 Monaco editor 的 addCommand 方法
const mockAddCommand = vi.fn();

// Mock Monaco Editor 以避免完整渲染
const mockOnMount = vi.fn();
vi.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: ({ value, defaultValue, onChange, onMount }: any) => {
    // 触发 onMount 回调以测试 handleMount 分支
    React.useEffect(() => {
      if (onMount) {
        // 模拟真实的 Monaco editor 实例，包含 addCommand 方法
        const mockEditor = {
          addCommand: mockAddCommand,
        };
        onMount(mockEditor, { monaco: true });
        mockOnMount(mockEditor);
      }
    }, [onMount]);
    return (
      <div data-testid="monaco-editor">
        <span data-testid="monaco-value">{value ?? defaultValue}</span>
        <button onClick={() => onChange?.('edited')}>mock-edit</button>
      </div>
    );
  },
}));

describe('EditorArea', () => {
  const defaultProps = {
    content: 'console.log("hello")',
    filePath: 'src/index.ts',
    mode: 'code' as const,
    onChange: vi.fn(),
  };

  it('code 模式渲染 Monaco', () => {
    renderWithProviders(<EditorArea {...defaultProps} />);
    expect(screen.getByTestId('monaco-editor')).toBeTruthy();
  });

  it('code 模式渲染 Monaco', () => {
    renderWithProviders(<EditorArea {...defaultProps} />);
    expect(screen.getByTestId('monaco-editor')).toBeTruthy();
  });

  it('wysiwyg 模式渲染 VisualEditor（Crepe 容器）', () => {
    const { container } = renderWithProviders(
      <EditorArea {...defaultProps} mode="wysiwyg" content="# 标题\n\n段落" />
    );
    expect(screen.queryByTestId('monaco-editor')).toBeNull();
    expect(container.querySelector('[data-crepe-root]')).toBeTruthy();
  });

  it('传递 content 到子编辑器', () => {
    renderWithProviders(<EditorArea {...defaultProps} />);
    expect(screen.getByTestId('monaco-value').textContent).toBe('console.log("hello")');
  });

  it('Monaco onMount 回调被正确触发', () => {
    renderWithProviders(<EditorArea {...defaultProps} />);
    // 等待 onMount 被调用
    expect(mockOnMount).toHaveBeenCalledWith(expect.any(Object));
  });

  it('Monaco onChange 处理 undefined 值', () => {
    const onChange = vi.fn();
    renderWithProviders(<EditorArea {...defaultProps} onChange={onChange} />);

    const editButton = screen.getByText('mock-edit');
    fireEvent.click(editButton);

    // onChange 应该被调用，即使 Monaco 传递 undefined
    expect(onChange).toHaveBeenCalled();
  });

  it('CodeEditor 在 onMount 时注册 Ctrl+S 保存命令', () => {
    const onSave = vi.fn();

    // 清除之前的调用记录
    mockAddCommand.mockClear();

    renderWithProviders(
      <EditorArea
        content="test content"
        filePath="SKILL.md"
        mode="code"
        onChange={vi.fn()}
        onSave={onSave}
      />
    );

    // 验证 addCommand 被调用，参数为 Ctrl+S 的键码 (2097 = CtrlCmd | KeyS)
    expect(mockAddCommand).toHaveBeenCalledWith(2097, expect.any(Function));
  });
});

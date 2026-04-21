/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { EditorWrapper } from './testUtils.js';
import { EditorContext, useEditorContext } from '../../src/context/EditorContext.js';

function createMockContext(overrides?: Record<string, unknown>) {
  return {
    editMode: 'code' as const,
    activeFilePath: 'test.ts',
    isDirty: false,
    cursorPosition: null,
    setEditMode: vi.fn(),
    setCursorPosition: vi.fn(),
    setDirty: vi.fn(),
    ...overrides,
  };
}

function createWrapper(mockValue: ReturnType<typeof createMockContext>) {
  return ({ children }: { children: React.ReactNode }) => (
    <EditorWrapper>
      <EditorContext.Provider value={mockValue}>{children}</EditorContext.Provider>
    </EditorWrapper>
  );
}

describe('useEditorContext', () => {
  it('在 SkillEditor 内正常返回上下文', () => {
    const mockValue = createMockContext();
    const { result } = renderHook(() => useEditorContext(), { wrapper: createWrapper(mockValue) });
    expect(result.current.editMode).toBe('code');
    expect(result.current.activeFilePath).toBe('test.ts');
  });

  it('在 SkillEditor 外抛出异常', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <EditorWrapper>{children}</EditorWrapper>
    );
    expect(() => {
      renderHook(() => useEditorContext(), { wrapper });
    }).toThrow('useEditorContext must be used within a SkillEditor');
  });

  it('调用 setEditMode 更新编辑模式', () => {
    const setEditMode = vi.fn();
    const mockValue = createMockContext({ setEditMode });
    const { result } = renderHook(() => useEditorContext(), { wrapper: createWrapper(mockValue) });

    act(() => {
      result.current.setEditMode('preview');
    });
    expect(setEditMode).toHaveBeenCalledWith('preview');
  });

  it('调用 setDirty 更新脏标记', () => {
    const setDirty = vi.fn();
    const mockValue = createMockContext({ setDirty });
    const { result } = renderHook(() => useEditorContext(), { wrapper: createWrapper(mockValue) });

    act(() => {
      result.current.setDirty(true);
    });
    expect(setDirty).toHaveBeenCalledWith(true);
  });

  it('调用 setCursorPosition 更新光标位置', () => {
    const setCursorPosition = vi.fn();
    const mockValue = createMockContext({ setCursorPosition });
    const { result } = renderHook(() => useEditorContext(), { wrapper: createWrapper(mockValue) });

    act(() => {
      result.current.setCursorPosition({ line: 5, column: 10 });
    });
    expect(setCursorPosition).toHaveBeenCalledWith({ line: 5, column: 10 });
  });
});

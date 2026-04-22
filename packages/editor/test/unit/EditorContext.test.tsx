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
  it('returns context normally within SkillEditor', () => {
    const mockValue = createMockContext();
    const { result } = renderHook(() => useEditorContext(), { wrapper: createWrapper(mockValue) });
    expect(result.current.editMode).toBe('code');
    expect(result.current.activeFilePath).toBe('test.ts');
  });

  it('throws error outside SkillEditor', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <EditorWrapper>{children}</EditorWrapper>
    );
    expect(() => {
      renderHook(() => useEditorContext(), { wrapper });
    }).toThrow('useEditorContext must be used within a SkillEditor');
  });

  it('calling setEditMode updates edit mode', () => {
    const setEditMode = vi.fn();
    const mockValue = createMockContext({ setEditMode });
    const { result } = renderHook(() => useEditorContext(), { wrapper: createWrapper(mockValue) });

    act(() => {
      result.current.setEditMode('preview');
    });
    expect(setEditMode).toHaveBeenCalledWith('preview');
  });

  it('calling setDirty updates dirty flag', () => {
    const setDirty = vi.fn();
    const mockValue = createMockContext({ setDirty });
    const { result } = renderHook(() => useEditorContext(), { wrapper: createWrapper(mockValue) });

    act(() => {
      result.current.setDirty(true);
    });
    expect(setDirty).toHaveBeenCalledWith(true);
  });

  it('calling setCursorPosition updates cursor position', () => {
    const setCursorPosition = vi.fn();
    const mockValue = createMockContext({ setCursorPosition });
    const { result } = renderHook(() => useEditorContext(), { wrapper: createWrapper(mockValue) });

    act(() => {
      result.current.setCursorPosition({ line: 5, column: 10 });
    });
    expect(setCursorPosition).toHaveBeenCalledWith({ line: 5, column: 10 });
  });
});

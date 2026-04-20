/** @jsxImportSource @emotion/react */
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '@agentskillmania/skill-ui-theme';
import { EditorContext, useEditorContext } from '../../src/context/EditorContext.js';

describe('useEditorContext', () => {
  it('在 SkillEditor 内正常返回上下文', () => {
    const mockValue = {
      editMode: 'code' as const,
      activeFilePath: 'test.ts',
      isDirty: false,
      cursorPosition: null,
      setEditMode: vi.fn(),
      setCursorPosition: vi.fn(),
      setDirty: vi.fn(),
    };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={lightTheme}>
        <EditorContext.Provider value={mockValue}>{children}</EditorContext.Provider>
      </ThemeProvider>
    );
    const { result } = renderHook(() => useEditorContext(), { wrapper });
    expect(result.current.editMode).toBe('code');
    expect(result.current.activeFilePath).toBe('test.ts');
  });

  it('在 SkillEditor 外抛出异常', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    );
    expect(() => {
      renderHook(() => useEditorContext(), { wrapper });
    }).toThrow('useEditorContext must be used within a SkillEditor');
  });
});

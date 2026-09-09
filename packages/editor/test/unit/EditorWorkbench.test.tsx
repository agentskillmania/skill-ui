/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './testUtils.js';
import { EditorWorkbench } from '../../src/project-editor/EditorWorkbench.js';
import type { FileNode, FileTab } from '@agentskillmania/skill-ui-shared';

beforeEach(() => {
  // 模块级 handler 每测重置:否则拿到上一个测试 render 注册的旧闭包
  registeredSaveHandler = null;
});

// Track save handler registered by CodeEditor handleMount
let registeredSaveHandler: (() => void) | null = null;

vi.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: ({ defaultValue, onChange, onMount }: any) => {
    const React = require('react');
    React.useEffect(() => {
      if (onMount) {
        onMount(
          {
            addCommand: (_keybinding: number, handler: () => void) => {
              registeredSaveHandler = handler;
            },
          },
          {}
        );
      }
    }, []);
    return (
      <div data-testid="monaco-editor">
        <span data-testid="monaco-content">{defaultValue}</span>
        <button data-testid="monaco-change" onClick={() => onChange?.('new content')}>
          change
        </button>
      </div>
    );
  },
}));

const sampleFiles: FileNode[] = [
  { path: 'SKILL.md', content: 'skill content' },
  {
    path: 'src',
    isDirectory: true,
    children: [
      { path: 'src/index.ts', content: 'export {};' },
      { path: 'src/search.ts', content: 'export async function search() { return []; }' },
    ],
  },
  { path: 'package.json', content: '{"name": "test"}' },
];

const baseProps = {
  editorFiles: sampleFiles,
  editorActiveFilePath: 'SKILL.md' as string | null,
  editorActiveFileContent: 'skill content',
  editorOpenTabs: [{ path: 'SKILL.md', label: 'SKILL.md' }] as FileTab[],
  onEditorOpenTabsChange: vi.fn(),
  editorEditMode: 'code' as const,
  onEditorEditModeChange: vi.fn(),
  onEditorFileChange: vi.fn(),
  onEditorActiveFileChange: vi.fn(),
};

describe('EditorWorkbench', () => {
  it('renders editor area and file tree sidebar', () => {
    renderWithProviders(<EditorWorkbench {...baseProps} />);
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    expect(screen.getAllByText('SKILL.md').length).toBeGreaterThanOrEqual(1);
  });

  it('shows empty state when editorActiveFilePath is null', () => {
    renderWithProviders(<EditorWorkbench {...baseProps} editorActiveFilePath={null} />);
    expect(screen.queryByTestId('monaco-editor')).toBeNull();
  });

  it('shows directory hint when selecting a directory file', () => {
    renderWithProviders(<EditorWorkbench {...baseProps} editorActiveFilePath="src" />);
    expect(screen.queryByTestId('monaco-editor')).toBeNull();
  });

  it('calls onEditorFileChange when content is edited', () => {
    const onFileChange = vi.fn();
    renderWithProviders(<EditorWorkbench {...baseProps} onEditorFileChange={onFileChange} />);
    fireEvent.click(screen.getByTestId('monaco-change'));
    expect(onFileChange).toHaveBeenCalledWith('SKILL.md', 'new content');
  });

  it('calls onEditorSave when save shortcut triggered', () => {
    const onSave = vi.fn();
    renderWithProviders(<EditorWorkbench {...baseProps} onEditorSave={onSave} />);
    registeredSaveHandler?.();
    expect(onSave).toHaveBeenCalledWith('SKILL.md', 'skill content');
  });

  it('does not throw when onEditorSave is undefined', () => {
    renderWithProviders(<EditorWorkbench {...baseProps} />);
    expect(() => registeredSaveHandler?.()).not.toThrow();
  });

  it('closes unmodified tab directly and calls callbacks', () => {
    const onTabsChange = vi.fn();
    renderWithProviders(
      <EditorWorkbench
        {...baseProps}
        editorOpenTabs={[
          { path: 'SKILL.md', label: 'SKILL.md' },
          { path: 'package.json', label: 'package.json' },
        ]}
        onEditorOpenTabsChange={onTabsChange}
      />
    );
    const closeButtons = screen.getAllByRole('button', { name: /关闭/ });
    fireEvent.click(closeButtons[1]);
    expect(onTabsChange).toHaveBeenCalledWith([{ path: 'SKILL.md', label: 'SKILL.md' }]);
  });

  it('renders status bar with mode toggle for markdown file', () => {
    renderWithProviders(<EditorWorkbench {...baseProps} editorActiveFilePath="SKILL.md" />);
    // SKILL.md is visual-editable → preview toggle visible
    expect(screen.getByRole('button', { name: /preview|预览/i })).toBeInTheDocument();
  });

  it('renders with nested file path (findFile recursion)', () => {
    renderWithProviders(
      <EditorWorkbench
        {...baseProps}
        editorActiveFilePath="src/index.ts"
        editorActiveFileContent="export {};"
      />
    );
    expect(screen.getByTestId('monaco-content').textContent).toBe('export {};');
  });

  it('handles non-existent file path (findFile returns null)', () => {
    renderWithProviders(
      <EditorWorkbench
        {...baseProps}
        editorActiveFilePath="does/not/exist.ts"
        editorActiveFileContent="x"
      />
    );
    // findFile returns null → activeFileNode is null → editor area renders
    // (same contract as before: non-directory missing node still opens)
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });

  it('toggles sidebar via collapse button', () => {
    renderWithProviders(<EditorWorkbench {...baseProps} />);
    const collapseBtn = screen.getByRole('button', {
      name: /collapse sidebar|收起侧栏/i,
    });
    fireEvent.click(collapseBtn);
    expect(screen.getByRole('button', { name: /expand sidebar|展开侧栏/i })).toBeInTheDocument();
  });
});

/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from './testUtils.js';
import { ProjectEditor } from '../../src/project-editor/ProjectEditor.js';
import type { ProjectFile, FileTab, EditorPanel } from '../../src/types.js';
import { Modal } from 'antd';

beforeEach(() => {
  // 模块级 handler 每测重置:否则拿到上一个测试 render 注册的旧闭包,
  // 102 行的保存测试就依赖了前序测试的执行顺序
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

const sampleFiles: ProjectFile[] = [
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
  editorOpenTabs: [{ path: 'SKILL.md', label: 'SKILL.md', modified: false }] as FileTab[],
  onEditorOpenTabsChange: vi.fn(),
  editorDirtyFilePaths: [] as string[],
  onEditorDirtyChange: vi.fn(),
  editorEditMode: 'code' as const,
  onEditorEditModeChange: vi.fn(),
  editorActivePanel: null as EditorPanel,
  onEditorPanelChange: vi.fn(),
  onEditorFileChange: vi.fn(),
  onEditorSave: vi.fn(),
  onEditorActiveFileChange: vi.fn(),
};

describe('ProjectEditor', () => {
  it('renders editor area and sidebar', () => {
    renderWithProviders(<ProjectEditor {...baseProps} />);
    expect(screen.getByText('预览')).toBeInTheDocument();
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('displays current file name in the editor area', () => {
    renderWithProviders(<ProjectEditor {...baseProps} />);
    const matches = screen.getAllByText('SKILL.md');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('shows empty state when editorActiveFilePath is null', () => {
    renderWithProviders(<ProjectEditor {...baseProps} editorActiveFilePath={null} />);
    expect(screen.getByText('选择一个文件开始编辑')).toBeInTheDocument();
  });

  it('shows directory hint when selecting a directory file', () => {
    renderWithProviders(
      <ProjectEditor {...baseProps} editorActiveFilePath="src" editorActiveFileContent="" />
    );
    expect(screen.getByText('此文件为目录')).toBeInTheDocument();
  });

  it('calls onEditorFileChange when content is edited', () => {
    const onEditorFileChange = vi.fn();
    renderWithProviders(<ProjectEditor {...baseProps} onEditorFileChange={onEditorFileChange} />);
    fireEvent.click(screen.getByTestId('monaco-change'));
    expect(onEditorFileChange).toHaveBeenCalledWith('SKILL.md', 'new content');
  });

  it('calls onEditorSave when save shortcut triggered', () => {
    const onEditorSave = vi.fn();
    renderWithProviders(<ProjectEditor {...baseProps} onEditorSave={onEditorSave} />);
    // Trigger the save handler registered by CodeEditor handleMount
    registeredSaveHandler?.();
    expect(onEditorSave).toHaveBeenCalledWith('SKILL.md', 'skill content');
  });

  it('does not call onEditorFileChange when no active file', () => {
    const onEditorFileChange = vi.fn();
    renderWithProviders(
      <ProjectEditor
        {...baseProps}
        editorActiveFilePath={null}
        onEditorFileChange={onEditorFileChange}
      />
    );
    // No monaco editor should render — no change button
    expect(screen.queryByTestId('monaco-change')).not.toBeInTheDocument();
  });

  it('does not throw when onEditorSave is undefined', () => {
    renderWithProviders(<ProjectEditor {...baseProps} onEditorSave={undefined} />);
    const matches = screen.getAllByText('SKILL.md');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('closes unmodified tab directly and calls callbacks', () => {
    const onEditorOpenTabsChange = vi.fn();
    renderWithProviders(
      <ProjectEditor {...baseProps} onEditorOpenTabsChange={onEditorOpenTabsChange} />
    );
    const closeButtons = screen.getAllByRole('button', { name: /关闭/ });
    fireEvent.click(closeButtons[0]);
    expect(onEditorOpenTabsChange).toHaveBeenCalled();
  });

  it('closing last tab triggers onEditorActiveFileChange(null)', async () => {
    const onEditorActiveFileChange = vi.fn();
    const onEditorOpenTabsChange = vi.fn();
    renderWithProviders(
      <ProjectEditor
        {...baseProps}
        onEditorActiveFileChange={onEditorActiveFileChange}
        onEditorOpenTabsChange={onEditorOpenTabsChange}
      />
    );
    const closeButtons = screen.getAllByRole('button', { name: /关闭/ });
    fireEvent.click(closeButtons[0]);
    await waitFor(() => {
      expect(onEditorActiveFileChange).toHaveBeenCalledWith(null);
    });
  });

  it('shows isDirty status when file is in dirtyFilePaths', () => {
    renderWithProviders(<ProjectEditor {...baseProps} editorDirtyFilePaths={['SKILL.md']} />);
    // StatusBar should reflect dirty state
    expect(screen.getByText('未保存')).toBeInTheDocument();
  });

  it('renders status bar with mode toggle for markdown file', () => {
    renderWithProviders(<ProjectEditor {...baseProps} />);
    // StatusBar shows code mode with preview button (SKILL.md is markdown)
    expect(screen.getByText('预览')).toBeInTheDocument();
  });

  it('renders status bar with cursor position when provided', () => {
    renderWithProviders(
      <ProjectEditor {...baseProps} editorCursorPosition={{ line: 5, column: 10 }} />
    );
    // Ln/Col indicators via i18n
    expect(screen.getByText('行 5, 列 10')).toBeInTheDocument();
  });

  it('switches sidebar panel when editorActivePanel prop changes', () => {
    const { rerender } = renderWithProviders(<ProjectEditor {...baseProps} />);
    // Re-render with activePanel = 'copilot'
    rerender(<ProjectEditor {...baseProps} editorActivePanel="copilot" />);
    // The copilot panel title should now be in the DOM
    expect(screen.getByText('Copilot')).toBeInTheDocument();
  });

  it('renders with nested file path (findFile recursion)', () => {
    renderWithProviders(
      <ProjectEditor
        {...baseProps}
        editorActiveFilePath="src/index.ts"
        editorActiveFileContent="export {};"
      />
    );
    // Should find the nested file and render its content in the editor
    expect(screen.getByTestId('monaco-content')).toHaveTextContent('export {};');
  });

  it('handles non-existent file path (findFile returns null)', () => {
    renderWithProviders(
      <ProjectEditor
        {...baseProps}
        editorActiveFilePath="nonexistent.ts"
        editorActiveFileContent=""
      />
    );
    // When findFile returns null, activeFileNode?.isDirectory is false,
    // so it renders the EditorArea. The editor should still render.
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });

  it('matches file path in directory children via findFile', () => {
    renderWithProviders(
      <ProjectEditor
        {...baseProps}
        editorActiveFilePath="src/search.ts"
        editorActiveFileContent="export async function search() { return []; }"
      />
    );
    // Should find the nested file in children
    expect(screen.getByTestId('monaco-content')).toHaveTextContent(
      'export async function search()'
    );
  });

  it('triggers sidebar collapse via collapse button', () => {
    const onEditorPanelChange = vi.fn();
    const { container } = renderWithProviders(
      <ProjectEditor {...baseProps} onEditorPanelChange={onEditorPanelChange} />
    );
    // Find the collapse toggle button (ChevronLeft icon when expanded)
    const collapseIcon = container.querySelector('svg.lucide-chevron-left');
    expect(collapseIcon).toBeTruthy();
    const collapseBtn = collapseIcon?.closest('button');
    expect(collapseBtn).toBeTruthy();
    fireEvent.click(collapseBtn!);
    // onEditorPanelChange should be called (callback fires on toggle)
    expect(onEditorPanelChange).toHaveBeenCalled();
  });

  it('switches sidebar panel via button click', () => {
    const onEditorPanelChange = vi.fn();
    const { container } = renderWithProviders(
      <ProjectEditor {...baseProps} onEditorPanelChange={onEditorPanelChange} />
    );
    // Find the Copilot panel button (Bot icon)
    const botIcon = container.querySelector('svg.lucide-bot');
    expect(botIcon).toBeTruthy();
    const panelBtn = botIcon?.closest('button');
    expect(panelBtn).toBeTruthy();
    fireEvent.click(panelBtn!);
    // Should call onEditorPanelChange with 'copilot'
    expect(onEditorPanelChange).toHaveBeenCalledWith('copilot');
  });

  describe('dirty tab close with modal', () => {
    const confirmSpy = vi.spyOn(Modal, 'confirm');

    afterEach(() => {
      confirmSpy.mockClear();
    });

    it('shows confirmation modal when closing dirty tab', () => {
      renderWithProviders(<ProjectEditor {...baseProps} editorDirtyFilePaths={['SKILL.md']} />);
      const closeButtons = screen.getAllByRole('button', { name: /关闭/ });
      fireEvent.click(closeButtons[0]);
      expect(confirmSpy).toHaveBeenCalled();
      const config = confirmSpy.mock.calls[0][0];
      expect(config?.title).toBe('关闭确认');
      expect(config?.content).toBe('"SKILL.md" 有未保存的修改，确定要关闭吗？');
    });

    it('does not show modal when closing clean tab', () => {
      renderWithProviders(<ProjectEditor {...baseProps} editorDirtyFilePaths={[]} />);
      const closeButtons = screen.getAllByRole('button', { name: /关闭/ });
      fireEvent.click(closeButtons[0]);
      expect(confirmSpy).not.toHaveBeenCalled();
    });

    it('calls doClose when modal onOk is triggered', () => {
      const onEditorOpenTabsChange = vi.fn();
      const onEditorDirtyChange = vi.fn();
      renderWithProviders(
        <ProjectEditor
          {...baseProps}
          editorDirtyFilePaths={['SKILL.md']}
          onEditorOpenTabsChange={onEditorOpenTabsChange}
          onEditorDirtyChange={onEditorDirtyChange}
        />
      );
      const closeButtons = screen.getAllByRole('button', { name: /关闭/ });
      fireEvent.click(closeButtons[0]);
      // Simulate modal confirm by calling onOk
      const config = confirmSpy.mock.calls[0][0];
      config?.onOk?.();
      expect(onEditorOpenTabsChange).toHaveBeenCalled();
      expect(onEditorDirtyChange).toHaveBeenCalled();
    });
  });
});

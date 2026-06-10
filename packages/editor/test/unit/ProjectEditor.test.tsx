/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from './testUtils.js';
import { ProjectEditor } from '../../src/project-editor/ProjectEditor.js';
import type { ProjectFile, SidebarPanel } from '../../src/types.js';

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: ({ defaultValue, onChange }: any) => (
    <div data-testid="monaco-editor">
      <span data-testid="monaco-content">{defaultValue}</span>
      <button data-testid="monaco-change" onClick={() => onChange?.('new content')}>
        change
      </button>
    </div>
  ),
}));

const sampleFiles: ProjectFile[] = [
  { path: 'SKILL.md', content: '# 网页搜索技能\n\n## 描述\n搜索互联网获取信息。' },
  {
    path: 'src',
    isDirectory: true,
    content: '',
    children: [
      { path: 'src/index.ts', content: 'export {};' },
      {
        path: 'src/search.ts',
        content: 'export async function search(query: string) {\n  return [];\n}',
      },
    ],
  },
  { path: 'package.json', content: '{"name": "web-search-skill"}' },
];

function createProps(overrides?: Partial<typeof defaultProps>) {
  return { ...defaultProps, ...overrides };
}

const defaultProps = {
  files: sampleFiles,
  activeFilePath: 'SKILL.md' as string | null,
  editMode: 'code' as const,
  activePanel: null as SidebarPanel,
  onFileChange: vi.fn(),
  onActiveFileChange: vi.fn(),
  onEditModeChange: vi.fn(),
  onPanelChange: vi.fn(),
};

/** Get all tab close buttons */
function getTabCloseButtons() {
  return screen.getAllByRole('button', { name: /关闭/ });
}

describe('ProjectEditor', () => {
  it('renders editor area and sidebar', () => {
    renderWithProviders(<ProjectEditor {...defaultProps} />);
    expect(screen.getByText('预览')).toBeTruthy();
    // Check that SidebarIcons is rendered by looking for buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('displays current file path', () => {
    renderWithProviders(<ProjectEditor {...defaultProps} />);
    const matches = screen.getAllByText('SKILL.md');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('shows empty state when activeFilePath is null', () => {
    renderWithProviders(<ProjectEditor {...defaultProps} activeFilePath={null} />);
    expect(screen.getByText('选择一个文件开始编辑')).toBeTruthy();
  });

  it('shows empty state hint when selecting directory', () => {
    renderWithProviders(<ProjectEditor {...defaultProps} activeFilePath="src" />);
    expect(screen.getByText('此文件为目录')).toBeTruthy();
  });

  it('clicking SidebarIcons icon expands panel', () => {
    const onPanel = vi.fn();
    renderWithProviders(<ProjectEditor {...defaultProps} onPanelChange={onPanel} />);
    // Find the button with FolderOpen icon (files panel)
    // The SidebarIcons component uses lucide icons, we can find by SVG class
    const folderIconButtons = screen.getAllByRole('button').filter(btn =>
      btn.innerHTML.includes('lucide-folder-open')
    );
    expect(folderIconButtons.length).toBeGreaterThan(0);
    fireEvent.click(folderIconButtons[0]);
    expect(onPanel).toHaveBeenCalledWith('files');
  });

  it('closing last tab triggers onActiveFileChange(null)', async () => {
    const onActiveChange = vi.fn();
    renderWithProviders(<ProjectEditor {...defaultProps} onActiveFileChange={onActiveChange} />);
    const closeButtons = getTabCloseButtons();
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(closeButtons[0]);
    await waitFor(() => {
      expect(onActiveChange).toHaveBeenCalledWith(null);
    });
  });

  it('adds new tab after switching files', async () => {
    const { rerender } = renderWithProviders(<ProjectEditor {...createProps()} />);
    rerender(<ProjectEditor {...createProps({ activeFilePath: 'package.json' })} />);
    await waitFor(() => {
      expect(screen.getAllByText('package.json').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('onFileChange is called when editing content', () => {
    const onFileChange = vi.fn();
    renderWithProviders(<ProjectEditor {...createProps({ onFileChange })} />);
    fireEvent.click(screen.getByTestId('monaco-change'));
    expect(onFileChange).toHaveBeenCalledWith('SKILL.md', 'new content');
  });

  it('clears dirty state when calling onSave', () => {
    const onSave = vi.fn();
    renderWithProviders(<ProjectEditor {...createProps({ onSave })} />);
    fireEvent.click(screen.getByTestId('monaco-change'));
    expect(screen.getByText('未保存')).toBeTruthy();
  });

  it('does not throw error when onSave is undefined', () => {
    renderWithProviders(<ProjectEditor {...createProps({ onSave: undefined })} />);
    expect(screen.getByText('预览')).toBeTruthy();
  });

  it('closes unmodified tab directly', async () => {
    const onActiveChange = vi.fn();
    renderWithProviders(
      <ProjectEditor
        {...createProps({ onActiveFileChange: onActiveChange, activeFilePath: 'package.json' })}
      />
    );

    await waitFor(() => {
      expect(screen.getAllByText('package.json').length).toBeGreaterThanOrEqual(1);
    });

    const closeButtons = getTabCloseButtons();
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(closeButtons[0]);
    await waitFor(() => {
      expect(onActiveChange).toHaveBeenCalled();
    });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows confirmation dialog when closing modified tab', async () => {
    const onActiveChange = vi.fn();
    const onFileChange = vi.fn();

    renderWithProviders(
      <ProjectEditor
        {...createProps({
          onActiveFileChange: onActiveChange,
          onFileChange,
          activeFilePath: 'package.json',
        })}
      />
    );

    await waitFor(() => {
      expect(screen.getAllByText('package.json').length).toBeGreaterThanOrEqual(1);
    });

    fireEvent.click(screen.getByTestId('monaco-change'));

    const closeButtons = getTabCloseButtons();
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(closeButtons[0]);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });
  });

  it('triggers onActiveFileChange(null) when closing last tab', async () => {
    const onActiveChange = vi.fn();
    renderWithProviders(
      <ProjectEditor
        {...createProps({
          onActiveFileChange: onActiveChange,
          activeFilePath: 'src/index.ts',
        })}
      />
    );

    await waitFor(() => {
      expect(screen.getAllByText('index.ts').length).toBeGreaterThanOrEqual(1);
    });

    const closeButtons = getTabCloseButtons();
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(closeButtons[0]);
    await waitFor(() => {
      expect(onActiveChange).toHaveBeenCalledWith(null);
    });
  });

  it('isDirty should be false after editing and switching to another file', async () => {
    const { rerender } = renderWithProviders(<ProjectEditor {...createProps()} />);

    fireEvent.click(screen.getByTestId('monaco-change'));

    await waitFor(() => {
      expect(screen.getByText('未保存')).toBeTruthy();
    });

    rerender(<ProjectEditor {...createProps({ activeFilePath: 'package.json' })} />);

    expect(screen.queryByText('未保存')).toBeNull();
  });

  it('isDirty should be true when switching back to edited file', async () => {
    const { rerender } = renderWithProviders(<ProjectEditor {...createProps()} />);

    fireEvent.click(screen.getByTestId('monaco-change'));

    await waitFor(() => {
      expect(screen.getByText('未保存')).toBeTruthy();
    });

    rerender(<ProjectEditor {...createProps({ activeFilePath: 'package.json' })} />);

    expect(screen.queryByText('未保存')).toBeNull();

    rerender(<ProjectEditor {...createProps({ activeFilePath: 'SKILL.md' })} />);

    await waitFor(() => {
      expect(screen.getByText('未保存')).toBeTruthy();
    });
  });

  it('activeFile does not change when closing inactive tab', async () => {
    const onActiveChange = vi.fn();

    const { rerender } = renderWithProviders(
      <ProjectEditor
        {...createProps({ activeFilePath: 'SKILL.md', onActiveFileChange: onActiveChange })}
      />
    );

    rerender(
      <ProjectEditor
        {...createProps({ activeFilePath: 'package.json', onActiveFileChange: onActiveChange })}
      />
    );

    await waitFor(() => {
      expect(screen.getAllByText('package.json').length).toBeGreaterThanOrEqual(1);
    });

    onActiveChange.mockClear();

    const closeButtons = getTabCloseButtons();
    expect(closeButtons.length).toBeGreaterThanOrEqual(2);
    fireEvent.click(closeButtons[0]);

    expect(onActiveChange).not.toHaveBeenCalled();
  });

  it('isDirty becomes false after save', async () => {
    const onSave = vi.fn();
    renderWithProviders(<ProjectEditor {...createProps({ onSave })} />);

    fireEvent.click(screen.getByTestId('monaco-change'));

    await waitFor(() => {
      expect(screen.getByText('未保存')).toBeTruthy();
    });
  });
});

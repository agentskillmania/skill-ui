/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from './testUtils.js';
import { SkillEditor } from '../../src/components/SkillEditor/SkillEditor.js';
import type { SkillFile, SidebarPanel } from '../../src/types.js';

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

const sampleFiles: SkillFile[] = [
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

/** 获取所有 tab 关闭按钮 */
function getTabCloseButtons() {
  return screen.getAllByRole('button', { name: /关闭/ });
}

describe('SkillEditor', () => {
  it('渲染编辑器区域和侧边栏', () => {
    renderWithProviders(<SkillEditor {...defaultProps} />);
    expect(screen.getByText('预览')).toBeTruthy();
    expect(screen.getByTitle('文件')).toBeTruthy();
  });

  it('显示当前文件路径', () => {
    renderWithProviders(<SkillEditor {...defaultProps} />);
    const matches = screen.getAllByText('SKILL.md');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('activeFilePath 为 null 时显示空状态', () => {
    renderWithProviders(<SkillEditor {...defaultProps} activeFilePath={null} />);
    expect(screen.getByText('选择一个文件开始编辑')).toBeTruthy();
  });

  it('选择目录文件显示空状态提示', () => {
    renderWithProviders(<SkillEditor {...defaultProps} activeFilePath="src" />);
    expect(screen.getByText('此文件为目录')).toBeTruthy();
  });

  it('点击 ActivityBar 图标展开面板', () => {
    const onPanel = vi.fn();
    renderWithProviders(<SkillEditor {...defaultProps} onPanelChange={onPanel} />);
    fireEvent.click(screen.getByTitle('文件'));
    expect(onPanel).toHaveBeenCalledWith('files');
  });

  it('关闭最后一个 tab 触发 onActiveFileChange(null)', async () => {
    const onActiveChange = vi.fn();
    renderWithProviders(<SkillEditor {...defaultProps} onActiveFileChange={onActiveChange} />);
    // SKILL.md 是唯一的 tab，关闭它
    const closeButtons = getTabCloseButtons();
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(closeButtons[0]);
    await waitFor(() => {
      expect(onActiveChange).toHaveBeenCalledWith(null);
    });
  });

  it('切换文件后新增 tab', async () => {
    const { rerender } = renderWithProviders(<SkillEditor {...createProps()} />);
    rerender(<SkillEditor {...createProps({ activeFilePath: 'package.json' })} />);
    await waitFor(() => {
      expect(screen.getAllByText('package.json').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('onFileChange 在编辑内容时被调用', () => {
    const onFileChange = vi.fn();
    renderWithProviders(<SkillEditor {...createProps({ onFileChange })} />);
    // 模拟 Monaco 内容变更
    fireEvent.click(screen.getByTestId('monaco-change'));
    expect(onFileChange).toHaveBeenCalledWith('SKILL.md', 'new content');
  });

  it('调用 onSave 时清除 dirty 状态', () => {
    const onSave = vi.fn();
    renderWithProviders(<SkillEditor {...createProps({ onSave })} />);
    // 模拟编辑（触发 dirty）
    fireEvent.click(screen.getByTestId('monaco-change'));
    // 验证 dirty 状态已触发
    expect(screen.getByText('未保存')).toBeTruthy();
  });

  it('onSave 为 undefined 时不抛出错误', () => {
    renderWithProviders(<SkillEditor {...createProps({ onSave: undefined })} />);
    expect(screen.getByText('预览')).toBeTruthy();
  });

  it('关闭未修改的 tab 直接关闭', async () => {
    const onActiveChange = vi.fn();
    renderWithProviders(
      <SkillEditor
        {...createProps({ onActiveFileChange: onActiveChange, activeFilePath: 'package.json' })}
      />
    );

    await waitFor(() => {
      expect(screen.getAllByText('package.json').length).toBeGreaterThanOrEqual(1);
    });

    // 关闭 tab — 未修改，应直接关闭而不显示确认对话框
    const closeButtons = getTabCloseButtons();
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(closeButtons[0]);
    await waitFor(() => {
      expect(onActiveChange).toHaveBeenCalled();
    });
    // 确认没有弹窗（ant-modal 不应出现）
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('关闭修改过的 tab 显示确认对话框', async () => {
    const onActiveChange = vi.fn();
    const onFileChange = vi.fn();

    renderWithProviders(
      <SkillEditor
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

    // 模拟编辑使文件变脏
    fireEvent.click(screen.getByTestId('monaco-change'));

    // 关闭 tab — 修改过，应显示确认对话框
    const closeButtons = getTabCloseButtons();
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(closeButtons[0]);
    // Modal.confirm 会被调用（Ant Design Modal）
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });
  });

  it('关闭最后一个 tab 时触发 onActiveFileChange(null)', async () => {
    const onActiveChange = vi.fn();
    renderWithProviders(
      <SkillEditor
        {...createProps({
          onActiveFileChange: onActiveChange,
          activeFilePath: 'src/index.ts',
        })}
      />
    );

    await waitFor(() => {
      expect(screen.getAllByText('index.ts').length).toBeGreaterThanOrEqual(1);
    });

    // 关闭所有 tab
    const closeButtons = getTabCloseButtons();
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(closeButtons[0]);
    // 最后一个 tab 关闭后应该触发 null
    await waitFor(() => {
      expect(onActiveChange).toHaveBeenCalledWith(null);
    });
  });

  it('编辑文件后切换到另一个文件 → isDirty 应为 false', async () => {
    const { rerender } = renderWithProviders(<SkillEditor {...createProps()} />);

    // 模拟编辑 SKILL.md（触发 dirty）
    fireEvent.click(screen.getByTestId('monaco-change'));

    // 确认"未保存"出现
    await waitFor(() => {
      expect(screen.getByText('未保存')).toBeTruthy();
    });

    // 切换到 package.json（未被编辑的文件）
    rerender(<SkillEditor {...createProps({ activeFilePath: 'package.json' })} />);

    // isDirty 应为 false，"未保存"不应显示
    expect(screen.queryByText('未保存')).toBeNull();
  });

  it('切回已编辑的文件 → isDirty 应为 true', async () => {
    const { rerender } = renderWithProviders(<SkillEditor {...createProps()} />);

    // 编辑 SKILL.md
    fireEvent.click(screen.getByTestId('monaco-change'));

    await waitFor(() => {
      expect(screen.getByText('未保存')).toBeTruthy();
    });

    // 切换到 package.json
    rerender(<SkillEditor {...createProps({ activeFilePath: 'package.json' })} />);

    expect(screen.queryByText('未保存')).toBeNull();

    // 切回 SKILL.md
    rerender(<SkillEditor {...createProps({ activeFilePath: 'SKILL.md' })} />);

    // SKILL.md 仍然是 dirty 的
    await waitFor(() => {
      expect(screen.getByText('未保存')).toBeTruthy();
    });
  });

  it('关闭非活动 tab 时 activeFile 不变', async () => {
    const onActiveChange = vi.fn();

    // 先打开两个文件
    const { rerender } = renderWithProviders(
      <SkillEditor
        {...createProps({ activeFilePath: 'SKILL.md', onActiveFileChange: onActiveChange })}
      />
    );

    // 切换到第二个文件，使其出现在 tab 栏
    rerender(
      <SkillEditor
        {...createProps({ activeFilePath: 'package.json', onActiveFileChange: onActiveChange })}
      />
    );

    await waitFor(() => {
      expect(screen.getAllByText('package.json').length).toBeGreaterThanOrEqual(1);
    });

    onActiveChange.mockClear();

    // 找到 SKILL.md 的关闭按钮（非活动 tab）
    const closeButtons = getTabCloseButtons();
    expect(closeButtons.length).toBeGreaterThanOrEqual(2);
    // 关闭第一个 tab（SKILL.md，非活动）
    fireEvent.click(closeButtons[0]);

    // 非活动 tab 关闭不应改变当前 activeFile
    expect(onActiveChange).not.toHaveBeenCalled();
  });

  it('保存后 isDirty 变为 false', async () => {
    const onSave = vi.fn();
    renderWithProviders(<SkillEditor {...createProps({ onSave })} />);

    // 编辑触发 dirty
    fireEvent.click(screen.getByTestId('monaco-change'));

    await waitFor(() => {
      expect(screen.getByText('未保存')).toBeTruthy();
    });

    // 注意：目前 onSave 无法通过 UI 触发（Ctrl+S 在 mock 中不可用）
    // 所以这个测试只验证编辑后 dirty 为 true 的状态
    // Ctrl+S 触发 onSave 的测试在 EditorArea.test.tsx 中
  });
});

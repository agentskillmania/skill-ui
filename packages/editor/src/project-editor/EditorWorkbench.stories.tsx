/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, useCallback } from 'react';
import { EditorWorkbench } from './EditorWorkbench.js';
import type { EditMode, CursorPosition } from '../types.js';
import type { FileNode, FileTab } from '@agentskillmania/skill-ui-shared';

const sampleFiles: FileNode[] = [
  {
    path: 'SKILL.md',
    content:
      '# 网页搜索技能\n\n## 描述\n搜索互联网获取信息。\n\n## 步骤\n1. 接收用户查询\n2. 调用搜索 API\n3. 整理结果返回',
  },
  {
    path: 'README.md',
    content: '# README\n\n使用说明。',
  },
  {
    path: 'src',
    isDirectory: true,
    content: '',
    children: [
      { path: 'src/index.ts', content: 'export { search } from "./search.js";\n' },
      {
        path: 'src/search.ts',
        content:
          'export async function search(query: string) {\n  // TODO: implement\n  return [];\n}\n',
      },
    ],
  },
  { path: 'package.json', content: '{\n  "name": "web-search-skill",\n  "version": "1.0.0"}\n' },
];

const meta: Meta<typeof EditorWorkbench> = {
  title: 'Editor/EditorWorkbench',
  component: EditorWorkbench,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EditorWorkbench>;

export const Interactive: Story = {
  render: () => {
    const [activeFilePath, setActiveFilePath] = useState<string | null>('SKILL.md');
    const [mode, setMode] = useState<EditMode>('code');
    const [openTabs, setOpenTabs] = useState<FileTab[]>([
      { path: 'SKILL.md', label: 'SKILL.md', modified: false },
    ]);
    const [dirtyPaths, setDirtyPaths] = useState<string[]>([]);
    const [cursorPosition, setCursorPosition] = useState<CursorPosition | null>({
      line: 1,
      column: 1,
    });
    const [contents, setContents] = useState<Record<string, string>>(() =>
      Object.fromEntries(
        sampleFiles.filter((f) => !f.isDirectory).map((f) => [f.path, f.content ?? ''])
      )
    );

    const handleActiveFileChange = useCallback((path: string | null) => {
      setActiveFilePath(path);
      if (path) {
        setOpenTabs((prev) =>
          prev.some((t) => t.path === path)
            ? prev
            : [...prev, { path, label: path.split('/').pop() ?? path }]
        );
      }
    }, []);

    const handleFileChange = useCallback((path: string, content: string) => {
      setContents((prev) => ({ ...prev, [path]: content }));
      setDirtyPaths((prev) => (prev.includes(path) ? prev : [...prev, path]));
    }, []);

    const handleSave = useCallback((path: string) => {
      setDirtyPaths((prev) => prev.filter((p) => p !== path));
    }, []);

    const handleTabsChange = useCallback((tabs: FileTab[]) => {
      setOpenTabs(tabs);
    }, []);

    return (
      <div
        style={{ height: 560, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}
      >
        <EditorWorkbench
          editorFiles={sampleFiles}
          editorActiveFilePath={activeFilePath}
          editorActiveFileContent={activeFilePath ? (contents[activeFilePath] ?? '') : ''}
          editorOpenTabs={openTabs}
          onEditorOpenTabsChange={handleTabsChange}
          editorDirtyFilePaths={dirtyPaths}
          onEditorDirtyChange={setDirtyPaths}
          editorCursorPosition={cursorPosition}
          onEditorCursorChange={setCursorPosition}
          editorEditMode={mode}
          onEditorEditModeChange={setMode}
          onEditorFileChange={handleFileChange}
          onEditorSave={handleSave}
          onEditorActiveFileChange={handleActiveFileChange}
        />
      </div>
    );
  },
};

/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, useCallback } from 'react';
import { ProjectEditor } from './ProjectEditor.js';
import type { ProjectFile, EditMode, EditorPanel, FileTab, TestCase, ReviewItem } from '../types.js';

const sampleFiles: ProjectFile[] = [
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

const sampleTestCases: TestCase[] = [
  { id: 'tc1', name: '基本问候', status: 'passed', duration: 120 },
  { id: 'tc2', name: '搜索功能', status: 'failed', duration: 350, error: '未调用搜索工具' },
];

const sampleReviewItems: ReviewItem[] = [
  { id: 'r1', source: 'lint', severity: 'info', message: '描述清晰', timestamp: Date.now() },
  { id: 'r2', source: 'lint', severity: 'info', message: '步骤完整', timestamp: Date.now() },
  {
    id: 'r3',
    source: 'agent',
    severity: 'warning',
    message: '建议补充错误处理',
    detail: '当前未处理 API 超时场景',
    timestamp: Date.now(),
  },
  {
    id: 'r4',
    source: 'agent',
    severity: 'error',
    message: '未定义超时策略',
    timestamp: Date.now(),
  },
];

const meta: Meta<typeof ProjectEditor> = {
  title: 'Editor/ProjectEditor',
  component: ProjectEditor,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProjectEditor>;

export const Interactive: Story = {
  render: () => {
    const [activeFilePath, setActiveFilePath] = useState<string | null>('SKILL.md');
    const [mode, setMode] = useState<EditMode>('code');
    const [panel, setPanel] = useState<EditorPanel>(null);
    const [openTabs, setOpenTabs] = useState<FileTab[]>([
      { path: 'SKILL.md', label: 'SKILL.md', modified: false },
    ]);
    const [dirtyFilePaths, setDirtyFilePaths] = useState<string[]>([]);
    const [copilotInput, setCopilotInput] = useState('');

    const [fileContents, setFileContents] = useState<Record<string, string>>(() => {
      const map: Record<string, string> = {};
      function walk(files: ProjectFile[]) {
        for (const f of files) {
          if (!f.isDirectory && f.content) map[f.path] = f.content;
          if (f.children) walk(f.children);
        }
      }
      walk(sampleFiles);
      return map;
    });

    const handleFileChange = useCallback((path: string, content: string) => {
      setFileContents((prev) => ({ ...prev, [path]: content }));
      setDirtyFilePaths((prev) => (prev.includes(path) ? prev : [...prev, path]));
    }, []);

    const handleActiveFileChange = useCallback((path: string | null) => {
      setActiveFilePath(path);
      if (path) {
        setOpenTabs((prev) => {
          const exists = prev.some((tab) => tab.path === path);
          if (exists) return prev;
          return [...prev, { path, label: path.split('/').pop() ?? path, modified: false }];
        });
      }
    }, []);

    const handleSave = useCallback((path: string, _content: string) => {
      setDirtyFilePaths((prev) => prev.filter((p) => p !== path));
      setOpenTabs((prev) =>
        prev.map((tab) => (tab.path === path ? { ...tab, modified: false } : tab))
      );
    }, []);

    const activeFileContent = activeFilePath ? (fileContents[activeFilePath] ?? '') : '';

    return (
      <div
        style={{
          height: 600,
          width: '100%',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <ProjectEditor
          editorFiles={sampleFiles}
          editorActiveFilePath={activeFilePath}
          editorActiveFileContent={activeFileContent}
          editorOpenTabs={openTabs}
          onEditorOpenTabsChange={setOpenTabs}
          editorDirtyFilePaths={dirtyFilePaths}
          onEditorDirtyChange={setDirtyFilePaths}
          editorEditMode={mode}
          onEditorEditModeChange={setMode}
          editorActivePanel={panel}
          onEditorPanelChange={setPanel}
          onEditorFileChange={handleFileChange}
          onEditorSave={handleSave}
          onEditorActiveFileChange={handleActiveFileChange}
          testCases={sampleTestCases}
          reviewItems={sampleReviewItems}
          copilotInputValue={copilotInput}
          onCopilotInputChange={setCopilotInput}
          copilotCommands={[
            { id: 'generate', label: '生成技能', command: '帮我生成一个' },
            { id: 'search', label: '查找类似', command: '帮我查找类似的技能' },
          ]}
        />
      </div>
    );
  },
};

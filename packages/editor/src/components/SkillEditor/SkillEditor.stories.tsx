/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, useCallback } from 'react';
import { SkillEditor } from './SkillEditor.js';
import type { SkillFile, EditMode, SidebarPanel } from '../../types.js';

const sampleFiles: SkillFile[] = [
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
  { path: 'package.json', content: '{\n  "name": "web-search-skill",\n  "version": "1.0.0"\n}\n' },
];

const meta: Meta<typeof SkillEditor> = {
  title: 'Editor/SkillEditor',
  component: SkillEditor,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SkillEditor>;

export const Interactive: Story = {
  render: () => {
    const [activeFile, setActiveFile] = useState<string | null>('SKILL.md');

    const [mode, setMode] = useState<EditMode>('code');
    const [panel, setPanel] = useState<SidebarPanel>(null);

    const [fileContents, setFileContents] = useState<Record<string, string>>(() => {
      const map: Record<string, string> = {};
      function walk(files: SkillFile[]) {
        for (const f of files) {
          if (!f.isDirectory) map[f.path] = f.content;
          if (f.children) walk(f.children);
        }
      }
      walk(sampleFiles);
      return map;
    });

    const filesWithContent = useCallback((): SkillFile[] => {
      function walk(files: SkillFile[]): SkillFile[] {
        return files.map((f) => {
          if (f.isDirectory) return { ...f, children: f.children ? walk(f.children) : undefined };
          return { ...f, content: fileContents[f.path] ?? f.content };
        });
      }
      return walk(sampleFiles);
    }, [fileContents]);

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
        <SkillEditor
          files={filesWithContent()}
          activeFilePath={activeFile}
          editMode={mode}
          activePanel={panel}
          onFileChange={(path, content) =>
            setFileContents((prev) => ({ ...prev, [path]: content }))
          }
          onActiveFileChange={setActiveFile}
          onEditModeChange={setMode}
          onPanelChange={setPanel}
          testCases={[
            { id: 'tc1', name: '基本问候', input: '你好' },
            { id: 'tc2', name: '搜索功能', input: '搜索 TypeScript' },
          ]}
          testResults={[
            { caseId: 'tc1', passed: true, duration: 120 },
            { caseId: 'tc2', passed: false, failureReason: '未调用搜索工具', duration: 350 },
          ]}
          reviewResult={{
            score: 85,
            items: [
              { status: 'pass', label: '描述清晰' },
              { status: 'pass', label: '步骤完整' },
              { status: 'warn', label: '建议补充错误处理', detail: '当前未处理 API 超时场景' },
              { status: 'fail', label: '未定义超时策略' },
            ],
          }}
          assistantCommands={[
            { id: 'generate', label: '生成技能', command: '帮我生成一个' },
            { id: 'search', label: '查找类似', command: '帮我查找类似的技能' },
          ]}
        />
      </div>
    );
  },
};

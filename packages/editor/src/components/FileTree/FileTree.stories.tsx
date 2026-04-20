/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { FileTree } from './FileTree.js';
import type { SkillFile } from '../../types.js';

const sampleFiles: SkillFile[] = [
  { path: 'SKILL.md', content: '# 我的技能\n\n这是一个示例技能。' },
  { path: 'README.md', content: '# README' },
  {
    path: 'src',
    isDirectory: true,
    content: '',
    children: [
      { path: 'src/index.ts', content: 'export default function() {}' },
      { path: 'src/utils.ts', content: 'export function helper() {}' },
      {
        path: 'src/components',
        isDirectory: true,
        content: '',
        children: [
          { path: 'src/components/App.tsx', content: 'export function App() {}' },
          { path: 'src/components/Button.tsx', content: 'export function Button() {}' },
        ],
      },
    ],
  },
  { path: 'package.json', content: '{"name": "my-skill"}' },
  {
    path: 'scripts',
    isDirectory: true,
    content: '',
    children: [{ path: 'scripts/setup.sh', content: '#!/bin/bash' }],
  },
];

const meta: Meta<typeof FileTree> = {
  title: 'Editor/FileTree',
  component: FileTree,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FileTree>;

export const Default: Story = {
  render: () => {
    const [active, setActive] = useState<string | null>('src/index.ts');
    return (
      <div
        style={{ height: 400, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}
      >
        <div style={{ padding: 8, fontSize: 12, color: '#666', borderBottom: '1px solid #e5e7eb' }}>
          当前选中: {active ?? '无'}
        </div>
        <FileTree files={sampleFiles} activeFilePath={active} onSelect={setActive} />
      </div>
    );
  },
};

export const Empty: Story = {
  render: () => {
    const [active, setActive] = useState<string | null>(null);
    return (
      <div style={{ height: 200, border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <FileTree files={[]} activeFilePath={active} onSelect={setActive} />
      </div>
    );
  },
};

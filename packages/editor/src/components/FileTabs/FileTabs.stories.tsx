/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { FileTabs } from './FileTabs.js';
import type { FileTab } from '../../types.js';

const initialTabs: FileTab[] = [
  { path: 'SKILL.md', label: 'SKILL.md' },
  { path: 'src/index.ts', label: 'index.ts', modified: true },
  { path: 'src/utils.ts', label: 'utils.ts' },
  { path: 'package.json', label: 'package.json' },
];

const meta: Meta<typeof FileTabs> = {
  title: 'Editor/FileTabs',
  component: FileTabs,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FileTabs>;

export const Default: Story = {
  render: () => {
    const [tabs, setTabs] = useState<FileTab[]>(initialTabs);
    const [active, setActive] = useState<string | null>('src/index.ts');

    const handleClose = (path: string) => {
      setTabs((prev) => prev.filter((t) => t.path !== path));
      if (active === path) {
        const remaining = tabs.filter((t) => t.path !== path);
        setActive(remaining.length > 0 ? remaining[remaining.length - 1].path : null);
      }
    };

    return (
      <div>
        <div style={{ padding: 8, fontSize: 12, color: '#666', marginBottom: 8 }}>
          当前激活: {active ?? '无'} | 标签数: {tabs.length}
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <FileTabs
            tabs={tabs}
            activePath={active}
            onTabChange={setActive}
            onTabClose={handleClose}
          />
          <div style={{ padding: 16, fontSize: 12, color: '#999' }}>
            点击标签切换，点 × 关闭标签
          </div>
        </div>
      </div>
    );
  },
};

export const ManyTabs: Story = {
  render: () => {
    const manyTabs: FileTab[] = [
      { path: 'SKILL.md', label: 'SKILL.md' },
      { path: 'src/index.ts', label: 'index.ts', modified: true },
      { path: 'src/utils.ts', label: 'utils.ts' },
      { path: 'src/components/App.tsx', label: 'App.tsx' },
      { path: 'src/components/Button.tsx', label: 'Button.tsx', modified: true },
      { path: 'package.json', label: 'package.json' },
      { path: 'tsconfig.json', label: 'tsconfig.json' },
      { path: 'README.md', label: 'README.md' },
    ];
    const [tabs, setTabs] = useState(manyTabs);
    const [active, setActive] = useState<string | null>('src/components/App.tsx');

    const handleClose = (path: string) => {
      setTabs((prev) => prev.filter((t) => t.path !== path));
      if (active === path) {
        const remaining = tabs.filter((t) => t.path !== path);
        setActive(remaining.length > 0 ? remaining[remaining.length - 1].path : null);
      }
    };

    return (
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <FileTabs
          tabs={tabs}
          activePath={active}
          onTabChange={setActive}
          onTabClose={handleClose}
        />
        <div style={{ padding: 16, fontSize: 12, color: '#999' }}>
          激活: {active} | 标签弹性收缩
        </div>
      </div>
    );
  },
};

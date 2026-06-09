/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { StatusBar } from './StatusBar.js';
import type { EditMode } from '../../types.js';

const meta: Meta<typeof StatusBar> = {
  title: 'Editor/StatusBar',
  component: StatusBar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StatusBar>;

export const Default: Story = {
  render: () => {
    const [mode, setMode] = useState<EditMode>('code');
    const [dirty, setDirty] = useState(false);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 12, color: '#666' }}>
          模式: {mode} | 未保存: {dirty ? '是' : '否'}
          <button onClick={() => setDirty((d) => !d)} style={{ marginLeft: 8, fontSize: 12 }}>
            切换脏状态
          </button>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
          <StatusBar
            filePath="src/index.ts"
            editMode={mode}
            cursorPosition={{ line: 12, column: 34 }}
            isDirty={dirty}
            onEditModeChange={setMode}
          />
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
          <StatusBar
            filePath="SKILL.md"
            editMode={mode}
            cursorPosition={null}
            isDirty={false}
            onEditModeChange={setMode}
          />
        </div>
      </div>
    );
  },
};

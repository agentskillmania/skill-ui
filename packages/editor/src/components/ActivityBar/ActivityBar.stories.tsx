/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ActivityBar } from './ActivityBar.js';
import type { SidebarPanel } from '../../types.js';

const meta: Meta<typeof ActivityBar> = {
  title: 'Editor/ActivityBar',
  component: ActivityBar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ActivityBar>;

export const Default: Story = {
  render: () => {
    const [active, setActive] = useState<SidebarPanel>(null);
    return (
      <div
        style={{
          height: 400,
          display: 'flex',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <div style={{ flex: 1, padding: 16, fontSize: 12, color: '#666' }}>
          当前面板: {active ?? '无'}（点击图标切换，再点收起）
        </div>
        <ActivityBar activePanel={active} onPanelChange={setActive} />
      </div>
    );
  },
};

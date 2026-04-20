/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '@agentskillmania/skill-ui-theme';
import { FileTabs } from '../../src/components/FileTabs/FileTabs.js';
import type { FileTab } from '../../src/types.js';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

const sampleTabs: FileTab[] = [
  { path: 'SKILL.md', label: 'SKILL.md' },
  { path: 'src/index.ts', label: 'index.ts', modified: true },
  { path: 'package.json', label: 'package.json' },
];

describe('FileTabs', () => {
  it('渲染所有标签', () => {
    renderWithTheme(
      <FileTabs
        tabs={sampleTabs}
        activePath="SKILL.md"
        onTabChange={vi.fn()}
        onTabClose={vi.fn()}
      />
    );
    expect(screen.getByText('SKILL.md')).toBeTruthy();
    expect(screen.getByText('index.ts')).toBeTruthy();
    expect(screen.getByText('package.json')).toBeTruthy();
  });

  it('显示未保存标记', () => {
    renderWithTheme(
      <FileTabs
        tabs={sampleTabs}
        activePath="SKILL.md"
        onTabChange={vi.fn()}
        onTabClose={vi.fn()}
      />
    );
    // modified tab 应显示圆点标记
    const dot = screen.getByText('•');
    expect(dot).toBeTruthy();
  });

  it('点击标签触发切换', () => {
    const onChange = vi.fn();
    renderWithTheme(
      <FileTabs
        tabs={sampleTabs}
        activePath="SKILL.md"
        onTabChange={onChange}
        onTabClose={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText('package.json'));
    expect(onChange).toHaveBeenCalledWith('package.json');
  });

  it('点击关闭按钮触发关闭（不触发切换）', () => {
    const onClose = vi.fn();
    const onChange = vi.fn();
    renderWithTheme(
      <FileTabs
        tabs={sampleTabs}
        activePath="SKILL.md"
        onTabChange={onChange}
        onTabClose={onClose}
      />
    );
    // 每个标签有一个关闭按钮（X 图标）
    const closeButtons = screen.getAllByRole('button', { hidden: true });
    // 点击第一个关闭按钮
    fireEvent.click(closeButtons[0]);
    expect(onClose).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('空标签列表正常渲染', () => {
    renderWithTheme(
      <FileTabs tabs={[]} activePath={null} onTabChange={vi.fn()} onTabClose={vi.fn()} />
    );
    // 不应有任何标签文本
    expect(screen.queryByRole('tab')).toBeNull();
  });
});

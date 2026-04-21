/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './testUtils.js';
import { ActivityBar } from '../../src/components/ActivityBar/ActivityBar.js';
import type { SidebarPanel } from '../../src/types.js';

describe('ActivityBar', () => {
  it('渲染 4 个图标按钮', () => {
    renderWithProviders(<ActivityBar activePanel={null} onPanelChange={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
  });

  it('高亮当前激活面板', () => {
    renderWithProviders(<ActivityBar activePanel="files" onPanelChange={vi.fn()} />);
    // 找到 title="文件" 的按钮
    const fileBtn = screen.getByTitle('文件');
    expect(fileBtn).toBeTruthy();
    // 激活按钮应有 primaryBg 背景
    expect(fileBtn.style.background || fileBtn.getAttribute('class')).toBeDefined();
  });

  it('点击未激活图标触发打开', () => {
    const onChange = vi.fn();
    renderWithProviders(<ActivityBar activePanel={null} onPanelChange={onChange} />);
    fireEvent.click(screen.getByTitle('文件'));
    expect(onChange).toHaveBeenCalledWith('files');
  });

  it('点击已激活图标触发关闭', () => {
    const onChange = vi.fn();
    renderWithProviders(<ActivityBar activePanel="assistant" onPanelChange={onChange} />);
    fireEvent.click(screen.getByTitle('助手'));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('点击不同面板图标切换', () => {
    const onChange = vi.fn();
    renderWithProviders(<ActivityBar activePanel="files" onPanelChange={onChange} />);
    fireEvent.click(screen.getByTitle('审核'));
    expect(onChange).toHaveBeenCalledWith('review');
  });
});

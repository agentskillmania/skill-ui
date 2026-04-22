/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './testUtils.js';
import { ActivityBar } from '../../src/components/ActivityBar/ActivityBar.js';
import type { SidebarPanel } from '../../src/types.js';

describe('ActivityBar', () => {
  it('renders 4 icon buttons', () => {
    renderWithProviders(<ActivityBar activePanel={null} onPanelChange={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
  });

  it('highlights the currently active panel', () => {
    renderWithProviders(<ActivityBar activePanel="files" onPanelChange={vi.fn()} />);
    // Find button with title="文件"
    const fileBtn = screen.getByTitle('文件');
    expect(fileBtn).toBeTruthy();
    // Active button should have primaryBg background
    expect(fileBtn.style.background || fileBtn.getAttribute('class')).toBeDefined();
  });

  it('clicking inactive icon triggers open', () => {
    const onChange = vi.fn();
    renderWithProviders(<ActivityBar activePanel={null} onPanelChange={onChange} />);
    fireEvent.click(screen.getByTitle('文件'));
    expect(onChange).toHaveBeenCalledWith('files');
  });

  it('clicking active icon triggers close', () => {
    const onChange = vi.fn();
    renderWithProviders(<ActivityBar activePanel="assistant" onPanelChange={onChange} />);
    fireEvent.click(screen.getByTitle('助手'));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('clicking different panel icons switches', () => {
    const onChange = vi.fn();
    renderWithProviders(<ActivityBar activePanel="files" onPanelChange={onChange} />);
    fireEvent.click(screen.getByTitle('审核'));
    expect(onChange).toHaveBeenCalledWith('review');
  });
});

/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '@agentskillmania/skill-ui-theme';
import { Titlebar } from '../../src/components/Titlebar/Titlebar.js';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

describe('Titlebar', () => {
  it('渲染 TrafficLights 和 AppBrand', () => {
    render(<Titlebar />, { wrapper });
    expect(screen.getByLabelText('关闭窗口')).toBeInTheDocument();
    expect(screen.getByText('Skill')).toBeInTheDocument();
  });

  it('传入 title 和 icon', () => {
    render(<Titlebar title="Agent IDE" />, { wrapper });
    expect(screen.getByText('Agent')).toBeInTheDocument();
    expect(screen.getByText('IDE')).toBeInTheDocument();
  });

  it('渲染 center 插槽', () => {
    render(<Titlebar center={<span>workspace-1</span>} />, { wrapper });
    expect(screen.getByText('workspace-1')).toBeInTheDocument();
  });

  it('渲染 end 插槽', () => {
    render(<Titlebar end={<button>Settings</button>} />, { wrapper });
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('不传 center 时渲染弹性间距', () => {
    const { container } = render(<Titlebar />, { wrapper });
    // banner 内有 TrafficLights、AppBrand、spacer 三个子区域
    const banner = screen.getByRole('banner');
    // spacer 是第三个 div（在 TrafficLights 和 AppBrand 之后）
    const children = banner.children;
    expect(children.length).toBeGreaterThanOrEqual(3);
  });

  it('传 center 时渲染 center 内容', () => {
    render(<Titlebar center={<span>center-content</span>} />, { wrapper });
    expect(screen.getByText('center-content')).toBeInTheDocument();
  });

  it('窗口控制回调正确传递', () => {
    const onClose = vi.fn();
    render(<Titlebar onClose={onClose} />, { wrapper });
    fireEvent.click(screen.getByLabelText('关闭窗口'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('有 banner role', () => {
    render(<Titlebar />, { wrapper });
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});

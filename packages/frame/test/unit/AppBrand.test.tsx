/** @jsxImportSource @emotion/react */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '@agentskillmania/skill-ui-theme';
import { AppBrand } from '../../src/components/AppBrand/AppBrand.js';
import { Zap } from 'lucide-react';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

describe('AppBrand', () => {
  it('默认显示 "Skill Studio"', () => {
    render(<AppBrand />, { wrapper });
    expect(screen.getByText('Skill')).toBeInTheDocument();
    expect(screen.getByText('Studio')).toBeInTheDocument();
  });

  it('自定义标题正确拆分单词', () => {
    render(<AppBrand title="Agent IDE" />, { wrapper });
    expect(screen.getByText('Agent')).toBeInTheDocument();
    expect(screen.getByText('IDE')).toBeInTheDocument();
  });

  it('单个单词不渲染第二部分', () => {
    render(<AppBrand title="Studio" />, { wrapper });
    expect(screen.getByText('Studio')).toBeInTheDocument();
    // 不应有主色 span
    const container = screen.getByText('Studio').parentElement!;
    const spans = container.querySelectorAll('span');
    expect(spans).toHaveLength(1);
  });

  it('三个单词时后两个合并', () => {
    render(<AppBrand title="My App Name" />, { wrapper });
    expect(screen.getByText('My')).toBeInTheDocument();
    expect(screen.getByText('App Name')).toBeInTheDocument();
  });

  it('传入 icon 时渲染图标', () => {
    const { container } = render(<AppBrand icon={<Zap size={16} data-testid="icon" />} />, {
      wrapper,
    });
    expect(container.querySelector('[data-testid="icon"]')).toBeInTheDocument();
  });

  it('不传 icon 时不渲染图标容器', () => {
    const { container } = render(<AppBrand />, { wrapper });
    // icon 容器有 width: 18px 的内联样式
    const iconContainer = container.querySelector('div > div:first-child');
    // 只有根 div，不应有 icon 子 div
    const root = container.firstChild as HTMLElement;
    expect(root.children).toHaveLength(1); // 只有文字 span
  });
});

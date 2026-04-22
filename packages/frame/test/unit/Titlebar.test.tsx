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
  it('renders TrafficLights and AppBrand', () => {
    render(<Titlebar />, { wrapper });
    expect(screen.getByLabelText('关闭窗口')).toBeInTheDocument();
    expect(screen.getByText('Skill')).toBeInTheDocument();
  });

  it('passes title and icon', () => {
    render(<Titlebar title="Agent IDE" />, { wrapper });
    expect(screen.getByText('Agent')).toBeInTheDocument();
    expect(screen.getByText('IDE')).toBeInTheDocument();
  });

  it('renders center slot', () => {
    render(<Titlebar center={<span>workspace-1</span>} />, { wrapper });
    expect(screen.getByText('workspace-1')).toBeInTheDocument();
  });

  it('renders end slot', () => {
    render(<Titlebar end={<button>Settings</button>} />, { wrapper });
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders flexible spacing when center is not passed', () => {
    const { container } = render(<Titlebar />, { wrapper });
    // banner contains TrafficLights, AppBrand, spacer three sub-areas
    const banner = screen.getByRole('banner');
    // spacer 是第三个 div（在 TrafficLights 和 AppBrand 之后）
    const children = banner.children;
    expect(children.length).toBeGreaterThanOrEqual(3);
  });

  it('renders center content when center is passed', () => {
    render(<Titlebar center={<span>center-content</span>} />, { wrapper });
    expect(screen.getByText('center-content')).toBeInTheDocument();
  });

  it('window control callbacks correctly passed', () => {
    const onClose = vi.fn();
    render(<Titlebar onClose={onClose} />, { wrapper });
    fireEvent.click(screen.getByLabelText('关闭窗口'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('has banner role', () => {
    render(<Titlebar />, { wrapper });
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});

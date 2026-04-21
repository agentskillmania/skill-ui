/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '@agentskillmania/skill-ui-theme';
import { AppFrame } from '../../src/components/AppFrame/AppFrame.js';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

describe('AppFrame', () => {
  it('渲染 children 作为 Portal 内容', () => {
    render(<AppFrame>Portal 内容</AppFrame>, { wrapper });
    expect(screen.getByText('Portal 内容')).toBeInTheDocument();
  });

  it('渲染 Titlebar 带默认品牌', () => {
    render(<AppFrame>content</AppFrame>, { wrapper });
    expect(screen.getByText('Skill')).toBeInTheDocument();
    expect(screen.getByText('Studio')).toBeInTheDocument();
  });

  it('传递 title 和 icon 给 Titlebar', () => {
    render(<AppFrame title="Agent IDE">content</AppFrame>, { wrapper });
    expect(screen.getByText('Agent')).toBeInTheDocument();
    expect(screen.getByText('IDE')).toBeInTheDocument();
  });

  it('传递 titlebarCenter 给 Titlebar', () => {
    render(<AppFrame titlebarCenter={<span>workspace-selector</span>}>content</AppFrame>, {
      wrapper,
    });
    expect(screen.getByText('workspace-selector')).toBeInTheDocument();
  });

  it('传递 titlebarEnd 给 Titlebar', () => {
    render(<AppFrame titlebarEnd={<button>Settings</button>}>content</AppFrame>, { wrapper });
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('窗口控制回调正确传递到 TrafficLights', () => {
    const onClose = vi.fn();
    render(<AppFrame onClose={onClose}>content</AppFrame>, { wrapper });
    fireEvent.click(screen.getByLabelText('关闭窗口'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('有 banner 区域和内容区域', () => {
    render(<AppFrame>content</AppFrame>, { wrapper });
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('content')).toBeInTheDocument();
  });
});

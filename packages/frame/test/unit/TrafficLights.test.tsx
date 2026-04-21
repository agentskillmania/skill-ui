/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '@agentskillmania/skill-ui-theme';
import { TrafficLights } from '../../src/components/TrafficLights/TrafficLights.js';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

describe('TrafficLights', () => {
  it('渲染三个按钮', () => {
    render(<TrafficLights />, { wrapper });
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  it('关闭按钮有正确的 aria-label', () => {
    render(<TrafficLights />, { wrapper });
    expect(screen.getByLabelText('关闭窗口')).toBeInTheDocument();
  });

  it('最小化按钮有正确的 aria-label', () => {
    render(<TrafficLights />, { wrapper });
    expect(screen.getByLabelText('最小化窗口')).toBeInTheDocument();
  });

  it('最大化按钮默认显示"最大化窗口"', () => {
    render(<TrafficLights />, { wrapper });
    expect(screen.getByLabelText('最大化窗口')).toBeInTheDocument();
  });

  it('isMaximized=true 时显示"还原窗口"', () => {
    render(<TrafficLights isMaximized />, { wrapper });
    expect(screen.getByLabelText('还原窗口')).toBeInTheDocument();
  });

  it('点击关闭按钮触发 onClose', () => {
    const onClose = vi.fn();
    render(<TrafficLights onClose={onClose} />, { wrapper });
    fireEvent.click(screen.getByLabelText('关闭窗口'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('点击最小化按钮触发 onMinimize', () => {
    const onMinimize = vi.fn();
    render(<TrafficLights onMinimize={onMinimize} />, { wrapper });
    fireEvent.click(screen.getByLabelText('最小化窗口'));
    expect(onMinimize).toHaveBeenCalledOnce();
  });

  it('点击最大化按钮触发 onMaximize', () => {
    const onMaximize = vi.fn();
    render(<TrafficLights onMaximize={onMaximize} />, { wrapper });
    fireEvent.click(screen.getByLabelText('最大化窗口'));
    expect(onMaximize).toHaveBeenCalledOnce();
  });

  it('不传回调时点击不报错', () => {
    render(<TrafficLights />, { wrapper });
    expect(() => fireEvent.click(screen.getByLabelText('关闭窗口'))).not.toThrow();
  });
});

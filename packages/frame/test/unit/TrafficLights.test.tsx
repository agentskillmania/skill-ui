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
  it('renders three buttons', () => {
    render(<TrafficLights />, { wrapper });
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  it('close button has correct aria-label', () => {
    render(<TrafficLights />, { wrapper });
    expect(screen.getByLabelText('关闭窗口')).toBeInTheDocument();
  });

  it('minimize button has correct aria-label', () => {
    render(<TrafficLights />, { wrapper });
    expect(screen.getByLabelText('最小化窗口')).toBeInTheDocument();
  });

  it('maximize button defaults to "maximize window"', () => {
    render(<TrafficLights />, { wrapper });
    expect(screen.getByLabelText('最大化窗口')).toBeInTheDocument();
  });

  it('shows "restore window" when isMaximized=true', () => {
    render(<TrafficLights isMaximized />, { wrapper });
    expect(screen.getByLabelText('还原窗口')).toBeInTheDocument();
  });

  it('clicking close button triggers onClose', () => {
    const onClose = vi.fn();
    render(<TrafficLights onClose={onClose} />, { wrapper });
    fireEvent.click(screen.getByLabelText('关闭窗口'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('clicking minimize button triggers onMinimize', () => {
    const onMinimize = vi.fn();
    render(<TrafficLights onMinimize={onMinimize} />, { wrapper });
    fireEvent.click(screen.getByLabelText('最小化窗口'));
    expect(onMinimize).toHaveBeenCalledOnce();
  });

  it('clicking maximize button triggers onMaximize', () => {
    const onMaximize = vi.fn();
    render(<TrafficLights onMaximize={onMaximize} />, { wrapper });
    fireEvent.click(screen.getByLabelText('最大化窗口'));
    expect(onMaximize).toHaveBeenCalledOnce();
  });

  it('clicking does not throw when callbacks are not passed', () => {
    render(<TrafficLights />, { wrapper });
    expect(() => fireEvent.click(screen.getByLabelText('关闭窗口'))).not.toThrow();
  });
});

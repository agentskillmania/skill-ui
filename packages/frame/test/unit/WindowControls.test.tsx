/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '@agentskillmania/skill-ui-theme';
import { WindowControls } from '../../src/components/WindowControls/WindowControls.js';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

describe('WindowControls', () => {
  it('renders three buttons', () => {
    render(<WindowControls />, { wrapper });
    expect(screen.getByLabelText('Minimize')).toBeInTheDocument();
    expect(screen.getByLabelText('Maximize')).toBeInTheDocument();
    expect(screen.getByLabelText('Close')).toBeInTheDocument();
  });

  it('shows restore icon when maximized', () => {
    render(<WindowControls isMaximized />, { wrapper });
    expect(screen.getByLabelText('Restore')).toBeInTheDocument();
    expect(screen.queryByLabelText('Maximize')).not.toBeInTheDocument();
  });

  it('calls onMinimize', () => {
    const onMinimize = vi.fn();
    render(<WindowControls onMinimize={onMinimize} />, { wrapper });
    fireEvent.click(screen.getByLabelText('Minimize'));
    expect(onMinimize).toHaveBeenCalledOnce();
  });

  it('calls onMaximize', () => {
    const onMaximize = vi.fn();
    render(<WindowControls onMaximize={onMaximize} />, { wrapper });
    fireEvent.click(screen.getByLabelText('Maximize'));
    expect(onMaximize).toHaveBeenCalledOnce();
  });

  it('calls onClose', () => {
    const onClose = vi.fn();
    render(<WindowControls onClose={onClose} />, { wrapper });
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

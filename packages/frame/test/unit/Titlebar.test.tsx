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
  it('renders TrafficLights and AppBrand on macOS', () => {
    render(<Titlebar platform="macos" />, { wrapper });
    expect(screen.getByLabelText('关闭窗口')).toBeInTheDocument();
    expect(screen.getByText('Skill')).toBeInTheDocument();
  });

  it('renders WindowControls and AppBrand on Windows', () => {
    render(<Titlebar platform="windows" />, { wrapper });
    expect(screen.getByLabelText('Close')).toBeInTheDocument();
    expect(screen.getByText('Skill')).toBeInTheDocument();
    // macOS close button should not be present
    expect(screen.queryByLabelText('关闭窗口')).not.toBeInTheDocument();
  });

  it('passes title and icon', () => {
    render(<Titlebar platform="macos" title="Agent IDE" />, { wrapper });
    expect(screen.getByText('Agent')).toBeInTheDocument();
    expect(screen.getByText('IDE')).toBeInTheDocument();
  });

  it('renders center slot on macOS', () => {
    render(<Titlebar platform="macos" center={<span>workspace-1</span>} />, { wrapper });
    expect(screen.getByText('workspace-1')).toBeInTheDocument();
  });

  it('renders center slot on Windows', () => {
    render(<Titlebar platform="windows" center={<span>windows-center</span>} />, { wrapper });
    expect(screen.getByText('windows-center')).toBeInTheDocument();
  });

  it('renders end slot on macOS', () => {
    render(<Titlebar platform="macos" end={<button>Settings</button>} />, { wrapper });
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders end slot on Windows', () => {
    render(<Titlebar platform="windows" end={<button>WinSettings</button>} />, { wrapper });
    expect(screen.getByText('WinSettings')).toBeInTheDocument();
  });

  it('window control callbacks correctly passed on macOS', () => {
    const onClose = vi.fn();
    render(<Titlebar platform="macos" onClose={onClose} />, { wrapper });
    fireEvent.click(screen.getByLabelText('关闭窗口'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('window control callbacks correctly passed on Windows', () => {
    const onClose = vi.fn();
    render(<Titlebar platform="windows" onClose={onClose} />, { wrapper });
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('has banner role', () => {
    render(<Titlebar />, { wrapper });
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});

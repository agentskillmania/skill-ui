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
  it('renders children as Portal content', () => {
    render(<AppFrame>Portal 内容</AppFrame>, { wrapper });
    expect(screen.getByText('Portal 内容')).toBeInTheDocument();
  });

  it('renders Titlebar with default brand', () => {
    render(<AppFrame>content</AppFrame>, { wrapper });
    expect(screen.getByText('Skill')).toBeInTheDocument();
    expect(screen.getByText('Studio')).toBeInTheDocument();
  });

  it('passes title and icon to Titlebar', () => {
    render(<AppFrame title="Agent IDE">content</AppFrame>, { wrapper });
    expect(screen.getByText('Agent')).toBeInTheDocument();
    expect(screen.getByText('IDE')).toBeInTheDocument();
  });

  it('passes titlebarCenter to Titlebar', () => {
    render(<AppFrame titlebarCenter={<span>workspace-selector</span>}>content</AppFrame>, {
      wrapper,
    });
    expect(screen.getByText('workspace-selector')).toBeInTheDocument();
  });

  it('passes titlebarEnd to Titlebar', () => {
    render(<AppFrame titlebarEnd={<button>Settings</button>}>content</AppFrame>, { wrapper });
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('window control callbacks correctly passed to TrafficLights', () => {
    const onClose = vi.fn();
    render(<AppFrame onClose={onClose}>content</AppFrame>, { wrapper });
    fireEvent.click(screen.getByLabelText('关闭窗口'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('has banner area and content area', () => {
    render(<AppFrame>content</AppFrame>, { wrapper });
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('content')).toBeInTheDocument();
  });
});

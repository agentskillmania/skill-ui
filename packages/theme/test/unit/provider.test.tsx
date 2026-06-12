/**
 * ThemeProvider and useTheme tests
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, renderHook, screen } from '@testing-library/react';
import {
  ThemeProvider,
  useTheme,
  createEmotionTheme,
} from '../../src/provider/index.js';

afterEach(() => {
  document.documentElement.removeAttribute('data-theme');
});

describe('ThemeProvider', () => {
  it('renders children with default light mode', () => {
    render(
      <ThemeProvider>
        <div>hello</div>
      </ThemeProvider>
    );
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('sets data-theme attribute to light by default', () => {
    render(
      <ThemeProvider>
        <div />
      </ThemeProvider>
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('sets data-theme attribute to dark when defaultMode is dark', () => {
    render(
      <ThemeProvider defaultMode="dark">
        <div />
      </ThemeProvider>
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('uses controlled mode when mode prop is provided', () => {
    const { rerender } = render(
      <ThemeProvider mode="light">
        <div />
      </ThemeProvider>
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    rerender(
      <ThemeProvider mode="dark">
        <div />
      </ThemeProvider>
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('calls onModeChange when setMode is called', () => {
    let ctx: { mode: string; setMode: (m: 'light' | 'dark') => void } | null = null;
    render(
      <ThemeProvider mode="light" onModeChange={onModeChange}>
        {(c) => {
          ctx = c as typeof ctx;
          return <div />;
        }}
      </ThemeProvider>
    );
    ctx!.setMode('dark');
    expect(onModeChange).toHaveBeenCalledWith('dark');
  });

  it('supports children as function pattern', () => {
    render(
      <ThemeProvider>
        {(ctx) => <div data-testid="fn-child">{ctx.mode}</div>}
      </ThemeProvider>
    );
    expect(screen.getByTestId('fn-child').textContent).toBe('light');
  });

  it('children function receives theme context with setMode', () => {
    render(
      <ThemeProvider defaultMode="dark">
        {(ctx) => (
          <div>
            <span data-testid="mode">{ctx.mode}</span>
            <span data-testid="has-theme">{typeof ctx.theme}</span>
            <span data-testid="has-setmode">{typeof ctx.setMode}</span>
          </div>
        )}
      </ThemeProvider>
    );
    expect(screen.getByTestId('mode').textContent).toBe('dark');
    expect(screen.getByTestId('has-setmode').textContent).toBe('function');
  });

  it('does not update internal state when controlled mode is set', () => {
    // setMode should NOT change data-theme because mode is controlled externally
    let ctx: { mode: string; setMode: (m: 'light' | 'dark') => void } | null = null;
    const onModeChange = vi.fn();
    render(
      <ThemeProvider mode="light" onModeChange={onModeChange}>
        {(c) => {
          ctx = c as typeof ctx;
          return <div />;
        }}
      </ThemeProvider>
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    // Call setMode — should NOT change data-theme since mode is controlled
    ctx!.setMode('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    // But onModeChange should still be called
    expect(onModeChange).toHaveBeenCalledWith('dark');
  });
});

describe('useTheme', () => {
  it('returns theme object with mode', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
    });
    expect(result.current.mode).toBe('light');
    expect(result.current.color).toBeDefined();
    expect(result.current.spacing).toBeDefined();
  });

  it('returns dark theme when ThemeProvider is dark', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider defaultMode="dark">{children}</ThemeProvider>
      ),
    });
    expect(result.current.mode).toBe('dark');
  });
});

describe('createEmotionTheme', () => {
  it('returns light theme', () => {
    const theme = createEmotionTheme('light');
    expect(theme.mode).toBe('light');
  });

  it('returns dark theme', () => {
    const theme = createEmotionTheme('dark');
    expect(theme.mode).toBe('dark');
  });
});

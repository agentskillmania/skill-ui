/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { ConfigProvider } from 'antd';
import {
  lightTheme,
  lightAntdConfig,
  darkTheme,
  darkAntdConfig,
} from '@agentskillmania/skill-ui-theme';
import type { ReactNode } from 'react';
import React from 'react';
import { CodeEditor } from '../../src/editor-area/CodeEditor.js';

// ── Monaco mock ──
// mock-prefixed variables are accessible inside vi.mock (Vitest hoisting magic)

/** Controls what object the mock Monaco passes to onMount */
let mockEditorInstance: unknown = null;

/** Stores the Ctrl+S handler registered by CodeEditor so tests can invoke it */
let mockCtrlSHandler: (() => void) | null = null;

const mockAddCommand = vi.fn((_keybinding: number, handler: () => void) => {
  mockCtrlSHandler = handler;
});

vi.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: (props: any) => {
    React.useEffect(() => {
      if (props.onMount) {
        props.onMount(mockEditorInstance, {});
      }
    }, [props.onMount]);

    return (
      <div data-testid="monaco-editor">
        <span data-testid="monaco-language">{props.defaultLanguage}</span>
        <span data-testid="monaco-theme">{props.theme}</span>
        <span data-testid="monaco-value">{props.value ?? props.defaultValue}</span>
        <span data-testid="monaco-readonly">{String(props.options?.readOnly)}</span>
        <button data-testid="mock-edit" onClick={() => props.onChange?.('edited')}>
          edit-defined
        </button>
        <button data-testid="mock-edit-undefined" onClick={() => props.onChange?.(undefined)}>
          edit-undefined
        </button>
      </div>
    );
  },
}));

// ── Test wrappers ──

function DarkWrapper({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={darkAntdConfig}>
      <ThemeProvider theme={darkTheme}>{children}</ThemeProvider>
    </ConfigProvider>
  );
}

function LightWrapper({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={lightAntdConfig}>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </ConfigProvider>
  );
}

function renderWithTheme(ui: React.ReactElement, dark = false) {
  return render(ui, { wrapper: dark ? DarkWrapper : LightWrapper });
}

// ── Tests ──

describe('CodeEditor', () => {
  const defaultProps = {
    content: 'const x = 1;',
    filePath: 'src/index.ts',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCtrlSHandler = null;
    mockEditorInstance = { addCommand: mockAddCommand };
  });

  // ── Basic rendering ──

  it('renders Monaco editor with correct language from filePath', () => {
    renderWithTheme(<CodeEditor {...defaultProps} />);
    expect(screen.getByTestId('monaco-editor')).toBeTruthy();
    expect(screen.getByTestId('monaco-language').textContent).toBe('typescript');
  });

  it('falls back to plaintext for unknown file extension', () => {
    renderWithTheme(<CodeEditor {...defaultProps} filePath="unknown.xyz" />);
    expect(screen.getByTestId('monaco-language').textContent).toBe('plaintext');
  });

  // ── Theme branch (theme.mode === 'dark') ──

  it('uses vs theme when theme mode is light', () => {
    renderWithTheme(<CodeEditor {...defaultProps} />);
    expect(screen.getByTestId('monaco-theme').textContent).toBe('vs');
  });

  it('uses vs-dark theme when theme mode is dark', () => {
    renderWithTheme(<CodeEditor {...defaultProps} />, true);
    expect(screen.getByTestId('monaco-theme').textContent).toBe('vs-dark');
  });

  // ── readOnly ?? false branch ──

  it('passes readOnly true to Monaco when readOnly prop is true', () => {
    renderWithTheme(<CodeEditor {...defaultProps} readOnly={true} />);
    expect(screen.getByTestId('monaco-readonly').textContent).toBe('true');
  });

  it('defaults readOnly to false when readOnly prop is not provided', () => {
    renderWithTheme(<CodeEditor {...defaultProps} />);
    expect(screen.getByTestId('monaco-readonly').textContent).toBe('false');
  });

  // ── value ?? '' branch (onChange undefined handling) ──

  it('calls onChange with the editor value when value is defined', () => {
    const onChange = vi.fn();
    renderWithTheme(<CodeEditor {...defaultProps} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('mock-edit'));
    expect(onChange).toHaveBeenCalledWith('edited');
  });

  it('calls onChange with empty string when Monaco passes undefined', () => {
    const onChange = vi.fn();
    renderWithTheme(<CodeEditor {...defaultProps} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('mock-edit-undefined'));
    expect(onChange).toHaveBeenCalledWith('');
  });

  // ── Ctrl+S command ──

  it('registers Ctrl+S save command on mount', () => {
    renderWithTheme(<CodeEditor {...defaultProps} />);
    expect(mockAddCommand).toHaveBeenCalledWith(2097, expect.any(Function));
  });

  it('calls onSave with current content when Ctrl+S fires and onSave is provided', () => {
    const onSave = vi.fn();
    renderWithTheme(<CodeEditor {...defaultProps} content="content to save" onSave={onSave} />);
    mockCtrlSHandler?.();
    expect(onSave).toHaveBeenCalledWith('content to save');
  });

  it('does not crash when Ctrl+S fires but onSave is not provided', () => {
    renderWithTheme(<CodeEditor {...defaultProps} />);
    expect(() => mockCtrlSHandler?.()).not.toThrow();
  });

  // ── handleMount falsy / non-object branches ──

  it('does not crash when editor instance is null', () => {
    mockEditorInstance = null;
    expect(() => renderWithTheme(<CodeEditor {...defaultProps} />)).not.toThrow();
    expect(mockAddCommand).not.toHaveBeenCalled();
  });

  it('does not crash when editor instance is a non-object value', () => {
    mockEditorInstance = 42;
    expect(() => renderWithTheme(<CodeEditor {...defaultProps} />)).not.toThrow();
    expect(mockAddCommand).not.toHaveBeenCalled();
  });

  it('does not crash when editor object lacks addCommand method', () => {
    mockEditorInstance = { noAddCommand: true };
    expect(() => renderWithTheme(<CodeEditor {...defaultProps} />)).not.toThrow();
    expect(mockAddCommand).not.toHaveBeenCalled();
  });
});

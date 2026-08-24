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

/** loader.config 指向本地引擎的调用记录(CodeEditor 懒加载时触发) */
const mockLoaderConfig = vi.fn();

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
  loader: { config: mockLoaderConfig },
}));

// 引擎本体 mock 成空对象:loader.config 只需要拿到一个引用
vi.mock('monaco-editor', () => ({}));

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

  // ── Lazy loading ──

  it('shows a loading placeholder before the engine import resolves', () => {
    renderWithTheme(<CodeEditor {...defaultProps} />);
    // 同步渲染阶段 import 的 .then 尚未执行,loading 占位可见
    // (editor 测试环境合入真实 zh-CN 文案,断言翻译后的文本)
    expect(screen.getByText('加载编辑器…')).toBeInTheDocument();
  });

  it('loads the engine lazily and points the loader at the local monaco (no CDN)', async () => {
    renderWithTheme(<CodeEditor {...defaultProps} />);
    expect(await screen.findByTestId('monaco-editor')).toBeInTheDocument();
    expect(mockLoaderConfig).toHaveBeenCalledWith({ monaco: {} });
  });

  // ── Basic rendering ──

  it('renders Monaco editor with correct language from filePath', async () => {
    renderWithTheme(<CodeEditor {...defaultProps} />);
    expect((await screen.findByTestId('monaco-language')).textContent).toBe('typescript');
  });

  it('falls back to plaintext for unknown file extension', async () => {
    renderWithTheme(<CodeEditor {...defaultProps} filePath="unknown.xyz" />);
    expect((await screen.findByTestId('monaco-language')).textContent).toBe('plaintext');
  });

  // ── Theme branch (theme.mode === 'dark') ──

  it('uses vs theme when theme mode is light', async () => {
    renderWithTheme(<CodeEditor {...defaultProps} />);
    expect((await screen.findByTestId('monaco-theme')).textContent).toBe('vs');
  });

  it('uses vs-dark theme when theme mode is dark', async () => {
    renderWithTheme(<CodeEditor {...defaultProps} />, true);
    expect((await screen.findByTestId('monaco-theme')).textContent).toBe('vs-dark');
  });

  // ── readOnly ?? false branch ──

  it('passes readOnly true to Monaco when readOnly prop is true', async () => {
    renderWithTheme(<CodeEditor {...defaultProps} readOnly={true} />);
    expect((await screen.findByTestId('monaco-readonly')).textContent).toBe('true');
  });

  it('defaults readOnly to false when readOnly prop is not provided', async () => {
    renderWithTheme(<CodeEditor {...defaultProps} />);
    expect((await screen.findByTestId('monaco-readonly')).textContent).toBe('false');
  });

  // ── value ?? '' branch (onChange undefined handling) ──

  it('calls onChange with the editor value when value is defined', async () => {
    const onChange = vi.fn();
    renderWithTheme(<CodeEditor {...defaultProps} onChange={onChange} />);
    fireEvent.click(await screen.findByTestId('mock-edit'));
    expect(onChange).toHaveBeenCalledWith('edited');
  });

  it('calls onChange with empty string when Monaco passes undefined', async () => {
    const onChange = vi.fn();
    renderWithTheme(<CodeEditor {...defaultProps} onChange={onChange} />);
    fireEvent.click(await screen.findByTestId('mock-edit-undefined'));
    expect(onChange).toHaveBeenCalledWith('');
  });

  // ── Ctrl+S command ──

  it('registers Ctrl+S save command on mount', async () => {
    renderWithTheme(<CodeEditor {...defaultProps} />);
    await screen.findByTestId('monaco-editor');
    expect(mockAddCommand).toHaveBeenCalledWith(2097, expect.any(Function));
  });

  it('calls onSave with current content when Ctrl+S fires and onSave is provided', async () => {
    const onSave = vi.fn();
    renderWithTheme(<CodeEditor {...defaultProps} content="content to save" onSave={onSave} />);
    await screen.findByTestId('monaco-editor');
    mockCtrlSHandler?.();
    expect(onSave).toHaveBeenCalledWith('content to save');
  });

  it('does not crash when Ctrl+S fires but onSave is not provided', async () => {
    renderWithTheme(<CodeEditor {...defaultProps} />);
    await screen.findByTestId('monaco-editor');
    expect(() => mockCtrlSHandler?.()).not.toThrow();
  });
});

/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '@agentskillmania/skill-ui-theme';
import { EditorArea } from '../../src/components/EditorArea/EditorArea.js';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

// Mock Crepe 以避免完整渲染
vi.mock('@milkdown/crepe', () => ({
  Crepe: vi
    .fn()
    .mockImplementation(({ root, defaultValue }: { root: HTMLElement; defaultValue: string }) => {
      root.innerHTML = `<div class="milkdown">${defaultValue}</div>`;
      return {
        create: vi
          .fn()
          .mockResolvedValue({
            status: 'Created',
            action: vi.fn(),
            view: { setProps: vi.fn() },
            ctx: { get: vi.fn() },
          }),
        destroy: vi.fn().mockResolvedValue({}),
        on: vi.fn(),
        getMarkdown: vi.fn(() => ''),
        setReadonly: vi.fn(),
        get editor() {
          return {
            status: 'Created',
            action: vi.fn(),
            view: { setProps: vi.fn() },
            ctx: { get: vi.fn() },
          };
        },
      };
    }),
  __esModule: true,
}));

vi.mock('@milkdown/crepe/theme/frame.css', () => ({}));

vi.mock('@milkdown/utils', () => ({
  replaceAll: vi.fn((md: string) => (_ctx: unknown) => md),
}));

// Mock Monaco Editor 以避免完整渲染
vi.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: ({ value, defaultValue, onChange }: any) => (
    <div data-testid="monaco-editor">
      <span data-testid="monaco-value">{value ?? defaultValue}</span>
      <button onClick={() => onChange?.('edited')}>mock-edit</button>
    </div>
  ),
}));

describe('EditorArea', () => {
  const defaultProps = {
    content: 'console.log("hello")',
    filePath: 'src/index.ts',
    mode: 'code' as const,
    onChange: vi.fn(),
  };

  it('code 模式渲染 Monaco', () => {
    renderWithTheme(<EditorArea {...defaultProps} />);
    expect(screen.getByTestId('monaco-editor')).toBeTruthy();
  });

  it('wysiwyg 模式渲染 VisualEditor（Crepe 容器）', () => {
    const { container } = renderWithTheme(
      <EditorArea {...defaultProps} mode="wysiwyg" content="# 标题\n\n段落" />
    );
    expect(screen.queryByTestId('monaco-editor')).toBeNull();
    expect(container.querySelector('[data-crepe-root]')).toBeTruthy();
  });

  it('传递 content 到子编辑器', () => {
    renderWithTheme(<EditorArea {...defaultProps} />);
    expect(screen.getByTestId('monaco-value').textContent).toBe('console.log("hello")');
  });
});

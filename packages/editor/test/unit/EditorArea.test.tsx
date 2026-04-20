/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '@agentskillmania/skill-ui-theme';
import { EditorArea } from '../../src/components/EditorArea/EditorArea.js';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

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

  it('wysiwyg 模式渲染 VisualEditor', () => {
    const { container } = renderWithTheme(
      <EditorArea {...defaultProps} mode="wysiwyg" content="# 标题\n\n段落" />
    );
    // VisualEditor 使用 dangerouslySetInnerHTML，Monaco 不应出现
    expect(screen.queryByTestId('monaco-editor')).toBeNull();
    // h1 应被渲染（markdownToHtml 将 # 标题 转为 <h1>）
    const h1 = container.querySelector('h1');
    expect(h1).toBeTruthy();
    expect(h1?.textContent).toContain('标题');
  });

  it('传递 content 到子编辑器', () => {
    renderWithTheme(<EditorArea {...defaultProps} />);
    expect(screen.getByTestId('monaco-value').textContent).toBe('console.log("hello")');
  });
});

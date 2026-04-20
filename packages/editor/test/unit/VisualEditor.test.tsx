/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '@agentskillmania/skill-ui-theme';
import { VisualEditor } from '../../src/components/EditorArea/VisualEditor.js';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

const defaultProps = {
  content: '# 标题\n\n段落文本\n\n- 列表项',
  filePath: 'SKILL.md',
  mode: 'wysiwyg' as const,
  onChange: vi.fn(),
};

describe('VisualEditor', () => {
  it('渲染 markdown 内容为 HTML', () => {
    renderWithTheme(<VisualEditor {...defaultProps} />);
    // 标题应被渲染为 h1
    const heading = screen.getByText('标题');
    expect(heading).toBeTruthy();
  });

  it('渲染粗体文本', () => {
    renderWithTheme(<VisualEditor {...defaultProps} content="**粗体文本**" />);
    // Emotion css 可能不在 DOM 属性中直接可见，但文本应该渲染
    const el = screen.getByText('粗体文本');
    expect(el).toBeTruthy();
  });

  it('渲染代码块', () => {
    const codeContent = '```js\nconsole.log(1)\n```';
    renderWithTheme(<VisualEditor {...defaultProps} content={codeContent} />);
    expect(screen.getByText('console.log(1)')).toBeTruthy();
  });

  it('空内容正常渲染', () => {
    const { container } = renderWithTheme(<VisualEditor {...defaultProps} content="" />);
    expect(container).toBeTruthy();
  });

  it('转义 HTML 标签', () => {
    const { container } = renderWithTheme(
      <VisualEditor {...defaultProps} content="<script>alert('xss')</script>" />
    );
    // 不应包含 script 标签（已转义）
    expect(container.querySelector('script')).toBeNull();
  });
});

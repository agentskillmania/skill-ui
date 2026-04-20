/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '@agentskillmania/skill-ui-theme';
import { StatusBar } from '../../src/components/StatusBar/StatusBar.js';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

describe('StatusBar', () => {
  it('显示文件路径', () => {
    renderWithTheme(
      <StatusBar
        filePath="src/index.ts"
        editMode="code"
        cursorPosition={null}
        onEditModeChange={vi.fn()}
      />
    );
    expect(screen.getByText('src/index.ts')).toBeTruthy();
  });

  it('无文件路径时不显示', () => {
    renderWithTheme(
      <StatusBar filePath={null} editMode="code" cursorPosition={null} onEditModeChange={vi.fn()} />
    );
    expect(screen.queryByText('src/index.ts')).toBeNull();
  });

  it('显示未保存标记', () => {
    renderWithTheme(
      <StatusBar
        filePath="src/index.ts"
        editMode="code"
        cursorPosition={null}
        isDirty
        onEditModeChange={vi.fn()}
      />
    );
    expect(screen.getByText('未保存')).toBeTruthy();
  });

  it('显示光标位置', () => {
    renderWithTheme(
      <StatusBar
        filePath="src/index.ts"
        editMode="code"
        cursorPosition={{ line: 5, column: 12 }}
        onEditModeChange={vi.fn()}
      />
    );
    expect(screen.getByText(/行 5/)).toBeTruthy();
    expect(screen.getByText(/列 12/)).toBeTruthy();
  });

  it('code 模式显示"预览"按钮', () => {
    renderWithTheme(
      <StatusBar
        filePath="src/index.ts"
        editMode="code"
        cursorPosition={null}
        onEditModeChange={vi.fn()}
      />
    );
    expect(screen.getByText('预览')).toBeTruthy();
  });

  it('wysiwyg 模式显示"代码"按钮', () => {
    renderWithTheme(
      <StatusBar
        filePath="src/index.ts"
        editMode="wysiwyg"
        cursorPosition={null}
        onEditModeChange={vi.fn()}
      />
    );
    expect(screen.getByText('代码')).toBeTruthy();
  });

  it('点击模式切换按钮触发回调', () => {
    const onChange = vi.fn();
    renderWithTheme(
      <StatusBar
        filePath="src/index.ts"
        editMode="code"
        cursorPosition={null}
        onEditModeChange={onChange}
      />
    );
    fireEvent.click(screen.getByText('预览'));
    expect(onChange).toHaveBeenCalledWith('wysiwyg');
  });
});

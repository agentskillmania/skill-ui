/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './testUtils.js';
import { StatusBar } from '../../src/components/StatusBar/StatusBar.js';

describe('StatusBar', () => {
  it('显示文件路径', () => {
    renderWithProviders(
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
    renderWithProviders(
      <StatusBar filePath={null} editMode="code" cursorPosition={null} onEditModeChange={vi.fn()} />
    );
    expect(screen.queryByText('src/index.ts')).toBeNull();
  });

  it('显示未保存标记', () => {
    renderWithProviders(
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
    renderWithProviders(
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
    renderWithProviders(
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
    renderWithProviders(
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
    renderWithProviders(
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

  it('wysiwyg 模式点击按钮切换到 code', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <StatusBar
        filePath="src/index.ts"
        editMode="wysiwyg"
        cursorPosition={null}
        onEditModeChange={onChange}
      />
    );
    fireEvent.click(screen.getByText('代码'));
    expect(onChange).toHaveBeenCalledWith('code');
  });

  it('光标位置为 null 时不显示', () => {
    renderWithProviders(
      <StatusBar
        filePath="src/index.ts"
        editMode="code"
        cursorPosition={null}
        onEditModeChange={vi.fn()}
      />
    );
    expect(screen.queryByText(/行 \d+/)).toBeNull();
    expect(screen.queryByText(/列 \d+/)).toBeNull();
  });

  it('isDirty 为 false 时不显示未保存标记', () => {
    renderWithProviders(
      <StatusBar
        filePath="src/index.ts"
        editMode="code"
        cursorPosition={null}
        isDirty={false}
        onEditModeChange={vi.fn()}
      />
    );
    expect(screen.queryByText('未保存')).toBeNull();
  });
});

/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './testUtils.js';
import { StatusBar } from '../../src/components/StatusBar/StatusBar.js';

describe('StatusBar', () => {
  it('displays file path', () => {
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

  it('does not display when no file path', () => {
    renderWithProviders(
      <StatusBar filePath={null} editMode="code" cursorPosition={null} onEditModeChange={vi.fn()} />
    );
    expect(screen.queryByText('src/index.ts')).toBeNull();
  });

  it('shows unsaved indicator', () => {
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

  it('displays cursor position', () => {
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

  it('shows "预览" button in code mode', () => {
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

  it('shows "代码" button in wysiwyg mode', () => {
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

  it('clicking mode switch button triggers callback', () => {
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

  it('clicking button switches to code in wysiwyg mode', () => {
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

  it('does not display when cursor position is null', () => {
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

  it('does not show unsaved indicator when isDirty is false', () => {
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

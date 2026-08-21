/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './testUtils.js';
import { StatusBar } from '../../src/sections/status-bar/StatusBar.js';

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
    expect(screen.getByText('src/index.ts')).toBeInTheDocument();
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
    expect(screen.getByText('未保存')).toBeInTheDocument();
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
    expect(screen.getByText(/行 5/)).toBeInTheDocument();
    expect(screen.getByText(/列 12/)).toBeInTheDocument();
  });

  it('shows "预览" button for markdown files in code mode', () => {
    renderWithProviders(
      <StatusBar
        filePath="SKILL.md"
        editMode="code"
        cursorPosition={null}
        onEditModeChange={vi.fn()}
      />
    );
    expect(screen.getByText('预览')).toBeInTheDocument();
  });

  it('does not show "预览" button for non-markdown files', () => {
    renderWithProviders(
      <StatusBar
        filePath="src/index.ts"
        editMode="code"
        cursorPosition={null}
        onEditModeChange={vi.fn()}
      />
    );
    expect(screen.queryByText('预览')).toBeNull();
  });

  it('shows "代码" button for markdown files in wysiwyg mode', () => {
    renderWithProviders(
      <StatusBar
        filePath="SKILL.md"
        editMode="wysiwyg"
        cursorPosition={null}
        onEditModeChange={vi.fn()}
      />
    );
    expect(screen.getByText('代码')).toBeInTheDocument();
  });

  it('does not show mode button for non-markdown files in wysiwyg mode', () => {
    renderWithProviders(
      <StatusBar
        filePath="src/index.ts"
        editMode="wysiwyg"
        cursorPosition={null}
        onEditModeChange={vi.fn()}
      />
    );
    expect(screen.queryByText('代码')).toBeNull();
  });

  it('clicking mode switch button triggers callback', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <StatusBar
        filePath="SKILL.md"
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
        filePath="SKILL.md"
        editMode="wysiwyg"
        cursorPosition={null}
        onEditModeChange={onChange}
      />
    );
    fireEvent.click(screen.getByText('代码'));
    expect(onChange).toHaveBeenCalledWith('code');
  });

  it('does not display cursor position when null', () => {
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

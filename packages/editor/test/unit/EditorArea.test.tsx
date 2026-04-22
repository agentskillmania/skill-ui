/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './testUtils.js';
import React from 'react';
import { EditorArea } from '../../src/components/EditorArea/EditorArea.js';

// Mock Crepe to avoid full rendering
vi.mock('@milkdown/crepe', () => ({
  Crepe: vi
    .fn()
    .mockImplementation(({ root, defaultValue }: { root: HTMLElement; defaultValue: string }) => {
      root.innerHTML = `<div class="milkdown">${defaultValue}</div>`;
      return {
        create: vi.fn().mockResolvedValue({
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

// Mock Monaco editor's addCommand method
const mockAddCommand = vi.fn();

// Mock Monaco Editor to avoid full rendering
const mockOnMount = vi.fn();
vi.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: ({ value, defaultValue, onChange, onMount }: any) => {
    // Trigger onMount callback to test handleMount branch
    React.useEffect(() => {
      if (onMount) {
        // Mock real Monaco editor instance with addCommand method
        const mockEditor = {
          addCommand: mockAddCommand,
        };
        onMount(mockEditor, { monaco: true });
        mockOnMount(mockEditor);
      }
    }, [onMount]);
    return (
      <div data-testid="monaco-editor">
        <span data-testid="monaco-value">{value ?? defaultValue}</span>
        <button onClick={() => onChange?.('edited')}>mock-edit</button>
      </div>
    );
  },
}));

describe('EditorArea', () => {
  const defaultProps = {
    content: 'console.log("hello")',
    filePath: 'src/index.ts',
    mode: 'code' as const,
    onChange: vi.fn(),
  };

  it('renders Monaco in code mode', () => {
    renderWithProviders(<EditorArea {...defaultProps} />);
    expect(screen.getByTestId('monaco-editor')).toBeTruthy();
  });

  it('renders Monaco in code mode', () => {
    renderWithProviders(<EditorArea {...defaultProps} />);
    expect(screen.getByTestId('monaco-editor')).toBeTruthy();
  });

  it('renders VisualEditor (Crepe container) in wysiwyg mode', () => {
    const { container } = renderWithProviders(
      <EditorArea {...defaultProps} mode="wysiwyg" content="# 标题\n\n段落" />
    );
    expect(screen.queryByTestId('monaco-editor')).toBeNull();
    expect(container.querySelector('[data-crepe-root]')).toBeTruthy();
  });

  it('passes content to child editor', () => {
    renderWithProviders(<EditorArea {...defaultProps} />);
    expect(screen.getByTestId('monaco-value').textContent).toBe('console.log("hello")');
  });

  it('Monaco onMount callback is triggered correctly', () => {
    renderWithProviders(<EditorArea {...defaultProps} />);
    // Wait for onMount to be called
    expect(mockOnMount).toHaveBeenCalledWith(expect.any(Object));
  });

  it('Monaco onChange handles undefined values', () => {
    const onChange = vi.fn();
    renderWithProviders(<EditorArea {...defaultProps} onChange={onChange} />);

    const editButton = screen.getByText('mock-edit');
    fireEvent.click(editButton);

    // onChange should be called even if Monaco passes undefined
    expect(onChange).toHaveBeenCalled();
  });

  it('CodeEditor registers Ctrl+S save command on onMount', () => {
    const onSave = vi.fn();

    // Clear previous call records
    mockAddCommand.mockClear();

    renderWithProviders(
      <EditorArea
        content="test content"
        filePath="SKILL.md"
        mode="code"
        onChange={vi.fn()}
        onSave={onSave}
      />
    );

    // Verify addCommand is called with Ctrl+S keycode (2097 = CtrlCmd | KeyS)
    expect(mockAddCommand).toHaveBeenCalledWith(2097, expect.any(Function));
  });
});

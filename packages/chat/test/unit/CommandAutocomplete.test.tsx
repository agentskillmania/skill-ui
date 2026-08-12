/**
 * CommandAutocomplete component unit tests
 */
import { describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { CommandAutocomplete } from '../../src/commands/CommandAutocomplete.js';
import type { CommandAutocompleteRef } from '../../src/commands/CommandAutocomplete.js';
import type { ChatCommand } from '../../src/types.js';
import { ThemeWrapper } from './testUtils.js';

const mockCommands: ChatCommand[] = [
  { id: '1', label: '搜索', command: 'search', description: '搜索知识库', group: '工具' },
  { id: '2', label: '分析', command: 'analyze', description: '分析数据', group: '工具' },
  { id: '3', label: '新建', command: 'new', description: '创建新文件' },
];

function renderAutocomplete(
  overrides: { commands?: ChatCommand[]; inputValue?: string; trigger?: string } = {}
) {
  const onCommand = vi.fn();
  const cmdRef = createRef<CommandAutocompleteRef>();
  const result = render(
    <ThemeWrapper>
      <CommandAutocomplete
        ref={cmdRef}
        commands={overrides.commands ?? mockCommands}
        onCommand={onCommand}
        inputValue={overrides.inputValue ?? ''}
        trigger={overrides.trigger}
      >
        <div data-testid="child">子元素</div>
      </CommandAutocomplete>
    </ThemeWrapper>
  );
  return { onCommand, cmdRef, ...result };
}

/** Build a minimal keydown event the ref handler accepts. */
function key(key: string) {
  return { key, preventDefault: vi.fn() } as unknown as KeyboardEvent;
}

const panel = () => document.querySelector('[data-testid="cmd-panel"]');
const items = () => Array.from(document.querySelectorAll<HTMLElement>('[data-testid="cmd-item"]'));
const activeIndex = () => items().find((el) => el.hasAttribute('data-active'))?.dataset.index;

describe('CommandAutocomplete', () => {
  it('only renders child element when input does not start with trigger', () => {
    renderAutocomplete({ inputValue: 'hello' });
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(panel()).toBeNull();
  });

  it('shows panel when input starts with trigger', async () => {
    renderAutocomplete({ inputValue: '/' });
    await waitFor(() => {
      expect(items().length).toBeGreaterThan(0);
    });
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('empty command list only renders child element', () => {
    renderAutocomplete({ commands: [], inputValue: '/' });
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(panel()).toBeNull();
  });

  it('custom trigger', () => {
    renderAutocomplete({ inputValue: '>', trigger: '>' });
    // ">" starts with the trigger but list is non-empty → panel should show
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('selecting command triggers onCommand with correct command object', async () => {
    const { onCommand } = renderAutocomplete({ inputValue: '/' });

    const searchItem = await waitFor(() => {
      const item = items().find((el) => el.textContent?.includes('搜索'));
      expect(item).toBeDefined();
      return item!;
    });

    await userEvent.click(searchItem);
    expect(onCommand).toHaveBeenCalledWith(expect.objectContaining({ id: '1', command: 'search' }));
  });

  it('typing search term filters commands to matching subset', async () => {
    renderAutocomplete({ inputValue: '/搜' });

    await waitFor(() => {
      const matched = items();
      expect(matched.length).toBe(1);
      expect(matched[0].textContent).toContain('搜索');
      expect(matched.some((el) => el.textContent?.includes('分析'))).toBe(false);
      expect(matched.some((el) => el.textContent?.includes('新建'))).toBe(false);
    });
  });

  it('no match shows empty state', async () => {
    renderAutocomplete({ inputValue: '/xyz' });

    await waitFor(() => {
      expect(document.querySelector('[data-testid="cmd-empty"]')).not.toBeNull();
    });
  });

  it('child element is always visible', () => {
    renderAutocomplete({ inputValue: '/search' });
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('ArrowDown moves active highlight forward across groups', async () => {
    const { cmdRef } = renderAutocomplete({ inputValue: '/' });
    await waitFor(() => expect(items().length).toBe(3));

    // flatItems = [搜索, 分析, 新建] across two groups
    expect(activeIndex()).toBe('0');
    act(() => cmdRef.current!.handleKeyDown(key('ArrowDown')));
    expect(activeIndex()).toBe('1');
    act(() => cmdRef.current!.handleKeyDown(key('ArrowDown')));
    expect(activeIndex()).toBe('2');
  });

  it('ArrowDown wraps around to first item', async () => {
    const { cmdRef } = renderAutocomplete({ inputValue: '/' });
    await waitFor(() => expect(items().length).toBe(3));

    act(() => cmdRef.current!.handleKeyDown(key('ArrowDown')));
    act(() => cmdRef.current!.handleKeyDown(key('ArrowDown')));
    act(() => cmdRef.current!.handleKeyDown(key('ArrowDown'))); // wraps 2 -> 0
    expect(activeIndex()).toBe('0');
  });

  it('ArrowUp moves active highlight backward and wraps', async () => {
    const { cmdRef } = renderAutocomplete({ inputValue: '/' });
    await waitFor(() => expect(items().length).toBe(3));

    act(() => cmdRef.current!.handleKeyDown(key('ArrowUp'))); // wraps 0 -> 2
    expect(activeIndex()).toBe('2');
    act(() => cmdRef.current!.handleKeyDown(key('ArrowUp'))); // 2 -> 1
    expect(activeIndex()).toBe('1');
  });

  it('hovering an item syncs active highlight', async () => {
    renderAutocomplete({ inputValue: '/' });
    await waitFor(() => expect(items().length).toBe(3));

    fireEvent.mouseEnter(items()[2]);
    expect(activeIndex()).toBe('2');
  });

  it('Enter selects the active command and returns false to block submit', async () => {
    const { cmdRef, onCommand } = renderAutocomplete({ inputValue: '/' });
    await waitFor(() => expect(items().length).toBe(3));

    act(() => cmdRef.current!.handleKeyDown(key('ArrowDown'))); // active = 分析
    const e = key('Enter');
    let res: boolean | undefined;
    act(() => {
      res = cmdRef.current!.handleKeyDown(e);
    });
    expect(onCommand).toHaveBeenCalledWith(
      expect.objectContaining({ id: '2', command: 'analyze' })
    );
    expect(e.preventDefault).toHaveBeenCalled();
    expect(res).toBe(false);
  });

  it('Escape closes the panel without clearing the input', async () => {
    const { cmdRef } = renderAutocomplete({ inputValue: '/' });
    await waitFor(() => expect(panel()).not.toBeNull());

    act(() => cmdRef.current!.handleKeyDown(key('Escape')));
    await waitFor(() => expect(panel()).toBeNull());
  });

  it('click outside closes the panel', async () => {
    renderAutocomplete({ inputValue: '/' });
    await waitFor(() => expect(panel()).not.toBeNull());

    // A click landing outside both the wrapper and the panel dismisses it.
    fireEvent.mouseDown(document.body);
    await waitFor(() => expect(panel()).toBeNull());
  });
});

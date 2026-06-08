/**
 * CommandAutocomplete component unit tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommandAutocomplete } from '../../src/commands/CommandAutocomplete.js';
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
  const result = render(
    <ThemeWrapper>
      <CommandAutocomplete
        commands={overrides.commands ?? mockCommands}
        onCommand={onCommand}
        inputValue={overrides.inputValue ?? ''}
        trigger={overrides.trigger}
      >
        <div data-testid="child">子元素</div>
      </CommandAutocomplete>
    </ThemeWrapper>
  );
  return { onCommand, ...result };
}

describe('CommandAutocomplete', () => {
  it('only renders child element when input does not start with trigger', () => {
    renderAutocomplete({ inputValue: 'hello' });
    expect(screen.getByTestId('child')).toBeInTheDocument();
    // No dropdown should be visible
    expect(document.querySelectorAll('.ant-dropdown').length).toBe(0);
  });

  it('shows dropdown when input starts with trigger', async () => {
    renderAutocomplete({ inputValue: '/' });
    // antd Dropdown renders portal after a tick
    await waitFor(() => {
      const menuItems = document.querySelectorAll('.ant-dropdown-menu-item');
      expect(menuItems.length).toBeGreaterThan(0);
    });
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('empty command list only renders child element', () => {
    renderAutocomplete({ commands: [], inputValue: '/' });
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('custom trigger', () => {
    renderAutocomplete({ inputValue: '>', trigger: '>' });
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('selecting command triggers onCommand with correct command object', async () => {
    const { onCommand } = renderAutocomplete({ inputValue: '/' });

    // Wait for dropdown to render
    const menuItem = await waitFor(() => {
      const item = Array.from(
        document.querySelectorAll('[role="menuitem"], .ant-dropdown-menu-item')
      ).find((el) => el.textContent?.includes('搜索'));
      expect(item).toBeDefined();
      return item!;
    });

    await userEvent.click(menuItem);
    expect(onCommand).toHaveBeenCalledWith(expect.objectContaining({ id: '1', command: 'search' }));
  });

  it('typing search term filters commands to matching subset', async () => {
    renderAutocomplete({ inputValue: '/搜' });

    await waitFor(() => {
      const menuItems = Array.from(document.querySelectorAll('.ant-dropdown-menu-item'));
      // Only "搜索" matches the filter term "搜"
      expect(menuItems.length).toBe(1);
      expect(menuItems[0].textContent).toContain('搜索');
      // "分析" and "新建" should be filtered out
      expect(menuItems.some((el) => el.textContent?.includes('分析'))).toBe(false);
      expect(menuItems.some((el) => el.textContent?.includes('新建'))).toBe(false);
    });
  });

  it('no match shows empty state', async () => {
    renderAutocomplete({ inputValue: '/xyz' });

    await waitFor(() => {
      // antd Dropdown shows the "no match" disabled item
      const disabledItems = document.querySelectorAll('.ant-dropdown-menu-item-disabled');
      expect(disabledItems.length).toBeGreaterThan(0);
    });
  });

  it('child element is always visible', () => {
    renderAutocomplete({ inputValue: '/search' });
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});

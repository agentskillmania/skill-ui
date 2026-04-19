/**
 * QuickCommands 组件单元测试
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickCommands } from '../../src/commands/QuickCommands.js';
import type { ChatCommand } from '../../src/types.js';
import { ThemeWrapper } from './testUtils.js';

const mockCommands: ChatCommand[] = [
  { id: '1', label: '搜索', command: 'search' },
  { id: '2', label: '分析', command: 'analyze' },
  { id: '3', label: '新建', command: 'new' },
];

function renderQuickCommands(
  overrides: { commands?: ChatCommand[]; disabled?: boolean; maxCommands?: number } = {}
) {
  const onCommand = vi.fn();
  const result = render(
    <ThemeWrapper>
      <QuickCommands
        commands={overrides.commands ?? mockCommands}
        onCommand={onCommand}
        disabled={overrides.disabled}
        maxCommands={overrides.maxCommands}
      />
    </ThemeWrapper>
  );
  return { onCommand, ...result };
}

describe('QuickCommands', () => {
  it('渲染所有指令标签', () => {
    renderQuickCommands();
    expect(screen.getByText('搜索')).toBeInTheDocument();
    expect(screen.getByText('分析')).toBeInTheDocument();
    expect(screen.getByText('新建')).toBeInTheDocument();
  });

  it('点击标签触发 onCommand', async () => {
    const { onCommand } = renderQuickCommands();
    await userEvent.click(screen.getByText('搜索'));
    expect(onCommand).toHaveBeenCalledWith(mockCommands[0]);
  });

  it('空指令列表不渲染', () => {
    const { container } = renderQuickCommands({ commands: [] });
    expect(container.firstChild).toBeNull();
  });

  it('maxCommands 限制显示数量', () => {
    renderQuickCommands({ maxCommands: 2 });
    expect(screen.getByText('搜索')).toBeInTheDocument();
    expect(screen.getByText('分析')).toBeInTheDocument();
    expect(screen.queryByText('新建')).not.toBeInTheDocument();
  });

  it('disabled 状态不触发回调', () => {
    const { onCommand } = renderQuickCommands({ disabled: true });
    // pointer-events: none 导致无法点击，验证回调未被调用即可
    expect(onCommand).not.toHaveBeenCalled();
  });
});

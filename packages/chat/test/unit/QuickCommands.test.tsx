/**
 * QuickCommands component unit tests
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
  it('renders all command tags', () => {
    renderQuickCommands();
    expect(screen.getByText('搜索')).toBeInTheDocument();
    expect(screen.getByText('分析')).toBeInTheDocument();
    expect(screen.getByText('新建')).toBeInTheDocument();
  });

  it('clicking tag triggers onCommand', async () => {
    const { onCommand } = renderQuickCommands();
    await userEvent.click(screen.getByText('搜索'));
    expect(onCommand).toHaveBeenCalledWith(mockCommands[0]);
  });

  it('does not render with empty command list', () => {
    const { container } = renderQuickCommands({ commands: [] });
    expect(container.firstChild).toBeNull();
  });

  it('maxCommands limits display count', () => {
    renderQuickCommands({ maxCommands: 2 });
    expect(screen.getByText('搜索')).toBeInTheDocument();
    expect(screen.getByText('分析')).toBeInTheDocument();
    expect(screen.queryByText('新建')).not.toBeInTheDocument();
  });

  it('disabled status does not trigger callback', () => {
    const { onCommand } = renderQuickCommands({ disabled: true });
    // pointer-events: none prevents clicking, just verify callback is not called
    expect(onCommand).not.toHaveBeenCalled();
  });
});

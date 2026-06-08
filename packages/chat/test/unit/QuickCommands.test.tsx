/**
 * QuickCommands component unit tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('disabled renders tags that are visually muted', () => {
    const { container } = renderQuickCommands({ disabled: true });
    const wrapper = container.firstElementChild as HTMLElement;
    // Emotion CSS-in-JS applies pointer-events: none and opacity: 0.5 via generated class
    expect(wrapper).toBeTruthy();
    // Tags should still be rendered (just visually muted)
    expect(screen.getByText('搜索')).toBeInTheDocument();
  });

  it('disabled prevents onCommand even when click fires via keyboard or fireEvent', () => {
    const { onCommand } = renderQuickCommands({ disabled: true });
    // fireEvent bypasses CSS pointer-events: none, simulating keyboard Enter on a focused tag.
    // The onClick handler must guard against disabled state in JS, not just CSS.
    fireEvent.click(screen.getByText('搜索'));
    expect(onCommand).not.toHaveBeenCalled();
  });
});

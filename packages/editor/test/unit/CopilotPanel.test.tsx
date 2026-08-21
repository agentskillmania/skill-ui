/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './testUtils.js';
import { CopilotPanel } from '../../src/panels/copilot/CopilotPanel.js';
import type { ChatCommand } from '@agentskillmania/skill-ui-chat';

// Mock chat components to avoid full render dependencies
vi.mock('@agentskillmania/skill-ui-chat', () => ({
  MessageList: ({ messages }: { messages: Array<{ id: string }> }) => (
    <div data-testid="message-list">{messages.length} 条消息</div>
  ),
  ChatInput: ({
    onSubmit,
    placeholder,
    onChange,
  }: {
    onSubmit: (msg: string) => void;
    placeholder: string;
    onChange?: (value: string) => void;
  }) => (
    <div>
      <span>{placeholder}</span>
      <button onClick={() => onSubmit('test message')}>发送</button>
      <button onClick={() => onChange?.('changed value')}>change</button>
    </div>
  ),
}));

const sampleCommands: ChatCommand[] = [
  { id: 'generate', label: '生成技能', command: '帮我生成一个' },
  { id: 'search', label: '查找类似', command: '帮我查找类似的技能' },
];

describe('CopilotPanel', () => {
  it('displays quick command hint when no messages', () => {
    renderWithProviders(<CopilotPanel commands={sampleCommands} />);
    expect(screen.getByText('向 Copilot 提问，或使用快捷命令')).toBeInTheDocument();
    expect(screen.getByText('生成技能')).toBeInTheDocument();
    expect(screen.getByText('查找类似')).toBeInTheDocument();
  });

  it('clicking quick command triggers onSend', () => {
    const onSend = vi.fn();
    renderWithProviders(<CopilotPanel commands={sampleCommands} onSend={onSend} />);
    fireEvent.click(screen.getByText('生成技能'));
    expect(onSend).toHaveBeenCalledWith('帮我生成一个');
  });

  it('displays MessageList when there are messages', () => {
    renderWithProviders(
      <CopilotPanel messages={[{ id: '1', role: 'user', content: '你好' } as any]} />
    );
    expect(screen.getByTestId('message-list')).toBeInTheDocument();
  });

  it('renders input box', () => {
    renderWithProviders(<CopilotPanel />);
    expect(screen.getByText('向 Copilot 提问...')).toBeInTheDocument();
  });

  it('clicking send button triggers onSend', () => {
    const onSend = vi.fn();
    renderWithProviders(<CopilotPanel onSend={onSend} />);
    fireEvent.click(screen.getByText('发送'));
    expect(onSend).toHaveBeenCalledWith('test message');
  });

  it('does not show command buttons when no quick commands', () => {
    renderWithProviders(<CopilotPanel />);
    expect(screen.queryByText('生成技能')).toBeNull();
  });

  it('calls onInputChange when input value changes', () => {
    const onInputChange = vi.fn();
    renderWithProviders(<CopilotPanel onInputChange={onInputChange} />);
    fireEvent.click(screen.getByText('change'));
    expect(onInputChange).toHaveBeenCalledWith('changed value');
  });

  it('does not throw when onChange fallback is triggered (no onInputChange)', () => {
    renderWithProviders(<CopilotPanel />);
    expect(() => {
      fireEvent.click(screen.getByText('change'));
    }).not.toThrow();
  });
});

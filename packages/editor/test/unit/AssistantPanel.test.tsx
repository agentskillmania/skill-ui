/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './testUtils.js';
import { AssistantPanel } from '../../src/components/AssistantPanel/AssistantPanel.js';
import type { ChatCommand } from '@agentskillmania/skill-ui-chat';

// Mock chat components to avoid full render dependencies
vi.mock('@agentskillmania/skill-ui-chat', () => ({
  MessageList: ({ messages }: { messages: Array<{ id: string }> }) => (
    <div data-testid="message-list">{messages.length} 条消息</div>
  ),
  ChatInput: ({
    onSubmit,
    placeholder,
  }: {
    onSubmit: (msg: string) => void;
    placeholder: string;
  }) => (
    <div>
      <span>{placeholder}</span>
      <button onClick={() => onSubmit('test message')}>发送</button>
    </div>
  ),
}));

const sampleCommands: ChatCommand[] = [
  { id: 'generate', label: '生成技能', command: '帮我生成一个' },
  { id: 'search', label: '查找类似', command: '帮我查找类似的技能' },
];

describe('AssistantPanel', () => {
  it('displays quick command hint when no messages', () => {
    renderWithProviders(<AssistantPanel commands={sampleCommands} />);
    expect(screen.getByText('向 AI 助手提问，或使用快捷命令')).toBeTruthy();
    expect(screen.getByText('生成技能')).toBeTruthy();
    expect(screen.getByText('查找类似')).toBeTruthy();
  });

  it('clicking quick command triggers onSend', () => {
    const onSend = vi.fn();
    renderWithProviders(<AssistantPanel commands={sampleCommands} onSend={onSend} />);
    fireEvent.click(screen.getByText('生成技能'));
    expect(onSend).toHaveBeenCalledWith('帮我生成一个');
  });

  it('displays MessageList when there are messages', () => {
    renderWithProviders(
      <AssistantPanel messages={[{ id: '1', role: 'user', content: '你好' } as any]} />
    );
    expect(screen.getByTestId('message-list')).toBeTruthy();
  });

  it('renders input box', () => {
    renderWithProviders(<AssistantPanel />);
    expect(screen.getByText('向助手提问...')).toBeTruthy();
  });

  it('clicking send button triggers onSend', () => {
    const onSend = vi.fn();
    renderWithProviders(<AssistantPanel onSend={onSend} />);
    fireEvent.click(screen.getByText('发送'));
    expect(onSend).toHaveBeenCalledWith('test message');
  });

  it('does not show command buttons when no quick commands', () => {
    renderWithProviders(<AssistantPanel />);
    expect(screen.queryByText('生成技能')).toBeNull();
  });
});

/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '@agentskillmania/skill-ui-theme';
import { AssistantPanel } from '../../src/components/AssistantPanel/AssistantPanel.js';
import type { ChatCommand } from '@agentskillmania/skill-ui-chat';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

// Mock chat 组件以避免完整渲染依赖
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
  it('空消息时显示快捷命令提示', () => {
    renderWithTheme(<AssistantPanel commands={sampleCommands} />);
    expect(screen.getByText('向 AI 助手提问，或使用快捷命令')).toBeTruthy();
    expect(screen.getByText('生成技能')).toBeTruthy();
    expect(screen.getByText('查找类似')).toBeTruthy();
  });

  it('点击快捷命令触发 onSend', () => {
    const onSend = vi.fn();
    renderWithTheme(<AssistantPanel commands={sampleCommands} onSend={onSend} />);
    fireEvent.click(screen.getByText('生成技能'));
    expect(onSend).toHaveBeenCalledWith('帮我生成一个');
  });

  it('有消息时显示 MessageList', () => {
    renderWithTheme(
      <AssistantPanel messages={[{ id: '1', role: 'user', content: '你好' } as any]} />
    );
    expect(screen.getByTestId('message-list')).toBeTruthy();
  });

  it('渲染输入框', () => {
    renderWithTheme(<AssistantPanel />);
    expect(screen.getByText('向助手提问...')).toBeTruthy();
  });

  it('点击发送按钮触发 onSend', () => {
    const onSend = vi.fn();
    renderWithTheme(<AssistantPanel onSend={onSend} />);
    fireEvent.click(screen.getByText('发送'));
    expect(onSend).toHaveBeenCalledWith('test message');
  });

  it('无快捷命令时不显示命令按钮', () => {
    renderWithTheme(<AssistantPanel />);
    expect(screen.queryByText('生成技能')).toBeNull();
  });
});

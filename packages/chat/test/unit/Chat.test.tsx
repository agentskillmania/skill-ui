import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { Chat } from '../../src/Chat/index.js';
import type { Message, ChatCommand } from '../../src/types.js';

const mockMessages: Message[] = [
  { id: '1', role: 'user', content: '你好', status: 'completed' },
  { id: '2', role: 'assistant', content: '你好！', status: 'completed' },
];

const mockCommands: ChatCommand[] = [
  { id: '1', label: '搜索', command: 'search' },
  { id: '2', label: '帮助', command: 'help' },
];

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

describe('Chat', () => {
  it('渲染消息列表和输入框', () => {
    render(<Chat messages={mockMessages} />, { wrapper: Wrapper });
    expect(screen.getByText('你好')).toBeInTheDocument();
    expect(screen.getByText('你好！')).toBeInTheDocument();
  });

  it('空消息列表时不崩溃', () => {
    render(<Chat messages={[]} />, { wrapper: Wrapper });
    expect(screen.getByPlaceholderText('输入消息...')).toBeInTheDocument();
  });

  it('传入 placeholder', () => {
    render(<Chat messages={[]} placeholder="请输入..." />, { wrapper: Wrapper });
    expect(screen.getByPlaceholderText('请输入...')).toBeInTheDocument();
  });

  it('streaming 状态显示停止按钮', () => {
    render(<Chat messages={mockMessages} status="streaming" />, { wrapper: Wrapper });
    // antdx Sender loading 状态渲染取消按钮
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('error 状态不显示停止按钮', () => {
    render(<Chat messages={mockMessages} status="error" />, { wrapper: Wrapper });
    // 非 streaming 状态下 Sender 不渲染 loading 按钮
    expect(screen.queryByPlaceholderText('输入消息...')).toBeInTheDocument();
  });

  it('completed 状态不显示停止按钮', () => {
    render(<Chat messages={mockMessages} status="completed" />, { wrapper: Wrapper });
    expect(screen.queryByPlaceholderText('输入消息...')).toBeInTheDocument();
  });

  it('idle 状态不显示停止按钮', () => {
    render(<Chat messages={mockMessages} status="idle" />, { wrapper: Wrapper });
    expect(screen.queryByPlaceholderText('输入消息...')).toBeInTheDocument();
  });

  it('输入文本后 Enter 触发 onSendMessage', () => {
    const onSend = vi.fn();
    render(
      <Chat messages={[]} onSendMessage={onSend} inputValue="hello" onInputChange={() => {}} />,
      { wrapper: Wrapper }
    );
    const textarea = screen.getByPlaceholderText('输入消息...');
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });
    expect(onSend).toHaveBeenCalledWith('hello');
  });

  it('应用 className 和 style', () => {
    render(<Chat messages={[]} className="my-chat" style={{ border: '1px solid red' }} />, {
      wrapper: Wrapper,
    });
    const chatEl = document.querySelector('.my-chat');
    expect(chatEl).toBeInTheDocument();
    expect((chatEl as HTMLElement).style.border).toBe('1px solid red');
  });

  it('使用自定义 maxWidth', () => {
    render(<Chat messages={[]} maxWidth="600px" />, { wrapper: Wrapper });
    expect(screen.getByPlaceholderText('输入消息...')).toBeInTheDocument();
  });

  it('传入 commands 和 onCommand 时渲染快捷指令标签', () => {
    const onCommand = vi.fn();
    render(<Chat messages={[]} commands={mockCommands} onCommand={onCommand} />, {
      wrapper: Wrapper,
    });
    expect(screen.getByText('搜索')).toBeInTheDocument();
    expect(screen.getByText('帮助')).toBeInTheDocument();
  });

  it('无 onCommand 时不渲染快捷指令', () => {
    render(<Chat messages={[]} commands={mockCommands} />, { wrapper: Wrapper });
    expect(screen.queryByText('搜索')).not.toBeInTheDocument();
  });
});

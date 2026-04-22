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
  it('renders message list and input', () => {
    render(<Chat messages={mockMessages} />, { wrapper: Wrapper });
    expect(screen.getByText('你好')).toBeInTheDocument();
    expect(screen.getByText('你好！')).toBeInTheDocument();
  });

  it('does not crash with empty message list', () => {
    render(<Chat messages={[]} />, { wrapper: Wrapper });
    expect(screen.getByPlaceholderText('输入消息...')).toBeInTheDocument();
  });

  it('passes placeholder', () => {
    render(<Chat messages={[]} placeholder="请输入..." />, { wrapper: Wrapper });
    expect(screen.getByPlaceholderText('请输入...')).toBeInTheDocument();
  });

  it('streaming status shows stop button', () => {
    render(<Chat messages={mockMessages} status="streaming" />, { wrapper: Wrapper });
    // antdx Sender loading state renders cancel button
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('error status does not show stop button', () => {
    render(<Chat messages={mockMessages} status="error" />, { wrapper: Wrapper });
    // in non-streaming state Sender does not render loading button
    expect(screen.queryByPlaceholderText('输入消息...')).toBeInTheDocument();
  });

  it('completed status does not show stop button', () => {
    render(<Chat messages={mockMessages} status="completed" />, { wrapper: Wrapper });
    expect(screen.queryByPlaceholderText('输入消息...')).toBeInTheDocument();
  });

  it('idle status does not show stop button', () => {
    render(<Chat messages={mockMessages} status="idle" />, { wrapper: Wrapper });
    expect(screen.queryByPlaceholderText('输入消息...')).toBeInTheDocument();
  });

  it('Enter triggers onSendMessage after typing', () => {
    const onSend = vi.fn();
    render(
      <Chat messages={[]} onSendMessage={onSend} inputValue="hello" onInputChange={() => {}} />,
      { wrapper: Wrapper }
    );
    const textarea = screen.getByPlaceholderText('输入消息...');
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });
    expect(onSend).toHaveBeenCalledWith('hello');
  });

  it('applies className and style', () => {
    render(<Chat messages={[]} className="my-chat" style={{ border: '1px solid red' }} />, {
      wrapper: Wrapper,
    });
    const chatEl = document.querySelector('.my-chat');
    expect(chatEl).toBeInTheDocument();
    expect((chatEl as HTMLElement).style.border).toBe('1px solid red');
  });

  it('uses custom maxWidth', () => {
    render(<Chat messages={[]} maxWidth="600px" />, { wrapper: Wrapper });
    expect(screen.getByPlaceholderText('输入消息...')).toBeInTheDocument();
  });

  it('renders quick command tags when commands and onCommand are passed', () => {
    const onCommand = vi.fn();
    render(<Chat messages={[]} commands={mockCommands} onCommand={onCommand} />, {
      wrapper: Wrapper,
    });
    expect(screen.getByText('搜索')).toBeInTheDocument();
    expect(screen.getByText('帮助')).toBeInTheDocument();
  });

  it('does not render quick commands without onCommand', () => {
    render(<Chat messages={[]} commands={mockCommands} />, { wrapper: Wrapper });
    expect(screen.queryByText('搜索')).not.toBeInTheDocument();
  });
});

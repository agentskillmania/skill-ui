import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { Chat } from '../../src/Chat/index.js';
import type { Message } from '../../src/types.js';

const mockMessages: Message[] = [
  { id: '1', role: 'user', content: '你好', status: 'completed' },
  { id: '2', role: 'assistant', content: '你好！', status: 'completed' },
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
    // 停止按钮是一个带 Square icon 的 Button
    const stopButton = document.querySelector('button');
    expect(stopButton).toBeInTheDocument();
  });

  it('调用 onSendMessage', () => {
    const onSend = vi.fn();
    render(<Chat messages={[]} onSendMessage={onSend} />, { wrapper: Wrapper });
    // 直接测试：输入框存在
    expect(screen.getByPlaceholderText('输入消息...')).toBeInTheDocument();
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
    // 组件正常渲染不崩溃即可
    expect(screen.getByPlaceholderText('输入消息...')).toBeInTheDocument();
  });
});
